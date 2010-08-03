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
    my $config = undef;

    *{"${caller}::socketio"} = sub {
        my $event = shift or die 'usage: socketio \'event\' => sub { ... }';

        die "you must specify a config before any socketio commands, try: ignite 'config' => 'http://127.0.0.1:5984/ignite/config';"
            unless defined $config;

        # auto load the plugin
        unless ( defined $ignite ) {
            $ENV{IGNITE_PLUGIN} = $ignite = $app->plugins->load_plugin( $app, 'ignite', { config => $config } );
        }
        $ignite->plugins->add_hook( $event => @_ ) unless $event eq 'config';
    };

    *{"${caller}::ignite"} = sub {
        my $event = shift or die 'usage: ignite \'event\' => sub { ... }';

        if ( $event eq 'config' ) {
            $config = shift or die 'usage ignite \'config\' => \'http://127.0.0.1:5984/ignite\'';
            $ignite->_config( $app, $config ) if defined $ignite;
            return;
        }

        warn "Ignite::Lite - ignored: $event";
    };
}

1;

__END__

=head1 NAME

Ignite::Lite - Socket.io plugin for Mojolicious::Lite

=head1 SYNOPSIS

    use Ignite::Lite;

    ignite 'config' => 'http://127.0.0.1:5984/ignite'; # config key assumed
    # or
    ignite 'config' => [ 'http://127.0.0.1:5984/ignite' => 'config' ]; # config key assumed

    socketio 'open' => sub { my ( $client, $plugin ) = @_; ... }
    socketio 'close' => sub { my ( $client, $plugin ) = @_; ... }
    socketio 'message' => sub { my ( $client, $plugin ) = @_; ... }


=head1 DESCRIPTION

L<Ignite::Lite> is socket.io for Mojolicious::Lite

=head1 METHODS

=head2 C<socketio> $event => sub { ... }

    # events suppported: open, close, message

    socketio 'open' => sub { my ( $client, $plugin ) = @_; ... }
    socketio 'close' => sub { my ( $client, $plugin ) = @_; ... }
    socketio 'message' => sub { my ( $client, $plugin ) = @_; ... }

=head2 C<ignite> $cmd => $params

    # currently only 'config' is supported when using the ignite method

    ignite 'config' => 'http://127.0.0.1:5984/ignite'; # couchdb url to ignite db

=head1 SEE ALSO

L<Mojolicious::Lite>, L<Mojolicious::Plugin::Ignite>,
L<Mojolicious>, L<Mojolicious::Guides>, L<http://mojolicious.org>.

=cut
