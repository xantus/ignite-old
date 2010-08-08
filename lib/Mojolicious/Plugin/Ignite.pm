package Mojolicious::Plugin::Ignite;

use strict;
use warnings;

use base 'Mojolicious::Plugin';

__PACKAGE__->attr([qw/ couch_url /]);

use Ignite::Plugins;
use MojoX::CouchDB;
use Digest::SHA1 qw( sha1_hex );
use Ignite::Clients;

use MojoX::JSON;

our $VERSION = '1.00';
my $loop;
my $clients;

BEGIN {
    $loop = Mojo::IOLoop->singleton;
    Mojo::Client->singleton->ioloop( $loop );
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
    $app->routes->route( $base.'/xhr-polling/:r' )->to({ cb => sub { $self->_handle_xhr_polling( @_ ); } });
#    $app->routes->route( $base )->to({ cb => sub { $self->_dispatch( @_ ); } });

    $self->cfg->field( seq => 0 ) unless defined $self->cfg->field( 'seq' );
    $self->cfg->field( heartbeat => 5000 ) unless $self->cfg->field( 'heartbeat' );

    # XXX I don't like this
#    $clients->cfg( $self->cfg );

    $clients->init( $self->db_name, $self->couch_url->clone );

    return $self;
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

    my @dbs = $self->couch->all_databases;

    #if ( $doc->error ) {
    if ( $doc->isa( 'MojoX::CouchDB::Error' ) ) {
        my @exists = grep { warn $_->name; $_->name eq $db_name } @dbs;
        $db->create unless @exists;
        $doc = $db->create_document( $config_key,
            base => '/socket.io',
            mojo_config => {
                # use a uuid as a secret
#               secret => $db->raw_get( '/_uuids' )->field( 'uuids' )->[0]
               secret => sha1_hex( time().'|'.rand(100000) )
            }
        );
    }

    $db_name = $doc->field( 'db' ) || $db_name;
    $self->db_name( $db_name );

    $self->cfg( $doc );

    foreach ( @dbs ) {
        if ( $_->name =~ m/^ignite_cli_(.*)/ ) {
            warn "found client db: $1\n";

        }
    }
}

sub publish {
    $clients->publish( undef, @_[ 1 .. $#_ ] );
}

sub subscribe {
    $clients->subscribe( @_[ 1 .. $#_ ] );
}

sub unsubscribe {
    $clients->unsubscribe( @_[ 1 .. $#_ ] );
}

sub broadcast {
    $clients->publish( undef, '/meta/bcast', @_[ 1 .. $#_ ] );
}

sub _handle_websocket {
    my ( $self, $c ) = @_;

    return unless ( $c->tx->is_websocket );

    warn "websocket @_\n";

    my $cid = $c->session( 'cid' );
    my $client = $clients->fetch_create( $c, $cid );

    $c->finished(sub {
        $self->plugins->run_hook( 'close', $client );
        $clients->remove( $cid );
    });

    $c->receive_message(sub {
        $self->plugins->run_hook( 'message', $client, ( $self->json->decode( $_[1] ) )->[0] );
    });

    $self->plugins->run_hook( 'open', $client );

    return
}

sub _dispatch {
    my ( $self, $c ) = @_;

    warn "dispatch\n";

    $c->render_json({});
}

sub _setup_session {
    my ( $self, $c ) = @_;

    my $cid = $c->session( 'cid' );

    # session creation
    unless ( $cid ) {
        if ( $c->param( 'cookietest' ) ) {
            $c->render_text( 'Cookies must be turned on' );
            return;
        }
        $cid = sha1_hex( time() + rand(100000) );
        $c->session( cid => $cid );
        warn "created session $cid\n";
        my $base = $c->cfg->field('base') || '/socket.io';
        $c->redirect_to( $base.'/xhr-polling'.time().'?cookietest=1' );
        return;
    }

    return $cid;
}

sub _handle_xhr_polling {
    my ( $self, $c ) = @_;

    # XXX config deny xdomain?
    if ( $self->_origin_ok( $c ) ) {
        $c->res->headers->header( 'Access-Control-Allow-Origin' => $c->req->headers->header( 'Origin' ) );
        if ( $c->req->headers->header('Cookie') ) {
            $c->res->headers->header( 'Access-Control-Allow-Credentials' => 'true' );
        }
    }

    my $cid = $self->_setup_session( $c );
    return unless $cid;

    my $client = $clients->fetch_create( $c, $cid );

    $c->finished(sub {
        warn "client $cid finished\n";
        $clients->remove( $cid );
    });

    warn "xhr-poll\n";
    my $method = $c->req->method;

    if ( $method eq 'GET' ) {
        # get data if available, or wait 15s if none waiting
        $client->get_data( 15 );
        return;
    } elsif ( $method eq 'POST' ) {
        if ( my $data = $c->req->param( 'data' ) ) {
            $data = $self->json->decode( $data );
            if ( $data->{messages} ) {
                foreach ( @{$data->{messages}} ) {
                    $self->plugins->run_hook( 'message', $client, $_ );
                }
            }
        }
        $c->render_text('ok');
        return;
    }

    $c->render_json({});
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

Mojolicious::Plugin::Ignite - Socket.io plugin for Mojolicious

=head1 SYNOPSIS

    # Mojolicious
    $self->plugin( 'ignite' => [ 'http://127.0.0.1:5984/ignite' => 'config' ] );

    # Mojolicious::Lite
    plugin 'ignite' => [ 'http://127.0.0.1:5984/ignite' => 'config' ];

=head1 DESCRIPTION

L<Mojolicous::Plugin::Ignite> is a socket.io server for Mojolicious

=head1 METHODS

L<Mojolicious::Plugin::Ignite> inherits all methods from
L<Mojolicious::Plugin> and implements the following new ones.

=head2 C<register>

    $plugin->register;

Register condition in L<Mojolicious> application.

=head1 SEE ALSO

L<Mojolicious>, L<Mojolicious::Guides>, L<http://mojolicious.org>.

=cut
