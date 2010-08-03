package Ignite::Clients;

use base 'Mojo::Base';

use Digest::SHA1 qw( sha1_hex );
use Scalar::Util qw( weaken );
use Time::HiRes;
use MojoX::CouchDB;

use strict;
use warnings;

our $SINGLETON;

__PACKAGE__->attr([qw/ db /]);
__PACKAGE__->attr(clients => sub { {} });
__PACKAGE__->attr(couch => sub { MojoX::CouchDB->new });

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
        return $clients->{ $cid };
    } else {
        return $clients->{ $cid } = do {
            my $db = $self->couch->new_database( "ignite_cli_$cid" );
            $db->create;
            my $x = Ignite::Client->new( client => $c, id => $cid, db => $db );
            weaken( $c );
#            $self->db->create_document( $cid,
#                created => time()
#            );
            $x;
        };
    }
}

sub fetch {
    my ( $self, $cid ) = @_;

    return $self->clients->{ $cid };
}

sub broadcast {
    my ( $self, $msg, $from_cid ) = @_;

    $self->db->create_document( sha1_hex( join( '|', $from_cid, time(), rand(100000) ) ),
        channel => '/all',
        event => $msg,
        from => $from_cid,
    );
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

sub add_event {
    my ( $self, $ch, $msg ) = @_;

    $self->db->create_document( sha1_hex( join( '|', $ch, time(), rand(100000) ) ),
        channel => $ch,
        event => $msg
    );
}

sub remove {
    my ( $self, $cid ) = @_;

    delete $self->clients->{ $cid };

    return;
}

sub get_data {
    my ( $self, $cid ) = @_;

    warn "getting data for $cid\n";

    my $doc = $self->db->get_document( "/events/_design/lookup/_view/channel?key=\"/cid-$cid\"" );
    warn "doc: $doc\n";

#    if ( $doc->error ) {
    if ( $doc->isa( 'MojoX::CouchDB::Error' ) ) {
        warn "error querying db: $doc\n";
        return;
    }

    return { map { ( $_ => $doc->field($_) ) } @{ $doc->fields->names(qw/ _id /) } };
}

1;
