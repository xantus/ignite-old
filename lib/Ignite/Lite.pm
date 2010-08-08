package Ignite::Lite;

use strict;
use warnings;

our $VERSION = '1.00';

sub import {
    my $caller = caller;

    # could auto use mojo lite here
    eval( "package $caller; use Mojolicious::Lite;" );

    # Prepare exports
    no strict 'refs';
    no warnings 'redefine';

    my $app = $ENV{MOJO_APP} or die 'You must use Mojolicious::Lite before Ignite::Lite';

    my $ignite = undef;

    *{"${caller}::socketio"} = sub {
        my $event = shift or die 'usage: socketio \'event\' => sub { ... }';

        die "You must ignite->init( \$couchurl ) first\n" unless defined $ignite;

        $ignite->plugins->add_hook( $event => @_ );
    };

    *{"${caller}::ignite"} = sub {
        # auto load the plugin
        unless ( defined $ignite ) {
            $ENV{IGNITE_PLUGIN} = $ignite = $app->plugins->load_plugin( $app, 'ignite' );
        }
        return $ignite;
    };
}

1;

__END__

=head1 NAME

Ignite::Lite - Socket.io plugin for Mojolicious::Lite

=head1 SYNOPSIS

    use Ignite::Lite;

    ignite->init( 'http://127.0.0.1:5984/ignite' ); # config key is assumed
    # or
    ignite->init( 'http://127.0.0.1:5984/ignite/config' );

    socketio 'open' => sub { my ( $client, $plugin ) = @_; ... }
    socketio 'close' => sub { my ( $client, $plugin ) = @_; ... }
    socketio 'message' => sub { my ( $client, $plugin ) = @_; ... }


=head1 DESCRIPTION

L<Ignite::Lite> is socket.io for Mojolicious::Lite

=head1 METHODS

=head2 C<socketio> $event => sub { ... }

    # events suppported: open, close, message

    socketio 'open' => sub { my $client = shift; ... }
    socketio 'close' => sub { my $client = shift; ... }
    socketio 'message' => sub { my ( $client, $msg ) = @_; ... }

=head2 C<ignite>

    returns the ignite singleton

=head2 C<publish>

=head2 C<subscribe>

=head2 C<broadcast>

=head1 SEE ALSO

L<Mojolicious::Lite>, L<Mojolicious::Plugin::Ignite>,
L<Mojolicious>, L<Mojolicious::Guides>, L<http://mojolicious.org>.

=cut
