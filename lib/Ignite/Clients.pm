package Ignite::Clients;

use base 'Mojo::Base';

use Digest::SHA1 qw( sha1_hex );
use Scalar::Util qw( weaken );
use Time::HiRes;
use MojoX::JSON;

use strict;
use warnings;

our $SINGLETON;

__PACKAGE__->attr( [qw/ db_name couch_url /] );
__PACKAGE__->attr( json => sub { MojoX::JSON->singleton } );
__PACKAGE__->attr( clients => sub { {} } );
__PACKAGE__->attr( ev_seq => 0 );

sub new {
    my $class = shift;

    return $SINGLETON if $SINGLETON;

    my $self = $SINGLETON = $class->SUPER::new( @_ );

    require Ignite::Client;

    return $self;
}

sub singleton {
    goto &new;
}

sub fetch_create {
    my ( $self, $c, $cid ) = @_;

    my $clients = $self->clients;

    $cid ||= sha1_hex( join( '|', $c, time(), rand(100000) ) );

    if ( exists $clients->{ $cid } ) {
        return $clients->{ $cid }->active;
    } else {

        # get the client info
        Mojo::Client->singleton->get( $self->dburl( 'clients', $cid ) => sub {
            return unless my $obj = $self->json->decode( $_[1]->res->body );
            warn Data::Dumper->Dump([$obj],['get_cli_'.$cid]);
            # XXX location of client db (it can be on another couch)
            if ( $obj->{error} && $obj->{error} eq 'not_found' ) {
                $self->bulk_update( 'clients' , [{ _id => $cid, added => time() }] );
#            } elsif ( $obj->{error} && $obj->{error} eq 'no_db_file' ) {
#                # create a client db
#                Mojo::Client->singleton->put( $self->dburl( 'cli_'.$cid ) => sub {
#                    return unless my $obj = $self->json->decode( $_[1]->res->body );
#                    warn Data::Dumper->Dump([$obj],['create_cli_'.$cid]);
#                })->process;
            }
        })->process;

        #return $clients->{ $cid } = do {
            my $x = Ignite::Client->new( con => $c, id => $cid );
            weaken( $c );
            $x;
        #};
    }
}

sub fetch {
    my ( $self, $cid ) = @_;

    return $self->clients->{ $cid } ? $self->clients->{ $cid }->active : undef;
}

sub broadcast {
    shift->publish( '/meta/bcast', @_ );
}

sub _send_all {
    my ( $self, $msg, $from ) = @_;

    my $count = 0;
    while ( my ( $cid, $cli ) = each( %{ $self->clients } ) ) {
        next if $cid eq $from;
        $count++;
        warn "sending to client $cid : $msg\n";
        $cli->send_message( $msg, 1, 1 );
    }

    return $count;
}

sub publish {
    my ( $self, $ch, $cid, @msgs ) = @_;

    if ( ref $cid ) {
        unshift( @msgs, $cid );
        $cid = undef;
    }

    return unless @msgs;
    foreach ( @msgs ) { $_->{channel} = $ch; $_->{from} = $cid if $cid; }

    my $json = $self->json;
    my $content = Mojo::Content::Single->new;
    $content->asset->add_chunk( $json->encode({ all_or_nothing => $json->true, docs => \@msgs }) );

    my $curl;
    if ( !ref( $ch ) && $ch =~ m!^/meta/unicast/(.*)! ) {
        $curl = $self->dburl( "cli_$1", '_bulk_docs' );
    } else {
        $curl = $self->dburl( $self->db_name, '_bulk_docs' );
    }
    my $tx = Mojo::Client->singleton->build_tx( POST => $curl );
    $tx->req->content($content);
    $tx->req->headers->content_type( 'application/json' );

    Mojo::Client->singleton->process($tx => sub {
        return unless my $obj = $json->decode( $_[1]->res->body );
        warn Data::Dumper->Dump([$obj],['insert_events']);
    });

}

sub remove {
    my ( $self, $cid ) = @_;

    delete $self->clients->{ $cid };

    return;
}

sub get_data {
    my ( $self, $cid, $cb ) = @_;

    Mojo::Client->singleton->get( $self->dburl( 'cli_'.$cid, '_all_docs', { include_docs => 'true' } ) => sub {
        my $obj = $self->json->decode( $_[1]->res->body );
        if ( $obj->{error} ) {
            warn "db error $obj->{error} $obj->{reason}\n";
        } elsif ( $obj->{rows} ) {
            my ( @out, @todelete );
            foreach ( @{$obj->{rows}} ) {
                push ( @todelete, {
                    _id => $_->{id},
                    _rev => $_->{value}->{rev},
                    _deleted => $self->json->true
                });
                next unless $_->{doc};
                delete @{$_->{doc}}{qw( _id _rev )};
                push ( @out, $_->{doc} );
            }
            warn Data::Dumper->Dump([\@out],['fetched_events_cli_'.$cid]);
            $self->bulk_update( "cli_$cid", \@todelete );
            $cb->( \@out );
            return;
        }
        $cb->( [] );
    })->process;
}

sub init {
    my ( $self, $db_name, $couch_url ) = @_;

    return if $self->{_init_done}++;

    $couch_url->path( '/' );
    $self->couch_url( $couch_url );
    $self->db_name( $db_name );

    my $url = $self->dburl( $db_name ); # events db

    my $json = $self->json;

    # check events db, and update sequence, or create the db
    Mojo::Client->singleton->get( $url => sub {
        return unless my $obj = $json->decode( $_[1]->res->body );
        if ( $obj->{error} && $obj->{reason} && $obj->{reason} eq 'no_db_file' ) {
            warn "no db file $db_name, creating... $url\n";
            Mojo::Client->singleton->put( $url => sub {
                warn Data::Dumper->Dump([$_[1]->res->body]);
                $self->init( $db_name, $couch_url );
            })->process;
            return;
        }

        $self->ev_seq( $obj->{update_seq} );

        warn "processesing existing events\n";

        # get existing events, and deliver them
        my $url = $self->dburl( $db_name, '_all_docs', { include_docs => 'true' } );
        Mojo::Client->singleton->get( $url => sub {
            return unless my $obj = $json->decode( $_[1]->res->body );
            warn Data::Dumper->Dump([$obj],['recv_events']);

            my $events = {};
            foreach ( @{$obj->{rows}} ) {
                my $doc= $_->{doc};
                push( @{ $events->{ $doc->{channel} } }, $doc ) if $doc && $doc->{channel};
            }

            $self->deliver_events( $events );
        })->process;

        # check and create clients db
        Mojo::Client->singleton->get( $self->dburl( 'clients' ) => sub {
            return unless my $obj = $json->decode( $_[1]->res->body );
            warn Data::Dumper->Dump([$obj],['client_db']);

            if ( $obj->{error} && $obj->{reason} && $obj->{reason} eq 'no_db_file' ) {
                warn "creating clients table\n";
                Mojo::Client->singleton->put( $self->dburl( 'clients' ) => sub {} )->process;
            }
        })->process;

        warn "updated sequence, beginning watch\n";
        # watch
        Mojo::IOLoop->singleton->timer( 2 => sub { $self->watch_couchdb });
    })->process;

}

sub deliver_events {
    my ( $self, $events ) = @_;

    return unless keys %$events;

    my $json = $self->json;
    warn Data::Dumper->Dump([$events],['recv_events']);

    my @todelete;
    # delete the events, and remove the revs and ids
    foreach my $ev ( values %$events ) {
        foreach ( @{$ev} ) {
            push ( @todelete, {
                _id => delete $_->{_id},
                _rev => delete $_->{_rev},
                _deleted => $json->true
            });
        }
    }
    $self->bulk_update( $self->db_name, \@todelete );

    # publish the events
    foreach my $ch ( keys %$events ) {
        my $u;
        if ( $ch =~ m!^/meta/! ) {
            if ( $ch eq '/meta/bcast' ) {
                $u = $self->dburl( 'clients', '_all_docs' );
            } else {
                warn "ignored events on $ch\n";
                warn Data::Dumper->Dump([$events->{$ch}],['ch_'.$ch]);
                next;
            }
        } else {
            $u = $self->dburl( "ch_$ch", '_all_docs' );
        }

        Mojo::Client->singleton->get($u => sub {
            return unless my $d = $json->decode( $_[1]->res->body );
            warn Data::Dumper->Dump([$d],['ch_'.$ch]);

            return if $d->{error};

            # json body of events for this channel to insert in client mbox
            my $out = $json->encode({ all_or_nothing => $json->true, docs => $events->{$ch} });
            warn "sending events to $ch : $out\n";

            # loop over clients from channel id list, and insert event(s)
            foreach my $row ( @{$d->{rows}} ) {
                warn "inserting into client table: $row->{id}\n";
                $self->bulk_update( "cli_$row->{id}", $out );
            }
        })->process;
    }

    return;
}

sub watch_couchdb {
    my $self = shift;

    my $json = $self->json;
    my $client = Mojo::Client->singleton;
    $client->async;

    warn "do request\n";

    my $url = $self->dburl( $self->db_name, '_changes', {
        since => $self->ev_seq,
        heartbeat => 5000,
        style => 'all_docs',
        include_docs => 'true',
        feed => 'continuous'
    });

    warn "requesting $url\n";
    my $tx = $client->build_tx( GET => $url );
    my $error;

    $tx->res->body(sub {
        my $chunk = $_[1];

#        my $c = "$chunk";
#        $c =~ s/\x0D/\\n/g; $c =~ s/\x0A/\\r/g;
#        warn "chunk [$c]\n";

        # heartbeat
        return if ( $chunk eq "\x0A" );

        my $events = {};
        foreach ( split( /\x0A/, $chunk ) ) {
            warn "chunk: $_\n";
            my $obj;
            eval {
                $obj = $json->decode( $_ );
#                warn Data::Dumper->Dump([$obj],[$obj->{id} || 'ev']);
                if ( defined $obj->{seq} && $self->ev_seq > $obj->{seq} ) {
                    $self->ev_seq( $obj->{seq} );
                }
#                return unless ( $obj->{id} );

                my $doc = $obj->{doc};
                # split events into channels
                if ( $doc && $doc->{channel} ) {
                    push( @{ $events->{ $doc->{channel} } }, $doc );
                }
            };
            if ( $@ ) {
                warn "Error parsing |$_|  Error Msg: $@\n";
            }
            if ( $obj->{error} ) {
                warn Data::Dumper->Dump([$obj],['error']);
                $error = $obj;
            } else {
                $error = undef;
            }
        }

        $self->deliver_events( $events );
    });

#    $client->keep_alive_timeout(30);
    $client->process($tx => sub {
        warn "request complete\n";
        if ( $error ) {
            # XXX check for - reason: no_db_file error: not_found
        }

        $self->watch_couchdb;

        return;
    });

}

sub dburl {
    my $self = shift;

    my $url = $self->couch_url->clone;

    $url->query([ %{ pop(@_) } ]) if ref $_[-1] eq 'HASH';
    $url->path->append( @_ )->trailing_slash(0) if @_;

    return $url;
}

sub bulk_update {
    my ( $self, $db, $docs ) = @_;

    my $url = $self->dburl( $db, '_bulk_docs' );
    warn "bulk update: $url\n";

    my $etx = Mojo::Client->singleton->build_tx( POST => $url );
    my $content = Mojo::Content::Single->new;
    if ( ref $docs ) {
        $content->asset->add_chunk($self->json->encode({ all_or_nothing => $self->json->true, docs => $docs }));
    } else {
        $content->asset->add_chunk($docs);
    }
    $etx->req->content($content);
    $etx->req->headers->content_type( 'application/json' );

    Mojo::Client->singleton->process($etx => sub {
        return unless my $obj = $self->json->decode( $_[1]->res->body );
        warn Data::Dumper->Dump([$obj],['bulk_update']);

        return unless ref $obj eq 'HASH';

        if ( $obj->{error} && $obj->{reason} && $obj->{reason} eq 'no_db_file' ) {
            Mojo::Client->singleton->put( $self->dburl( $db ) => sub {
                return unless my $obj = $self->json->decode( $_[1]->res->body );
                warn Data::Dumper->Dump([$obj],['bulk_update']);
                if ( $obj->{ok} ) {
                    $self->bulk_update( $db, $docs );
                }
            })->process;
        }
    });
}

1;
