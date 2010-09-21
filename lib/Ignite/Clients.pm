package Ignite::Clients;

use base 'Mojo::Base';

use Digest::SHA1 qw( sha1_hex );
use Time::HiRes;
use MojoX::JSON;
use Data::Dumper;

use strict;
use warnings;

our $SINGLETON;
my $json;

BEGIN {
    $json = MojoX::JSON->singleton;
};

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
    my ( $self, $c ) = @_;

    my $cli = $self->fetch( $c->stash( 'cid' ) );
    return $cli if $cli;

    $cli = $self->create( con => $c );

    my $cid = $cli->id;

    $self->get( $self->dburl( "cli_$cid" ) => sub {
        return unless my $obj = $json->decode( $_[1]->res->body );
#        warn Data::Dumper->Dump([$obj],['cli_data_'.$cid]);

        if ( my $cli = $self->clients->{ $cid } ) {
            $cli->created( $obj->{created} ) if $obj->{created};
            $cli->seq( $obj->{update_seq} ) if $obj->{update_seq};
        }

        # XXX merge db info into client obj
        #@{$cli}{( keys %$obj )} = values %$obj;
        # XXX doc_count, instance_start_time
    });

    return $cli;
}

sub create {
    my $self = shift;

    #my $cli = Ignite::Client->new( $#_ == 0 ? %{$_[0]} : @_ );
    my $cli = Ignite::Client->new( @_ );

    my $cid = $cli->id;

    $self->clients->{ $cid } = $cli;

    # get the client info
    $self->get( $self->dburl( 'clients', $cid ) => sub {
        return unless my $obj = $json->decode( $_[1]->res->body );
#        warn Data::Dumper->Dump([$obj],['get_cli_'.$cid]);

        # XXX get location of client db (it can be on another couch)
        if ( $obj->{error} && $obj->{error} eq 'not_found' ) {
            $self->bulk_update( 'clients' , [{
                _id => $cid,
                uid => $cli->uid,
                created => $cli->created,
                transport => $cli->transport
            }] );

#            } elsif ( $obj->{error} && $obj->{error} eq 'no_db_file' ) {
#                # create a client db
        }
    });

    return $cli;
}

sub fetch {
    my ( $self, $cid ) = @_;

    return $cid && $self->clients->{ $cid } ? $self->clients->{ $cid }->active : undef;
}

sub broadcast {
    shift->publish( '/meta/bcast', @_ );
}

sub subscribe {
    my ( $self, $ch, $cid ) = @_;

    return unless $ch && $cid;

    $self->bulk_update( "ch_$ch", [{
        _id => $cid
    }]);
}

sub unsubscribe {
    my ( $self, $ch, $cid ) = @_;

    return unless $ch && $cid;

    $self->bulk_update( "ch_$ch", [{
        _id => $cid,
        _deleted => $json->true
    }]);
}

sub publish {
    my ( $self, $ch, $cid, @msgs ) = @_;

    if ( ref $cid ) {
        unshift( @msgs, $cid );
        $cid = undef;
    }
    if ( ref $ch ) {
        unshift( @msgs, $ch );
        $ch = undef;
    }

    return unless @msgs;
    foreach ( @msgs ) {
        next if $ch =~ m!^/meta/unicast/!;

#        $_->{channel} = $ch unless defined $ch && $ch =~ m!^/meta/!;
        $_->{channel} = $ch if $ch;
#        delete $_->{channel} if defined $ch && $ch =~ m!^/meta/!;
        $_->{from} = $cid if $cid;
    }

    if ( defined $ch && $ch =~ m!^/meta/unicast/(.*)! ) {
        warn "unicast to $1\n";
        $self->bulk_update( "cli_$1", \@msgs );
    } else {
        $self->bulk_update( $self->db_name, \@msgs );
    }
}

sub remove {
    my ( $self, $cid ) = @_;

    my $cli = delete $self->clients->{ $cid };

    if ( $cli && $cli->is_persistent ) {
        warn "removed persistent client $cid\n";
        Mojo::Client->singleton->delete( $self->dburl( 'cli_'.$cid ) => sub { });
    }

    return;
}

sub init {
    my ( $self, $db_name, $couch_url ) = @_;

    return if $self->{_init_done}++;

    $couch_url->path( '/' );
    $self->couch_url( $couch_url );
    $self->db_name( $db_name );

    my $url = $self->dburl( $db_name ); # events db

    # check events db, and update sequence, or create the db
    $self->get( $url => sub {
        return unless my $obj = $json->decode( $_[1]->res->body );
        if ( $obj->{error} && $obj->{reason} && $obj->{reason} eq 'no_db_file' ) {
            warn "no db file $db_name, creating... $url\n";
            $self->put( $url => sub {
                warn Data::Dumper->Dump([$_[1]->res->body]);
                $self->init( $db_name, $couch_url );
            });
            return;
        }

        $self->ev_seq( int $obj->{update_seq} );

        # get existing events, and deliver them
        my $url = $self->dburl( $db_name, '_all_docs', { include_docs => 'true' } );
        $self->get( $url => sub {
            return unless my $obj = $json->decode( $_[1]->res->body );
#            warn Data::Dumper->Dump([$obj],['recv_events']);

            my $events = {};
            foreach ( @{$obj->{rows}} ) {
                my $doc= $_->{doc};
                push( @{ $events->{ $doc->{channel} } }, $doc ) if $doc && $doc->{channel};
            }

            $self->deliver_events( $events );
        });

        # check and create clients db
        $self->get( $self->dburl( 'clients' ) => sub {
            return unless my $obj = $json->decode( $_[1]->res->body );
#            warn Data::Dumper->Dump([$obj],['client_db']);

            if ( $obj->{error} && $obj->{reason} && $obj->{reason} eq 'no_db_file' ) {
                warn "creating clients table\n";
                $self->put( $self->dburl( 'clients' ) => sub {} );
            }
        });

        # watch
        $self->watch_couchdb;
    })->process;

}

sub deliver_events {
    my ( $self, $events ) = @_;

    return unless keys %$events;

#    warn Data::Dumper->Dump([$events],['recv_events']);

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
    $self->bulk_update( $self->db_name, \@todelete ) if @todelete;

    # publish the events
    foreach my $ch ( keys %$events ) {
        my $u;
        # bcast goes to all client tables
        if ( $ch =~ m!^/meta/! ) {
            if ( $ch eq '/meta/bcast' ) {
                $u = $self->dburl( 'clients', '_all_docs' );
            } elsif ( $ch =~ m!^/meta/unicast/(.*)! ) {
                $self->bulk_update( "cli_$1", $events->{$ch} );
                next;
            } else {
                warn "ignored events on $ch\n";
                warn Data::Dumper->Dump([$events->{$ch}],['ch_'.$ch]);
                next;
            }
        } else {
            $u = $self->dburl( "ch_$ch", '_all_docs' );
        }

        $self->get($u => sub {
            return unless my $d = $json->decode( $_[1]->res->body );
#            warn Data::Dumper->Dump([$d],['ch_'.$ch]);

            return if $d->{error};

            # json body of events for this channel to insert in client mbox
            my $out = $json->encode({ all_or_nothing => $json->true, docs => $events->{$ch} });
#            warn "sending events to $ch : $out\n";

            # loop over clients from channel id list, and insert event(s)
            foreach my $row ( @{$d->{rows}} ) {
#                warn "inserting into client table: $row->{id}\n";
                $self->bulk_update( "cli_$row->{id}", $out );
            }
        });
    }

    return;
}

sub watch_couchdb {
    my $self = shift;


    my $url = $self->dburl( 'events', '_changes', {
        since => $self->ev_seq,
        heartbeat => 5000,
        style => 'main_only',
        include_docs => 'true',
        feed => 'continuous'
    });

    my $tx = Mojo::Client->singleton->build_tx( GET => $url );
    my $error;

    $tx->res->body(sub {
        my $chunk = $_[1];

#        my $c = "$chunk";
#        $c =~ s/\x0D/\\n/g; $c =~ s/\x0A/\\r/g;
#        warn "events - chunk [$c]\n";

        # heartbeat
        return if ( $chunk eq "\x0A" );

        my $events = {};
        foreach ( split( /\x0A/, $chunk ) ) {
#            warn "chunk: $_\n";
            my $obj;
            eval {
                $obj = $json->decode( $_ );
                if ( $obj->{seq} && $self->ev_seq < $obj->{seq} ) {
                    $self->ev_seq( int $obj->{seq} );
                }
                delete $obj->{doc} if $obj->{deleted};
#                warn Data::Dumper->Dump([$obj],[$obj->{id} || 'ev']);

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

    $self->process($tx => sub {
        warn "request complete\n";
        if ( $error ) {
            # XXX check for - reason: no_db_file error: not_found
        }

        $self->watch_couchdb;
#        Mojo::IOLoop->singleton->timer( 1 => sub { $self->watch_couchdb });
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
                if ( $obj->{ok} ) {
                    $self->bulk_update( $db, $docs );
                }
            });
        }
    });
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

1;
