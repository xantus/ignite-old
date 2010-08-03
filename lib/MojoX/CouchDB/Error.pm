# Copyright (C) 2010, Sascha Kiefer.

package MojoX::CouchDB::Error;
use base qw/Mojo::Base/;

use strict;
use warnings;

use Mojo::JSON;

use overload
  bool => sub {0},
  '""' => sub {
    my $self = shift;
    return sprintf("An error has occured: %s, reason: %s\n",
        $self->error, $self->reason);
  };

__PACKAGE__->attr([qw/error reason/] => undef);

sub to_json {
    my $self    = shift;
    my $encoder = Mojo::JSON->new;

    my $retval = $encoder->encode({map { $_ => $self->$_ } qw/error reason/});
    die "Unable to encode to json: " . $encoder->error
      unless $retval && !$encoder->error;

    return $retval;
}

1;
