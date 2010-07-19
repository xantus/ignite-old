package Ignite::Lite;

use strict;
use warnings;

sub import {
    my $caller = caller;

#    eval( "package $caller; use Mojolicious::Lite;" );

    # Prepare exports
    no strict 'refs';
    no warnings 'redefine';

    my $app = $ENV{MOJO_APP} or die 'You must use Mojolicious::Lite before Ignite::Lite';

    my $plug = $app->plugins->load_plugin($app, 'ignite');

    $ENV{IGNITE_PLUGIN} = $plug;

     *{"${caller}::socketio"} = sub { $plug->_handle(@_) };
}

1;
