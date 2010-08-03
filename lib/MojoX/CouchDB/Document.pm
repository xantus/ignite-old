# Copyright (C) 2010, Sascha Kiefer.

package MojoX::CouchDB::Document;
use base qw/MojoX::CouchDB::Element/;

use strict;
use warnings;
use overload '""' => sub { shift->to_json };

use MojoX::CouchDB::Fields;

__PACKAGE__->attr(
    fields => sub { MojoX::CouchDB::Fields->new(couch_db => shift->couch_db) }
);

sub attachments { shift->field('_attachments'); }

sub conflicts { shift->field('_conflicts'); }


sub create {
    my ($self, $cb) = (shift, shift);

    my %options = (synced => $cb ? 0 : 1, @_);

    my $retval;
    my $json     = $self->to_json(include_standard => 0);
    my $path     = $self->_build_path(1);
    my $callback = $self->_update_callback($cb, \$retval);
    if ($self->id) {
        $self->couch_db->raw_put($path => $json => \%options => $callback);
    }
    else {
        $self->couch_db->raw_post($path => $json => \%options => $callback);
    }
    return $retval;
}

sub delete {
    my ($self, @args) = @_;
    my $path = $self->_build_path;
    return $self->couch_db->raw_delete(
        $path => {rev => $self->revision} => {},
        @args
    );
}

sub deleted { shift->field('_deleted') }

sub deleted_conflicts { shift->field('_deleted_conflicts') }

sub id { shift->field('_id', @_); }

sub field {
    my ($self, $field) = (shift, shift);
    $self->fields->field($field => $_[0]) if @_;
    return $self->fields->field($field);
}

sub field_alias {
    my ($class, $aliases, $getter, $setter) = @_;

    $aliases = [$aliases]
      unless ref $aliases eq 'ARRAY';

    no strict 'refs';
    no warnings 'redefine';
    foreach my $alias (@$aliases) {
        *{"${class}::${alias}"} = sub {
            my $self = shift;
            my $rc;
            if (@_) {
                my $value = shift;
                $value = $setter->($value)
                  if $setter && ref $setter eq 'CODE';
                $rc = $self->field($alias, $value, @_);
            }
            else {
                $rc = $self->field($alias);
            }
            $rc = $getter->($rc) if $getter && ref $getter eq 'CODE';
            return $rc;
        };
    }
}


sub revision { shift->field('_rev', @_); }

sub revision_infos { shift->field('_rev_infos') }

sub _build_path {
    my ($self, $id_not_required) = (shift, shift);

    die 'CouchDB is not defined.' unless $self->couch_db;
    die 'CouchDB is not a Database.'
      unless $self->couch_db->isa('MojoX::CouchDB::Database');
    die 'Id is not defined.' unless $self->id || $id_not_required;

    my $name = $self->couch_db->_cleared_name;
    return $self->id ? "/$name/" . $self->id : "/$name";
}

sub revisions {
    my $self = shift;

    my $retval;
    unless ($retval = $self->field('_revisions')) {
        my $path = $self->_build_path;
        $retval = $self->couch_db->raw_get($path => {revs => 'true'});
        $self->field(_revisions => $retval);
    }

    return wantarray && ref $retval eq 'ARRAY' ? @$retval : $retval;
}

sub _update_callback {
    my ($self, $cb, $retval) = @_;
    return sub {
        my ($c, $d, $e) = @_;
        return $$retval = $self->couch_db->_handle_error($cb, $e)
          if defined $e;
        return $$retval = $self->couch_db->_handle_error($cb, $d)
          unless $d->field('ok');

        $self->id($d->field('id'));
        $self->revision($d->field('rev'));
        $$retval = $cb ? $cb->($self, $self) : $self;
    };
}

sub update {
    my ($self, $cb) = (shift, shift);

    my %options = (synced => $cb ? 0 : 1, @_);

    my $retval;
    my $json     = $self->to_json;
    my $path     = $self->_build_path(1);
    my $callback = $self->_update_callback($cb, \$retval);
    $self->couch_db->raw_put($path => $json => \%options => $callback);
    return $retval;
}

sub save {
    my $self = shift;
    return $self->update(@_) if defined $self->revision;
    return $self->create(@_);
}

sub to_json {
    my $self = shift;
    my %options = (include_standard => 1, @_);
    return $options{include_private}
      ? $self->fields->to_json($self->fields->all_names)
      : $options{include_standard}
      ? $self->fields->to_json($self->fields->names(qw/_id _rev/))
      : $self->fields->to_json;
}

1;
