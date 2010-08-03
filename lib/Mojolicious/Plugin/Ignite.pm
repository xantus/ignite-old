package Mojolicious::Plugin::Ignite;

use strict;
use warnings;

use base 'Mojolicious::Plugin';

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
    $clients = Ignite::Clients->singleton;
};

__PACKAGE__->attr([qw/ db cfg db_name /]);
__PACKAGE__->attr( _json => sub { MojoX::JSON->singleton } );
__PACKAGE__->attr( plugins => sub { Ignite::Plugins->new } );
__PACKAGE__->attr( couch => sub { MojoX::CouchDB->new } );
# can't do this because it uses $json->error
#__PACKAGE__->attr( couch => sub {
#    my $c = MojoX::CouchDB->new;
#    $c->_json_encoder( MojoX::JSON->singleton );
#    $c->_json_decoder( MojoX::JSON->singleton );
#    return $c;
#});

sub register {
    my ($self, $app, $cfg_url) = @_;

    return $self if ( $self->{configured}++ ); # hmm

    $self->_config( $app, $cfg_url ) if defined $cfg_url;

    die __PACKAGE__." - You must configure ignite with a couchdb url" unless $self->cfg;

#    require Data::Dumper;
#    warn Data::Dumper->Dump([$self->cfg]);

    # use the faster JSON module if available
    if ( MojoX::JSON::HAS_JSON ) {
        $app->plugins->add_hook(
            after_build_tx => sub {
                my $tx = $_[1];
                $tx->res->json_class('JSON');
                $tx->req->json_class('JSON');
            }
        );
    }

    my $base = $self->cfg->field( 'base' ) || '/socket.io';

    # XXX detour?
    $app->routes->route( $base.'/websocket' )->websocket->to({ cb => sub { $self->_handle_websocket( @_ ); } });
    $app->routes->route( $base.'/xhr-polling/:r' )->to({ cb => sub { $self->_handle_xhr_polling( @_ ); } });
#    $app->routes->route( $base )->to({ cb => sub { $self->_dispatch( @_ ); } });

    $self->cfg->field( seq => 0 ) unless defined $self->cfg->field( 'seq' );
    $self->cfg->field( heartbeat => 5000 ) unless $self->cfg->field( 'heartbeat' );

    # XXX I don't like this
#    $clients->couch_url( $self->{couch_url} );
#    $clients->cfg( $self->cfg );

    warn "db is ".$self->db." client is ".$clients;
    $clients->db( $self->db );

    $loop->timer( 1 => sub { $self->watch_couchdb($app); } );

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

    my $url = $self->{couch_url} = Mojo::URL->new( $couchurl );

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

    $self->db( $self->couch->new_database( $db_name ) );

    $self->cfg( $doc );

    foreach ( @dbs ) {
        if ( $_->name =~ m/^ignite_cli_(.*)/ ) {
            warn "found client db: $1\n";

        }
    }
}

sub _handle_websocket {
    my ( $self, $c ) = @_;

    return unless ( $c->tx->is_websocket );

    warn "websocket @_\n";

    my $client = $clients->fetch_create( $c, $c->session( 'cid' ) );

    $c->finished(sub {
        $self->plugins->run_hook( 'close', $client );
    });

    $c->receive_message(sub {
        $self->plugins->run_hook( 'message', $client, ( $self->_json->decode( $_[1] ) )->[0] );
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

    warn "xhr-poll\n";
    my $method = $c->req->method;

    if ( $method eq 'GET' ) {
        # get data if available, or wait 15s if none waiting
        $client->recv_or_wait( 15 );
        return;
    } elsif ( $method eq 'POST' ) {
        if ( my $data = $c->req->param( 'data' ) ) {
            $data = $self->_json->decode( $data );
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

sub watch_couchdb {
    my ( $self, $app ) = @_;

    my $json = $self->_json;

    warn "do request\n";

    my $url = $self->{couch_url}->clone;

    my $db_name = $self->db_name;

    $url->path( '/'.$db_name.'/_changes' );

    my $seq = $self->cfg->field( 'seq' );
    if ( $seq > 0 ) {
        $url->query->param( since => $seq );
    }
    $url->query->param( heartbeat => $self->cfg->field( 'heartbeat' ) || 5000 );
    $url->query->param( style => 'all_docs' );
    $url->query->param( include_docs => 'true' );
    $url->query->param( feed => 'continuous' );

    warn "requesting $url\n";
    my $tx = $app->client->async->build_tx( GET => $url );
    my $error;

    $tx->res->body(sub {
        my $chunk = $_[1];

# debugging
#        my $c = "$chunk";
#        $c =~ s/\x0D/\\n/g; $c =~ s/\x0A/\\r/g;
#        warn "chunk [$c]\n";

        # heartbeat
        return if ( $chunk eq "\x0A" );

        foreach ( split( /\x0A/, $chunk ) ) {
            my $obj;
            eval {
                $obj = $json->decode( $_ );
                warn Data::Dumper->Dump([$obj]);
                if ( defined $obj->{seq} && $seq > $obj->{seq} ) {
                    $seq = $obj->{seq};
                    $self->cfg->field( seq => $seq );
                    # XXX terrible
                    $self->cfg->save;
                }
                #$VAR1 = {
                #  'changes' => [
                #                 {
                #                   'rev' => '2-e081699c08a8eb52bd8c8eb73feabbf3'
                #                 }
                #               ],
                #  'id' => '36c72dd8895a11df8cadb613e6644a9f',
                #  'seq' => 13
                #};
                # do something with data: $obj

                return unless ( $obj->{id} );
                # we only care about clients actively connected: websockets or waiting longpolls, etc
#                return unless ( $clients->fetch( $obj->{id} ) );

                # check the db for this client
#                warn "there is a waiting client: $obj->{id}\n";

                my $nurl = $url->clone;
                $nurl->path( '/'.$db_name.'/'.$obj->{id} );

                $app->client->get($nurl => sub {
                    my $doc = $_[1]->res->json;
                    warn Data::Dumper->Dump([$doc],['doc']);
                    # XXX
                    return;
                    # XXX
                    if ( $doc->{_id} ) {
#                        if ( my $cli = $clients->fetch( $obj->{id} ) ) {
#                            my $input = delete $check->{input};
#                            $check->{input} = [];
#                            $app->client->put($nurl => $json->encode($check) => sub {
#                                my $tx = $_[1];
#                                warn Data::Dumper->Dump([$tx->res->json]);
#                                # todo, failure
#                            })->process;
#
#                            # client exists
#                            warn "client exists in db too\n";
#                            $cli->send_message($input);
#                        }
                        if ( $doc->{channel} ) {
                            if ( $doc->{channel} =~ m!^/cid/(.+)! ) {
                                warn "looking for client $1\n";
                                if ( my $cli = $clients->fetch( $1 ) ) {
                                    warn "found, sending message\n";
                                    $cli->send_message( $doc->{event}, 1, 1 );
                                }
                            } elsif ( $doc->{channel} eq '/all' ) {
                                warn "sending to all\n";
                                $clients->_send_all( ( ref $doc->{event} ? $json->_json->encode( $doc->{event} ) : $doc->{event} ), $doc->{from} );
                            }
                        }
                    }
                })->process;
            };
            if ( $@ ) {
                warn "Error parsing |$_|  Error Msg: $@\n";
            }
            if ( $obj->{error} ) {
                $error = $obj;
            } else {
                $error = undef;
            }
        }
    });

    $app->client->keep_alive_timeout(30);
    $app->client->async->process($tx => sub {
#        my ( $cli, $tx ) = @_;
        warn "request complete\n";
        if ( $error ) {
            # XXX check for - reason: no_db_file error: not_found
        }

        $self->watch_couchdb( $app );

        return;
    });

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
