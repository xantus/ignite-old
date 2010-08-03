# Copyright (C) 2010, Sascha Kiefer.

package MojoX::CouchDB::DesignDocument;
use base qw/MojoX::CouchDB::Document/;

use strict;
use warnings;

sub new {
	my $class = shift;
	
	my $self = $class->SUPER::new( @_ );
	$self->views( {} )
		unless $self->views;
	$self->language( 'javascript' )
		unless $self->language;
	
	return $self;
}

sub id {
	my ( $self, $id ) = @_;

	$id = "_design/$id"
		if $id and $id =~ /^_design\//i;
	return $self->SUPER::id( $id );
}

sub language { shift->field( language => @_ ) }

sub views { shift->field( views => @_ ) }

1;