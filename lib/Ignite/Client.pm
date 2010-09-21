package Ignite::Client;

use base 'Mojo::Base';

use MojoX::JSON;
use Digest::SHA1 qw( sha1_hex );
use Scalar::Util qw( weaken );
use Time::HiRes;
use Ignite::Clients;
use Data::Dumper;

use strict;
use warnings;

my $loop;
my $json;
my $clients;

__PACKAGE__->attr([qw/ uid con transport event_cb db error /]);
__PACKAGE__->attr(is_persistent => 0);
__PACKAGE__->attr(longpoll_timeout => 10);
__PACKAGE__->attr(seq => 0);
__PACKAGE__->attr(id => sub { sha1_hex( join( '|', $_[0], time(), rand(100000) ) ) });
__PACKAGE__->attr(_timers => sub { {} });
__PACKAGE__->attr(created => sub { time() });

BEGIN {
    $json = MojoX::JSON->singleton;
    $loop = Mojo::IOLoop->singleton;
    $clients = Ignite::Clients->singleton;
};

sub new {
    my $class = shift;
    my $args = { @_ };

    my $self = bless( $args, ref $class || $class );

    $self->active;

    if ( $self->{con} ) {
        # unique id for a browser using the session
        $self->uid( $self->{con}->session( 'uid' ) );
        $self->transport( $self->{con}->stash( 'transport' ) );
        $self->is_persistent( $self->{con}->tx->is_websocket );
        if ( my $cid = $self->{con}->stash( 'cid' ) ) {
            $self->id( $cid );
        } else {
            $self->{con}->stash( cid => $self->id );
        }
        $self->event_cb(sub {
            $self->{con}->send_message(
                $json->encode({ messages => ( ref $_[0] eq 'ARRAY' ) ? $_[0] : [ @_ ] })
            );
        }) if !$self->event_cb && $self->is_persistent;

        weaken( $self->{con} );
    }

    $self->db( 'cli_'.$self->id );

    return $self;
}

sub active {
    my $self = shift;
    $self->{last_active} = time();
    return $self;
}

# socket.io
sub broadcast {
    my ( $self, $msg ) = @_;

    $clients->broadcast( $self->id, $msg );
}

# socket.io
# unicast send to the client
sub send_message {
    my ( $self, $msg, $encoded, $ev ) = @_;

    if ( $self->event_cb ) {
        $self->event_cb->( [ $msg ] );
        return;
    }

    # XXX nuke this
    return if $ev;

    # the client must not be currently connected, publish it
    $clients->publish( '/meta/unicast/'.$self->id, $msg );

    return;
}

# socket.io
sub disconnect {
    my $self = shift;

    if ( $self->event_cb ) {
        $self->event_cb->( [] );
    } else {
# XXX
#        $loop->drop( $self->con->tx ) if $self->con;
    }

    $self->cleanup;
}

sub cleanup {
    my $self = shift;

    foreach ( values %{ $self->_timers } ) {
        $loop->drop( $_ );
    }

    if ( $self->{_changes_tx} ) {
        $loop->drop( delete $self->{_changes_tx} );
    }

    $clients->remove( $self->id );

    $self->event_cb( undef );
    $self->con( undef );
    $self->_timers( {} );

    return;
}

sub publish {
    my $self = shift;
    $clients->publish( shift, $self->id, @_ );
}

sub subscribe {
    my $self = shift;
    $clients->subscribe( shift, $self->id, @_ );
}

sub unsubscribe {
    my $self = shift;
    $clients->unsubscribe( shift, $self->id, @_ );
}

sub timer {
    $loop->timer( @_[ 1 .. $#_ ] );
}

sub heartbeat {
    my ( $self, $secs ) = @_;

    return unless $self->transport eq 'websocket';

    if ( my $id = delete $self->_timers->{heartbeat} ) {
        $loop->drop( $id );
    }

    my $heartbeat; $heartbeat = sub {
        # no need to json encode this
        $self->con->send_message('{"heartbeat":"1"}');
        $self->_timers->{heartbeat} = $loop->timer( $secs => $heartbeat );
    };

    $self->_timers->{heartbeat} = $loop->timer( $secs => $heartbeat );

    return;
}

sub get_data {
    my ( $self, $secs ) = @_;

    return if $self->_timers->{longpoll};
    return $self->_watch_client_db if $self->is_persistent;

    return unless $self->con;

    $self->longpoll_timeout( $secs ) if $secs;

    $self->con->tx->pause;

    $self->event_cb(sub {
        my $data = $_[0];
        $self->event_cb( undef );

        if ( my $pollid = delete $self->_timers->{longpoll} ) {
            $loop->drop( $pollid );
        }

        $self->con->tx->resume;

        if ( ref $data eq 'ARRAY' ) {
#            warn Data::Dumper->Dump([$data],['data']);
            $self->con->render_json({ messages => $data });
        } else {
#            warn "longpoll timed out\n";
            $self->con->render_json({ messages => [] });
        }
        $self->con->finish;
        $clients->remove( $self->id );
    });

    $self->_timers->{longpoll} = $loop->timer( $self->longpoll_timeout, $self->event_cb );

    $self->get( $self->dburl( $self->db ) => sub {
        warn $_[1]->res->body;
        my $obj = $json->decode( $_[1]->res->body );
        # doc_count
        if ( $obj->{update_seq} ) {
            $self->seq( $obj->{update_seq} );
        }
        if ( $obj->{reason} && $obj->{reason} eq 'no_db_file' ) {
            $self->seq( 0 );
            warn "no db file for client, creating...\n";
            $self->put( $self->dburl( $self->db ) => sub {
#                warn Data::Dumper->Dump([$_[1]->res->body]);
                $self->_watch_client_db;
            })->process;
            return;
        }
        if ( $obj->{doc_count} ) {
            my $url = $self->dburl( $self->db, '_all_docs', { include_docs => 'true', limit => 50 } );
            my $cb; $cb = sub {
                warn "fetching $url\n";
                $self->get( $url => sub {
                    # keep requesting
                    return $cb->() if $self->_handle_response( [ $_[1]->res->body ] ) && $self->is_persistent;
                    $self->_watch_client_db;
                })->process;
            };
            $cb->();
            return;
        }
        $self->_watch_client_db;
    })->process;
}

sub _watch_client_db {
    my $self = shift;

    my $url;

    if ( $self->is_persistent ) {
        $url = $self->dburl( $self->db, '_changes', {
            since => $self->seq,
            heartbeat => 5000,
            style => 'main_only',
            include_docs => 'true',
            feed => 'continuous'
        });

        warn "going to watch $url\n";

        my $tx = Mojo::Client->singleton->build_tx( GET => $url );

        $tx->res->body(sub {
            # no need to pick up events if you can't deliver
            return unless $self->event_cb;

            $self->{_changes_tx} = $tx->connection;

            # heartbeat
            return if ( $_[1] eq "\x0A" );

            $self->_handle_response( [ split( /\x0A/, $_[1] ) ] );
        });

        $self->process($tx => sub {
            warn "client watcher request done :".$tx->connection."\n";
            delete $self->{_changes_tx};

            # XXX backoff timer or disconnect here
            if ( $self->error ) {
                warn "no db file for client, creating...\n";
                if ( $self->error->{reason} eq 'no_db_file' ) {
                    # reset the sequence and create or recreate the db
                    $self->seq( 0 );
                    $self->put( $self->dburl( $self->db ) => sub {
                        return unless my $obj = $json->decode( $_[1]->res->body );
                        warn Data::Dumper->Dump([$obj],['create_'.$self->db]);
                        $self->_watch_client_db;
                    })->process;
                    return;
                }
                if ( $self->con ) {
#                    $self->con->send_message($self->error);
                    $self->con->tx->resume;
                    $self->con->finish;
                }
                return;
            }

            $self->_watch_client_db;
        });
    } else {
        $url = $self->dburl( $self->db, '_changes', {
            since => $self->seq,
            timeout => $self->longpoll_timeout * 1000,
            style => 'main_only',
            include_docs => 'true',
            feed => 'longpoll'
        });

        warn "going to watch $url\n";

        $self->get( $url, sub {
            # no need to pick up events if you can't deliver
            return unless $self->event_cb;

            warn "longpoll done\n";
            $self->_handle_response( [ $_[1]->res->body ] );
        })->process;
    }
}

sub _handle_response {
    my ( $self, $data ) = @_;

    my @msgs;

    foreach ( @$data ) {
        my $obj = ( ref $_ eq 'HASH' ) ? $_ : $json->decode( $_ );

        # fix up longpoll request
        if ( $obj->{results} ) {
            push( @$data, @{$obj->{results}} );
            next;
        }

        # fix up _all_docs request
        if ( $obj->{rows} ) {
            foreach( @{$obj->{rows}} ) {
                push( @$data, $_ );
            }
            next;
        }

        # sequence
        if ( $obj->{seq} && $self->seq < $obj->{seq} ) {
            $self->seq( int $obj->{seq} );
        }

        # error
        if ( $obj->{error} ) {
            warn Data::Dumper->Dump([$obj],['error']);
            $self->error( $obj );
        }

        next if !$obj->{doc} || $obj->{deleted};

        # ignore msgs from self
        delete $obj->{doc} if ( $obj->{doc}->{from} && $obj->{doc}->{from} eq $self->id );

        push( @msgs, $obj->{doc} );
    }

    return 0 if $self->is_persistent && !@msgs;

    my @todelete;
    # delete the events, and remove the revs and ids
    foreach ( @msgs ) {
        push( @todelete, {
            _id => delete $_->{_id},
            _rev => delete $_->{_rev},
            _deleted => $json->true
        });
    }

#    warn Data::Dumper->Dump([\@msgs],['msgs_'.$self->id]) if @msgs;

    # send messages
    $self->event_cb->( \@msgs ) if $self->event_cb;

    # delete them
    $self->bulk_update( $self->db, \@todelete ) if @todelete;

    return scalar( @msgs );
}

sub get {
    Mojo::Client->singleton->async->get( @_[ 1 .. $#_ ] );
}

sub put {
    Mojo::Client->singleton->async->put( @_[ 1 .. $#_ ] );
}

sub process {
    Mojo::Client->singleton->async->process( @_[ 1 .. $#_ ] );
}

sub dburl {
    my $self = shift;

    my $url = $clients->couch_url->clone;

    $url->query([ %{ pop(@_) } ]) if ref $_[-1] eq 'HASH';
    $url->path->append( @_ )->trailing_slash(0) if @_;

    return $url;
}

sub bulk_update {
    my ( $self, $db, $docs ) = @_;

    my $url = $self->dburl( $db, '_bulk_docs' );
#    warn "bulk update: $url\n";

    my $etx = Mojo::Client->singleton->build_tx( POST => $url );
    my $content = Mojo::Content::Single->new;
    if ( ref $docs eq 'ARRAY' ) {
        $content->asset->add_chunk($json->encode({ all_or_nothing => $json->true, docs => $docs }));
    } elsif ( ref $docs eq 'HASH' ) {
        $content->asset->add_chunk($json->encode($docs));
    } else {
        $content->asset->add_chunk($docs);
    }
    $etx->req->content($content);
    $etx->req->headers->content_type( 'application/json' );

    $self->process($etx => sub {
        return unless my $obj = $json->decode( $_[1]->res->body );
#        warn Data::Dumper->Dump([$obj],['bulk_update']);

        return unless ref $obj eq 'HASH';

        if ( $obj->{error} && $obj->{reason} && $obj->{reason} eq 'no_db_file' ) {
            $self->put( $self->dburl( $db ) => sub {
                return unless my $obj = $json->decode( $_[1]->res->body );
#                warn Data::Dumper->Dump([$obj],['bulk_update']);
                $self->bulk_update( $db, $docs ) if $obj->{ok};
            })->process;
        }
    });

    return;
}

1;

