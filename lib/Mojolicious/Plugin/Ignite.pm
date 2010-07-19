package Mojolicious::Plugin::Ignite;

use strict;
use warnings;

use base 'Mojolicious::Plugin';

use Ignite::Plugins;
use JSON;

our $VERSION = '1.00';

BEGIN {
    # install JSON and JSON::XS if you can!
    eval 'use JSON();';
    eval ( $@ ? 'sub HAS_JSON(){ 0 }' : 'sub HAS_JSON(){ 1 }' );
};

__PACKAGE__->attr( plugins => sub { Ignite::Plugins->new });

sub register {
    my ($plugin, $app, $cfg) = @_;

    $cfg ||= {};

    @{$plugin}{ keys %$cfg } = values %$cfg;

    my $base = $self->{base} ? $self->{base} : '/socket.io';

    # use the faster JSON module if available
    if ( HAS_JSON ) {
        $app->plugins->add_hook(
            after_build_tx => sub {
                my $tx = $_[1];
                $tx->res->json_class('JSON');
                $tx->req->json_class('JSON');
            }
        );
    }

    $app->routes->route( $base.'/websocket' )->websocket->to({ cb => sub { $plugin->_websocket( @_ ); } });
    $app->routes->route( $base )->to({ cb => sub { $plugin->_dispatch( @_ ); } });

    return $plugin;
}

sub _websocket {
    my ( $plugin, $self ) = @_;

#    return unless ( $self->tx->is_websocket );

    warn "websocket @_\n";

    my $client = SocketIOClient->new( $self );

    $self->finished(sub {
        $plugin->plugins->run_hook( 'close', $client );
    });

    $self->receive_message(sub {
        $plugin->plugins->run_hook( 'message', $client, ( decode_json( $_[1] ) )->[0] );
    });

    $plugin->plugins->run_hook( 'open', $client );

    return
}

sub _dispatch {
    my ( $plugin, $self ) = @_;

    warn "dispatch\n";
    my $method = $self->req->method;

    my $client = SocketIOClient->new( $self ); # XXX fetch existing based on cookie

    if ( $method eq 'GET' ) {
        if ( $plugin->_origin_ok( $self ) ) {
            $self->res->headers->header( 'Access-Control-Allow-Origin' => $self->req->headers->header( 'Origin' );
            if ( $self->req->headers->header('Cookie') ) {
                $self->res->headers->header( 'Access-Control-Allow-Credentials' => 'true' );
            }
        }

        # XXX move all this into client
        if ( $client->{_buffer} ) {
            $self->render_json({ messages => $self->{_buffer} });
            return;
        }

        # no msgs waiting, wait 15s
        $self->tx->pause;

        $self->{_timer} = $loop->timer( 15 => $client->{_resume} = sub {
            $loop->drop( $self->{_timer} );
            $self->tx->resume;
            $self->render_json({ messages => $self->{_buffer} || [] });
        });

        return;
    } elsif ( $method eq 'POST' ) {
        if ( my $data = $self->req->param( 'data' ) {
            $data = json_decode( $data );
            if ( $data->{messages} ) {
                foreach ( @{$data->{messages}} ) {
                    $plugin->plugins->run_hook( 'message', $client, $_ );
                }
            }
        }
        $self->render_text('ok');
        return;
    }

    $self->render_json({});
}

sub _origin_ok {
    my ( $plugin, $self ) = @_;

    return 0 unless $self->req->headers->header( 'Origin' );

    my $origin = Mojo::URL->new($self->req->headers->header( 'Origin' ));
    my $allow = $plugin->{origins} || {};

    my $host = $origin->host;
    my $port = $origin->port || 80;

    if ( $allow->{'*:*'} || $allow->{"$host:*"}
        || $allow->{"*:$port"} || $allow->{"$host:$port"} ) {
        return 1;
    }

    return 0;
}

sub _handle {
    shift->plugins->add_hook( @_ );
}

1;

package SocketIOClient;

use JSON;

use Time::HiRes;
use Digest::SHA1;

use strict;
use warnings;

my $loop,

my $clients;
BEGIN {
    $clients = {};
    $loop = Mojo::IOLoop->singleton;
}

sub new {
    my $class = shift;

    my $self = bless( {
        _id => Digest::SHA1::sha1_hex( time() + rand(100000) ),
        client => shift
    }, ref $class || $class );

    warn "new client $self with $self->{client}\n";
    $SocketIOClient::clients->{ $self->id } = $self;

    return $self;
}

sub id {
    shift->{_id};
}

sub broadcast {
    my ( $self, $msg ) = @_;

    # auto encode messages if they're not a string
    if ( ref $_[0] ) {
        $msg = encode_json( $msg );
    }

    $msg = encode_json({ messages => [ $msg ] });

    foreach ( values %{$SocketIOClient::clients} ) {
        next if $_ eq $self;
        warn "sending message $msg to $_\n";
        $_->{client}->send_message( $msg );
    }
}

sub send_message {
    my ( $self, $msg ) = @_;

    if ( ref $msg ) {
        $msg = encode_json( $msg );
    }

    $self->{client}->send_message( encode_json({ messages => [ $msg ] }) );

    return;
}

sub disconnect {
    my $self = shift;

    Mojo::IOLoop->singleton->drop( $self->{client}->tx );

    $loop->drop( $self->{_timerid} ) if $self->{_timerid};

    delete $SocketIOClient::clients->{ $self->id };

    return;
}

sub timer {
    my $self = shift;
    return $loop->timer( @_ );
}

sub heartbeat {
    my ( $self, $secs ) = @_;

    if ( $self->{_hbtimerid} ) {
        $loop->drop( delete $self->{_hbtimerid} );
    }

    my $heartbeat;
    $heartbeat = sub {
        $self->{client}->send_message('{"heartbeat":"1"}');
        $self->{_hbtimerid} = $loop->timer( $secs => $heartbeat );
    };

    $self->{_hbtimerid} = $loop->timer( $secs => $heartbeat );
}

1;

__END__

=head1 NAME

Mojolicious::Plugin::Ignite - Socket.io plugin for Mojolicious

=head1 SYNOPSIS

    # Mojolicious
    $self->plugin( 'ignite' => { base => '/socket.io' });

    # Mojolicious::Lite
    plugin 'ignite' => { base => '/socket.io' };

=head1 DESCRIPTION

L<Mojolicous::Plugin::Ignite> is a socket.io handler for Mojolicious

=head1 METHODS

L<Mojolicious::Plugin::Ignite> inherits all methods from
L<Mojolicious::Plugin> and implements the following new ones.

=head2 C<register>

    $plugin->register;

Register condition in L<Mojolicious> application.

=head1 SEE ALSO

L<Mojolicious>, L<Mojolicious::Guides>, L<http://mojolicious.org>.

=cut
