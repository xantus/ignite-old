package Ignite::Plugins;

use strict;
use warnings;

use base 'Mojolicious::Plugins';

__PACKAGE__->attr(hooks      => sub { {} });
__PACKAGE__->attr(namespaces => sub { ['Ignite::Plugin'] });

sub run_hook {
    my $self = shift;

    # Shortcut
    my $name = shift;
    return $self unless $name;
    return unless $self->hooks->{$name};

    # Run
    for my $hook (@{$self->hooks->{$name}}) { $hook->(@_) }

    return $self;
}

sub run_hook_reverse {
    my $self = shift;

    # Shortcut
    my $name = shift;
    return $self unless $name;
    return unless $self->hooks->{$name};

    # Run
    for my $hook (reverse @{$self->hooks->{$name}}) { $hook->(@_) }

    return $self;
}
1;
