package Ignite::Client;

use base 'Mojo::Base';

use MojoX::JSON;
use Digest::SHA1 qw( sha1_hex );
use Time::HiRes;
use Ignite::Clients;

use strict;
use warnings;

my $loop;
my $json;
my $clients;

__PACKAGE__->attr([qw/ client db /]);
__PACKAGE__->attr(is_websocket => sub { 0 });
__PACKAGE__->attr(id => sub { sha1_hex( join( '|', $_[0], time(), rand(100000) ) ) });
__PACKAGE__->attr(buffer => sub { [] });
__PACKAGE__->attr(buffer_count => sub { 0 });
__PACKAGE__->attr(_timers => sub { {} });

BEGIN {
    $json = MojoX::JSON->singleton;
    $loop = Mojo::IOLoop->singleton;
    $clients = Ignite::Clients->singleton;
};

sub new {
    my $class = shift;
    my $args = { @_ };

    my $self = bless( $args, ref $class || $class );

    $self->is_websocket( $self->client->tx->is_websocket ) if $self->client;

    die "client does not have db:".$self->id unless $self->db;

    return $self;
}

sub broadcast {
    my ( $self, $msg ) = @_;

    my $out = $json->encode({
        messages => [
            ref $msg ? $json->encode( $msg ) : $msg
        ]
    });

    return $clients->broadcast( $out, $self->id );
}

sub send_message {
    my ( $self, $msg, $encoded, $ev ) = @_;

    if ( $self->client && $self->is_websocket ) {
        warn "sending to web socket $msg\n";
        # websocket
        $self->client->send_message(
            $encoded ? $msg : $json->encode({
                messages => [
                    ref $msg ? $json->encode( $msg ) : $msg
                ]
            })
        );
        return;
    } elsif ( $self->client ) {
        # longpoll waiting, etc
        if ( $self->{_resume} ) {
            push( @{ $self->buffer }, ref $msg ? $json->encode( $msg ) : $msg );
            $self->{_resume}->();
            return;
        }
    }

    return if $ev;

    # client must not be currently connected, send it to couch
    $clients->add_event( '/cid/'.$self->id, ref $msg ? $json->encode( $msg ) : $msg );

    return;
}

sub disconnect {
    my $self = shift;

    if ( my $resume = delete $self->{_resume} ) {
        $resume->();
    } else {
        $loop->drop( $self->client->tx ) if $self->client;
    }

    foreach ( values %{ $self->_timers } ) {
        $loop->drop( $_ );
    }

    $clients->remove( $self->id );
    $self->_timers( {} );

    return;
}

sub timer {
    return $loop->timer( @_[ 1 .. $#_ ] );
}

sub heartbeat {
    my ( $self, $secs ) = @_;

#    return unless $self->is_websocket;

    if ( my $id = delete $self->_timers->{heartbeat} ) {
        $loop->drop( $id );
    }

    my $heartbeat;
    $heartbeat = sub {
        $self->client->send_message('{"heartbeat":"1"}'); # no need to json encode this
        $self->_timers->{heartbeat} = $loop->timer( $secs => $heartbeat );
    };

    $self->_timers->{heartbeat} = $loop->timer( $secs => $heartbeat );

    return;
}

sub wait_for_data {
    my ( $self, $secs ) = @_;

    return if $self->is_websocket || $self->_timers->{longpoll} || !$self->client;

    $self->client->tx->pause;

    $self->_timers->{longpoll} = $loop->timer( $secs || 15 => $self->{_resume} = sub {
        delete $self->{_resume};
        $loop->drop( delete $self->_timers->{longpoll} );
        $self->client->tx->resume;
        $self->client->render_json({ messages => $self->buffer });
    });

    return;
}

sub recv_or_wait {
    my ( $self, $secs ) = @_;

    return if $self->is_websocket || $self->_timers->{longpoll} || !$self->client;

    $self->get_data( $self->id );

#    if ( $self->buffer_count ) {
    if ( @{ $self->buffer } ) {
        $self->client->render_json({ messages => $self->buffer });
        return;
    }

    # no msgs waiting, wait until $secs or a msg comes in
    $self->wait_for_data( $secs );

    return;
}

sub get_data {
    my $self = shift;

    my $data = $clients->get_data( $self->id );

    if ( $data ) {
        push( @{ $self->buffer }, @$data );
    }

    return;
}

1;

