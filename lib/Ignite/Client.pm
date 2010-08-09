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

__PACKAGE__->attr([qw/ con transport /]);
__PACKAGE__->attr(is_websocket => 0);
__PACKAGE__->attr(is_longpoll => 0);
__PACKAGE__->attr(seq => 0);
__PACKAGE__->attr(id => sub { sha1_hex( join( '|', $_[0], time(), rand(100000) ) ) });
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

    $self->active;

    $self->is_websocket( $self->con->tx->is_websocket ) if $self->con;
    $self->is_longpoll( 1 ) if $self->transport =~ m/longpoll/;

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

    return $clients->broadcast( $self->id, {
        messages => [
            ref $msg ? $json->encode( $msg ) : $msg
        ]
    });
}

# socket.io
# unicast send to the client
sub send_message {
    my ( $self, $msg, $encoded, $ev ) = @_;

    if ( $self->con && $self->is_websocket ) {
        warn "sending to web socket $msg\n";
        # websocket
        $self->con->send_message(
            $encoded ? $msg : $json->encode({
                messages => [
                    ref $msg ? $json->encode( $msg ) : $msg
                ]
            })
        );
        return;
    } elsif ( $self->con ) {
        # longpoll waiting, etc
        if ( my $cb = delete $self->{_resume} ) {
            $cb->({ 
                messages => [
                    ref $msg ? $json->encode( $msg ) : $msg
                ]
            });
            return;
        }
    }

    return if $ev;

    # the client must not be currently connected, publish it
    $clients->publish( '/meta/unicast/'.$self->id, {
        messages => [ ref $msg ? $json->encode( $msg ) : $msg ]
    });

    return;
}

# socket.io
sub disconnect {
    my $self = shift;

    if ( my $cb = delete $self->{_resume} ) {
        $cb->({ messages => [] });
    } else {
        $loop->drop( $self->con->tx ) if $self->con;
    }

    foreach ( values %{ $self->_timers } ) {
        $loop->drop( $_ );
    }

    $clients->remove( $self->id );
    $self->_timers( {} );

    return;
}

sub publish {
    $clients->publish( shift, shift->id, @_ );
}

sub subscribe {
    $clients->subscribe( shift->id, @_ );
}

sub unsubscribe {
    $clients->unsubscribe( shift->id, @_ );
}

sub timer {
    return $loop->timer( @_[ 1 .. $#_ ] );
}

sub heartbeat {
    my ( $self, $secs ) = @_;

    return unless $self->is_websocket;

    if ( my $id = delete $self->_timers->{heartbeat} ) {
        $loop->drop( $id );
    }

    my $heartbeat;
    $heartbeat = sub {
        $self->con->send_message('{"heartbeat":"1"}'); # no need to json encode this
        $self->_timers->{heartbeat} = $loop->timer( $secs => $heartbeat );
    };

    $self->_timers->{heartbeat} = $loop->timer( $secs => $heartbeat );

    return;
}

sub get_data {
    my ( $self, $secs ) = @_;

    return if !$self->con || $self->_timers->{longpoll};

    return $clients->get_client_data_websocket( $self->id ) if $self->is_websocket;

    $self->con->tx->pause;

    # get data, or wait for it
    $clients->get_client_data( $self->id, sub {
        my $data = shift;
        warn Data::Dumper->Dump([$data],['data']);

        if ( @$data ) {
            if ( my $cb = delete $self->{_resume} ) {
                # longpoll
                $cb->({ messages => $data });
            } else {
                # simple request
                $self->con->tx->resume;
                $self->con->render_json({ messages => $data });
            }
            return;
        }

        $secs ||= 15;

        warn "waiting $secs for data\n";
        $self->{_resume} = sub {
            my $ret = $_[1];
            delete $self->{_resume};
            $loop->drop( delete $self->_timers->{longpoll} );
            $self->con->tx->resume;
            if ( ref $ret eq 'ARRAY' ) {
                warn Data::Dumper->Dump([$ret],['ret']);
                $self->con->render_json({ messages => $ret });
            } else {
                warn "longpoll timed out\n";
                $self->con->render_json({ messages => [] });
            }
        };
        $self->_timers->{longpoll} = $loop->timer( $secs => $self->{_resume} );
    });

    return;
}

1;

