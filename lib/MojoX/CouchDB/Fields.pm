# Copyright (C) 2010, Sascha Kiefer.

package MojoX::CouchDB::Fields;
use base qw/MojoX::CouchDB::Element/;

use strict;
use warnings;
use overload '""' => sub { shift->to_json };

our $UNFOLD_FIELD_VALUES = 0;

__PACKAGE__->attr(_all_names => sub { {} });

sub new {
    my ($class, %args) = @_;

    my $self = $class->SUPER::new(couch_db => delete $args{couch_db})
      || return;
    while (my ($key, $val) = each %args) {
        $self->field($key, $val);
    }

    return $self;
}

sub all_names {
    my $self   = shift;
    my @retval = keys %{$self->_all_names};
    return wantarray ? @retval : \@retval;
}

sub names {
    my $self   = shift;
    my %keep   = map { $_ => 1 } @_;
    my @retval = ();
    foreach my $name ($self->all_names) {
        next if substr($name, 0, 1) eq '_' && not exists $keep{$name};
        push @retval, $name;
    }
    return wantarray ? @retval : \@retval;
}

sub _build_field_attr {
    my ($self, $field) = @_;
    my $prefix = substr($field, 0, 1) eq '_' ? '_' : '';
    $field = substr($field, 1) if $prefix;
    return "${prefix}field_$field";
}

sub field {
    my ($self, $field) = (shift, shift);

    my $can;
    my $attr = $self->_build_field_attr($field);
    if (@_) {
        $self->_all_names->{$field}++;

        my $value = shift;
        $value = $self->new(couch_db => $self->couch_db, %$value)
          if $UNFOLD_FIELD_VALUES && ref $value eq 'HASH';
        $self->{$attr} = $value;
    }

    return $self->{$attr};
}

sub to_json {
    my $self = shift;
    my $fields = @_ ? (ref $_[0] eq 'ARRAY' ? $_[0] : \@_) : $self->names;
    return $self->couch_db->encode_json(
        {map { ($_ => $self->field($_)) } @$fields});
}

1;
