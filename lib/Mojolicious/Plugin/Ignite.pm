package Mojolicious::Plugin::Ignite;

use strict;
use warnings;

use base 'Mojolicious::Plugin';

# pubsub_client is the the app participating in pubsub
__PACKAGE__->attr([qw/ couch_url pubsub_client /]);

use Ignite::Plugins;
use MojoX::CouchDB;
use Mojo::Client;
use Mojo::IOLoop;
use Digest::SHA1 qw( sha1_hex );
use Ignite::Clients;

use MojoX::JSON;

our $VERSION = '1.00';
my $clients;

BEGIN {
    $clients = Ignite::Clients->singleton;
};

__PACKAGE__->attr([qw/ db cfg db_name /]);
__PACKAGE__->attr( json => sub { MojoX::JSON->singleton } );
__PACKAGE__->attr( plugins => sub { Ignite::Plugins->new } );
__PACKAGE__->attr( couch => sub { MojoX::CouchDB->new } );
# can't do this because it uses $json->error
#__PACKAGE__->attr( couch => sub {
#    my $c = MojoX::CouchDB->new;
#    $c->json_encoder( MojoX::JSON->singleton );
#    $c->json_decoder( MojoX::JSON->singleton );
#    return $c;
#});

sub register { return shift }

sub init {
    my ( $self, $cfg ) = @_;

    my $app = $ENV{MOJO_APP};

    return $self if $self->{configured}++;

    $self->_config( $app, $cfg ) if defined $cfg;

    die __PACKAGE__." - You must configure ignite with a couchdb url" unless $self->cfg;

#    require Data::Dumper;
#    warn Data::Dumper->Dump([$self->cfg]);

    # use the faster JSON module if available
    MojoX::JSON->setup_hook( $app );

    my $base = $self->cfg->field( 'base' ) || '/socket.io';

    # XXX detour?
    $app->routes->route( $base.'/websocket' )->websocket->to({ cb => sub { $self->_handle_websocket( @_ ); } });
    $app->routes->route( $base.'/xhr-polling' )->to({ cb => sub { $self->_handle_xhr_polling( @_ ); } });
    $app->routes->route( $base.'/xhr-polling/(*cid)' )->to({ cb => sub { $self->_handle_xhr_polling( @_ ); } });
    $app->routes->route( $base.'/xhr-polling/:cid/send' )->via( 'post' )->to({ cb => sub { $self->_handle_xhr_polling( @_ ); } });
#    $app->routes->route( $base )->to({ cb => sub { $self->_dispatch( @_ ); } });

    $self->cfg->field( heartbeat => 5000 ) unless $self->cfg->field( 'heartbeat' );

    Mojo::Client->singleton->ioloop( Mojo::IOLoop->singleton );
    Mojo::Client->singleton->keep_alive_timeout(30);

    $clients->init( $self->db_name, $self->couch_url->clone );

    return $self;
}

sub publish {
    $clients->publish( @_[ 1 .. $#_ ] );
}

sub subscribe_client {
    $clients->subscribe( @_[ 1 .. $#_ ] );
}

sub unsubscribe_client {
    $clients->unsubscribe( @_[ 1 .. $#_ ] );
}

sub subscribe {
    my ( $self, $ch, $cb ) = @_;

    $self->plugins->add_hook( $ch => $cb );

    if ( $self->pubsub_client ) {
        $self->pubsub_client->subscribe( $ch );
    } else {
        # done this way for scope
        my $client; $client = $clients->create(
            # XXX disable this after debugging
#            id => 'server',
            transport => 'server',
            is_persistent => 1,
            event_cb => sub {
                foreach ( @{$_[0]} ) {
                    $self->plugins->run_hook( $ch, $client, $_ );
                }
            }
        );
        $self->pubsub_client( $client );
        $client->subscribe( $ch );
        $client->get_data;
    }

    return;
}

# XXX hmm
sub unsubscribe {
    my ( $self, $ch ) = @_;

#    my $client = $clients->fetch( 'server' );
#    $client = $clients->create( id => 'server', transport => 'server' ) unless $client;
#    $client->unsubscribe( $ch );

    return;
}

sub broadcast {
    $clients->publish( '/meta/bcast', @_[ 1 .. $#_ ] );
}

sub _config {
    my ( $self, $app, $cfg ) = @_;

    if ( ref $cfg eq 'HASH' && $cfg->{config} ) {
        $cfg = $cfg->{config};
    }

    if ( ref $cfg eq 'ARRAY' ) {
        $self->_check_install( $cfg );
    } elsif ( $cfg =~ m/^http/i ) {
        $self->_check_install( [ $cfg ] );
#    } elsif ( ref $cfg eq 'HASH' ) {
#        # XXX remove this?
#        # merge config
#        my $doc = $self->cfg;
#        my $data = { map { ( $_ => $doc->field($_) ) } @{$doc->fields->names} };
#        @{$data}{ keys %$cfg } = values %$cfg;
#        $cfg = $data;
#
#        if ( my $mojo = $cfg->{mojo_config} ) {
#            @{$app}{keys %$mojo} = values %$mojo;
#        }
#        if ( $cfg->{config} ) {
#            $self->_check_install( ref $cfg->{config} ? $cfg->{config} : [ $cfg->{config} => 'config' ] );
#        } else {
#            die __PACKAGE__." - You must specify a config key with a couchdb url\n";
#        }
    } else {
        die __PACKAGE__." - Illegal config ".Data::Dumper->Dump([$cfg]);
    }

    return $self->cfg;
}

sub _check_install {
    my ( $self, $args ) = @_;

    my ( $couchurl, $id ) = @$args;

    my $url = Mojo::URL->new( $couchurl );
    $self->couch_url( $url );

    $self->couch->address( $url->host || '127.0.0.1' );
    $self->couch->port( $url->port || 5984 );

    my $db_name = $url->path->parts->[0];
    my $config_key = $id || $url->path->parts->[1] || 'config';

    my $db = $self->couch->new_database( $db_name );

    my $doc = $db->get_document( $config_key );

    # TODO dump MojoX::CouchDB
    if ( $doc->isa( 'MojoX::CouchDB::Error' ) ) {
        my @exists = grep { warn $_->name; $_->name eq $db_name } $self->couch->all_databases;
        $db->create unless @exists;
        $doc = $db->create_document( $config_key,
            base => '/socket.io',
            db => 'events',
            mojo_config => {
               secret => sha1_hex( join('|', $self, time(), rand(100000) ) )
            }
        );
    }

    # XXX delete all client databases on start, temporary
    foreach ( $self->couch->all_databases ) {
        $self->couch->raw_delete( $_->name ) if $_->name =~ m/^cli_/;
        if ( $_->name =~ m/^ch_/ ) {
            warn "recreating:".$_->name."\n";
            my $name = $_->name; $name =~ s/\//%2f/g;
            $self->couch->raw_delete( $name );
            $self->couch->raw_put( $name );
        }
    }
    $self->couch->raw_delete( 'clients' );
    $self->couch->raw_put( 'clients' );

    $db_name = $doc->field( 'db' ) || 'events';
    $self->db_name( $db_name );

    $self->couch->raw_delete( $db_name );
    $self->couch->raw_put( $db_name );

    $self->cfg( $doc );
}

sub _dispatch {
    my ( $self, $c ) = @_;

    warn "dispatch\n";

    $c->render_json({});
}

sub _setup_session {
    my ( $self, $c ) = @_;

    my $uid = $c->session( 'uid' );
    my $cid = $c->stash( 'cid' );
    if ( $cid =~ s/\/$// ) {
        $c->stash( cid => $cid );
    }

    # session creation
    unless ( $uid ) {
        if ( $c->param( 'cookietest' ) ) {
            $c->session( uid => $uid = sha1_hex( join( '|', $c, time(), rand(100000) ) ) );
            # XXX error
            #$c->render_text( 'Cookies must be turned on' );
            return $uid;
        }
        $c->session( uid => $uid = sha1_hex( join( '|', $c, time(), rand(100000) ) ) );
        my $base = $self->cfg->field('base') || '/socket.io';
        $c->redirect_to( sprintf( '%s/%s/%s%s', $base, $c->stash( 'transport' ), ( $cid || '' ), '?cookietest=1'  ));
        return;
    }

    return $uid;
}

sub _handle_websocket {
    my ( $self, $c ) = @_;

    return unless ( $c->tx->is_websocket );

    $c->stash( transport => 'websocket' );

    my $draft75 = $c->req->headers->header( 'Sec-WebSocket-Key1' ) ? 0 : 1;
    $c->stash( draft75 => $draft75 );
    $c->stash( draft76 => !$draft75 );

#    if ( 0 && $draft75 ) {
#        $c->res->code( 404 );
#        foreach (qw( Upgrade Sec-WebSocket-Location Sec-WebSocket-Origin )) {
#            $c->res->headers->remove( $_ );
#        }
#        $c->res->headers->header( 'Connection' => 'close' );
#        $c->render_text('Draft 75 is old');
#        return;
#    }

    # XXX does websocket upgrade allow redirection?
    my $uid = $c->session( 'uid' );
    unless ( $uid ) {
        $c->session( uid => $uid = sha1_hex( join( '|', $c, time(), rand(100000) ) ) );
    }

    my $cid = $c->stash( 'cid' );
    if ( $cid && $cid =~ m/([a-fA-F0-9]{40})/ ) {
        $c->stash( cid => $cid = lc $1 ) if $1 ne $cid;
    }

    my $client = $clients->fetch_create( $c, 'websocket' );

    $c->finished(sub {
        $self->plugins->run_hook( 'close', $client );
        $clients->remove( $client->id );
    });

    $c->receive_message(sub {
        $self->plugins->run_hook( 'message', $client, ( $self->json->decode( $_[1] ) )->[0] );
    });

    $client->send_message({ sessionid => $client->id, draft75 => $draft75 ? $self->json->true : $self->json->false });
    $self->plugins->run_hook( 'open', $client );
    $client->get_data;

    return;
}

sub _handle_xhr_polling {
    my ( $self, $c ) = @_;

    $c->stash( transport => 'xhr-polling' );

    # XXX config deny xdomain?
    if ( $self->_origin_ok( $c ) ) {
        $c->res->headers->header( 'Access-Control-Allow-Origin' => $c->req->headers->header( 'Origin' ) );
        if ( $c->req->headers->header('Cookie') ) {
            $c->res->headers->header( 'Access-Control-Allow-Credentials' => 'true' );
        }
    }

    return unless my $uid = $self->_setup_session( $c );

    my $cid = $c->stash( 'cid' );
    if ( $cid && $cid =~ m/([a-fA-F0-9]{40})/ ) {
        $c->stash( cid => $cid = lc $1 ) if $1 ne $cid;
    }

    unless ( $cid ) {
        $c->flash( newclient => 1 );
        $c->stash( newclient => 1 );
    }

    my $client = $clients->fetch_create( $c, 'xhr-polling' );

    # XXX doesn't seem to be called
    $c->finished(sub {
        my $id = $client->id;
        warn "client $id finished\n";
        $clients->remove( $id );
    });

    my $method = $c->req->method;

    if ( $method eq 'GET' ) {
        if ( $c->stash( 'newclient') ) {
            $c->render_json({ messages => [{ sessionid => $client->id }] });
            return;
        }
        if ( $c->flash( 'newclient' ) ) {
            $self->plugins->run_hook( 'open', $client );
        }

        # get data if available, or wait
        $client->get_data;
        return;
    } elsif ( $method eq 'POST' ) {
        if ( my $data = $c->req->param( 'data' ) ) {
            $data = $self->json->decode( $data );
            if ( ref $data eq 'ARRAY' ) {
                foreach ( @$data ) {
                    $self->plugins->run_hook( 'message', $client, $data );
                }
            } elsif ( ref $data eq 'HASH' ) {
                if ( $data->{messages} ) {
                    foreach ( @{$data->{messages}} ) {
                        $self->plugins->run_hook( 'message', $client, $_ );
                    }
                }
            }
        }
        $c->render_data('{"ok":true}', type => 'application/json');
        return;
    }

    $c->render_json({ messages => [] });

    return;
}

sub _origin_ok {
    my ( $self, $c ) = @_;

    return 0 unless $c->req->headers->header( 'Origin' );

    my $origin = Mojo::URL->new( $c->req->headers->header( 'Origin' ) );
    my $allow = $self->cfg->field( 'origins' ) || {};

    my $host = $origin->host;
    my $port = $origin->port || 80;

    if ( $allow->{'*:*'} || $allow->{"$host:*"}
        || $allow->{"*:$port"} || $allow->{"$host:$port"} ) {
        return 1;
    }

    return 0;
}

1;

__END__

=head1 NAME

Mojolicious::Plugin::Ignite - PubSub plugin for Mojolicious

=head1 SYNOPSIS

    # Mojolicious
    my $plugin = $self->plugin( 'ignite' );
    $plugin->init( 'http://127.0.0.1:5984/ignite' );

    # Mojolicious::Lite
    plugin 'ignite';
    ignite->init( 'http://127.0.0.1:5984/ignite/config' );

=head1 DESCRIPTION

L<Mojolicous::Plugin::Ignite> is a PubSub server using Socket.IO and Mojolicious

=head1 METHODS

L<Mojolicious::Plugin::Ignite> inherits all methods from
L<Mojolicious::Plugin> and implements the following new ones.

=head2 C<register>

    $plugin->register;

Register condition in L<Mojolicious> application.

=head1 SEE ALSO

L<Mojolicious>, L<Mojolicious::Guides>, L<http://mojolicious.org>.

=cut
