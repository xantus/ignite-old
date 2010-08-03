package Ignite::App;

use strict;
use warnings;

use base 'Mojolicious';

our $VERSION = '2.01';

# This method will run for each request
sub process {
    my ( $self, $c ) = @_;

    $self->dispatch( $c );
}

sub production_mode {
    shift->log->level( 'error' );
}

sub development_mode {
    shift->log->level( 'debug' );
}

sub startup {
    my $self = shift;

    $self->plugin( 'ignite' => [ $ENV{IGNITE_CONFIG} ||  'http://127.0.0.1:5984/ignite/config' ] );

    return;
}


1;
