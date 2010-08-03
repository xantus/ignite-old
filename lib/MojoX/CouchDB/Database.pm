# Copyright (C) 2010, Sascha Kiefer.

package MojoX::CouchDB::Database;
use base qw/MojoX::CouchDB/;

use strict;
use warnings;

use MojoX::CouchDB::Fields;
use MojoX::CouchDB::Document;

__PACKAGE__->attr(name           => undef);
__PACKAGE__->attr(document_class => 'MojoX::CouchDB::Document');

sub _cleared_name {
    my ($self, $name) = @_;

    $name ||= $self->name || '';
    $name =~ y/\///;

    return $name;
}

sub all_documents {
    my $self = shift;

    my $cb = ref $_[-1] && ref $_[-1] eq 'CODE' ? pop : undef;
    my $name = $self->_cleared_name(pop);
    die 'Database name not defined.' unless $name;

    my %options = (synced => $cb ? 0 : 1, ref $_[0] eq 'HASH' ? %{$_[0]} : ());

    my $retval;
    $self->raw_get(
        "/$name/_all_docs" => {include_docs => 'true'} => \%options => sub {
            my ($c, $d, $e) = @_;
            return $retval = $self->_handle_error($cb, $e) if defined $e;
            foreach my $row (@{$d->field('rows')}) {
                my $doc = $self->_build_document(%{$row->{doc}});
                if ($cb) { $cb->($self, $doc) }
                else     { push @{$retval ||= []}, $doc }
            }
        }
    );
    return wantarray ? @$retval : $retval;
}

sub get_document {
    my ($self, $id) = (shift, shift);

    die 'Id of document to get is not defined.' unless defined $id;

    my $name = $self->_cleared_name;
    die 'Database name not defined.' unless $name;

    my $cb = ref $_[-1] && ref $_[-1] eq 'CODE' ? pop : undef;
    my $query = shift || {};

    my @args = ($query, {});
    push @args, $cb if $cb;

    return $self->raw_get("/$name/$id", @args);
}

sub query_view {
    my ($self, $id, $function) = (shift, shift, shift);

    die 'Id of view to query is not defined.' unless $id;
    $id = $self->_build_design_id($id);

    die 'Function of view to query is not defined.' unless $function;

    my $name = $self->_cleared_name;
    die 'Database name not defined.' unless $name;

    my $cb = ref $_[-1] && ref $_[-1] eq 'CODE' ? pop : undef;
    my $query = shift || {};

    my @args = ($query, {});
    push @args, $cb if $cb;

    return $self->raw_get("/$name/$id/_view/$function", @args);
}

sub create_document {
    my $self = shift;

    my $cb = ref $_[-1] && ref $_[-1] eq 'CODE' ? pop : undef;
    my $id = shift;

    my $doc = $self->_build_document(@_);
    $doc->id($id) if defined $id;
    return $doc->create($cb);
}

sub new_document {
    my ($self, $id) = (shift, shift);
    my $doc = $self->_build_document(@_);
    $doc->id($id) if defined $id;
    return $doc;
}


#sub create_views {
#	my ($self, $id) = (shift, shift);
#
#    my $cb = ref $_[-1] && ref $_[-1] eq 'CODE' ? pop : undef;
#
#	die 'Id of document to get not defined.' unless $id;
#	$id = $self->_build_design_id( $id );
#
#}

sub information {
    my $self = shift;

    my $cb = ref $_[-1] && ref $_[-1] eq 'CODE' ? pop : undef;
    my $name = $self->_cleared_name(pop);
    die 'Database name not defined.' unless $name;

    my %options = (synced => $cb ? 0 : 1, ref $_[0] eq 'HASH' ? %{$_[0]} : ());

    my $retval;
    $self->raw_get(
        "/$name" => \%options => sub {
            my ($c, $d, $e) = @_;
            return $retval = $self->_handle_error($cb, $e) if defined $e;
            $retval = $cb ? $cb->($self, $d) : $d;
        }
    );
    return $retval;
}

sub create {
    my $self = shift;

    my $cb = ref $_[-1] && ref $_[-1] eq 'CODE' ? pop : undef;
    my $name = $self->_cleared_name(pop);
    die 'Database name not defined.' unless $name;

    my %options = (synced => $cb ? 0 : 1, @_);

    my $retval;
    $self->raw_put(
        "/$name" => \%options => sub {
            my ($c, $d, $e) = @_;

            # warn "c: $c, d: $d, e: $e";
            return $retval = $self->_handle_error($cb, $e) if defined $e;
            return $retval = $self->_handle_error(
                $cb,
                MojoX::CouchDB::Error->new(
                    error  => 'Unknown',
                    reason => 'Unknown reason',
                )
            ) unless $d->field('ok');

            $retval = $cb ? $cb->($self, $self) : $self;
        }
    );
    return $retval;
}

sub delete {
    my $self = shift;

    my $cb = ref $_[-1] && ref $_[-1] eq 'CODE' ? pop : undef;
    my $name = $self->_cleared_name(pop);
    die 'Database name not defined.' unless $name;

    my %options = (synced => $cb ? 0 : 1, @_);

    my $retval;
    $self->raw_delete(
        "/$name" => \%options => sub {
            my ($c, $d, $e) = @_;
            return $retval = $self->_handle_error($cb, $e) if defined $e;
            $retval = $cb ? $cb->($self, $d) : $d;
        }
    );
    return $retval;
}

1;
