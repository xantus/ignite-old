# Copyright (C) 2010, Sascha Kiefer.

package MojoX::CouchDB;
use base qw/Mojo::Base/;

use strict;
use warnings;

use Mojo::Client;
use Mojo::JSON;
use Mojo::URL;
use Mojo::IOLoop;
use Mojo::Log;

use Scalar::Util 'blessed';

use MojoX::CouchDB::Error;
use MojoX::CouchDB::Database;
use MojoX::CouchDB::Document;
use MojoX::CouchDB::DesignDocument;
use MojoX::CouchDB::Fields;

our $VERSION = '0.001';

__PACKAGE__->attr(address => $ENV{MOJOX_COUCHDB_ADDRESS} || '127.0.0.1');
__PACKAGE__->attr(client => sub { Mojo::Client->new(log => $_[0]->log) });
__PACKAGE__->attr(port => $ENV{MOJOX_COUCHDB_PORT} || '5984');
__PACKAGE__->attr(log => sub { Mojo::Log->new });

__PACKAGE__->attr(_json_decoder => sub { Mojo::JSON->new });
__PACKAGE__->attr(_json_encoder => sub { Mojo::JSON->new });

sub all_databases {
    my ($self, $cb) = (shift, pop);
    my %options = (synced => $cb ? 0 : 1, ref $_[0] eq 'HASH' ? %{$_[0]} : ());

    my $retval = [];
    $self->raw_get(
        '/_all_dbs' => \%options => sub {
            my ($c, $d, $e) = @_;
            return $retval = $self->_handle_error($cb, $e) if defined $e;

            foreach my $name (@{$d->field('result')}) {
                my $db = $self->new_database($name);
				
				if ($cb) { $cb->($self, $db) }
                else     { push @$retval, $db }
            }
        }
    );
    return wantarray && ref $retval eq 'ARRAY' ? @$retval : $retval;
}

sub decode_json {
    my ($self, $data) = (shift, shift);

    die "No JSON decoder defined."
      unless my $json = $self->_json_decoder;

    $data = $json->decode($data);
    return $self->_handle_error(undef,
        {error => 'json_decode', reason => $json->error})
      unless $data && !$json->error;

    return $data;
}

sub encode_json {
    my ($self, $data) = (shift, shift);

    die "No JSON encoder defined."
      unless my $json = $self->_json_encoder;

    $data = $json->encode($data);
    return $self->_handle_error(undef,
        {error => 'json_encode', reason => $json->error})
      unless $data && !$json->error;

    return $data;
}

sub information {
    my ($self, $cb) = (shift, pop);
    my %options = (synced => $cb ? 0 : 1, @_);

    my $retval;
    $self->raw_get(
        '/' => \%options => sub {
            my ($c, $d, $e) = @_;
            return $retval = $self->_handle_error($cb, $e) if defined $e;
            $retval = $cb ? $cb->($self, $d) : $d;
        }
    );
    return $retval;
}

sub create_database {
    my $self = shift;

    my $cb = ref $_[-1] && ref $_[-1] eq 'CODE' ? pop : undef;
    my $name = shift;

    my $db = $self->new_database($name);
    return $db->create($cb);
}


sub new_database {
    my ($self, $name) = @_;
    return MojoX::CouchDB::Database->new(
        address => $self->address,
        client  => $self->client,
        log     => $self->log,
        name    => $name,
        port    => $self->port,
    );
}

sub raw { shift->_make_request(@_); }

sub raw_delete { shift->_make_request('delete', @_); }

sub raw_get { shift->_make_request('get', @_); }

sub raw_post { shift->_make_request('post', @_); }

sub raw_put { shift->_make_request('put', @_); }

sub _handle_error {
    my ($self, $cb, $e) = @_;
    $e = MojoX::CouchDB::Error->new(
        ref $e eq 'HASH'
        ? %$e
        : (error => 'Unexpected error', reason => 'Unkown')
    ) unless blessed $e && $e->isa('MojoX::CouchDB::Error');
    return $cb ? $cb->($self, undef, $e) : $e;
}

sub _asynced_client { shift->client->async; }

sub _synced_client { shift->client; }

sub _build_design_id {
    my ($self, $id) = @_;
    $id = "_design/$id" unless $id =~ /^_design\//i;
    return $id;
}

sub _build_document {
    my $self = shift;

    my $fields = $_[0];
    $fields = MojoX::CouchDB::Fields->new(couch_db => $self, @_)
      unless blessed $fields && $fields->isa('MojoX::CouchDB::Fields');

    my $id = $fields->field('_id') || '';
    my $class =
      $id =~ /^_design\//i ? 'MojoX::CouchDB::DesignDocument'
      : ($self->can('document_class') && $self->document_class)
      ? $self->document_class
      : 'MojoX::CouchDB::Document';
    my $doc = $class->new(
        couch_db => $self,
        fields   => $fields
    );
    warn
      "Successfully build a document but document is not a 'MojoX::CouchDB::Document'"
      if $doc && !$doc->isa('MojoX::CouchDB::Document');

    return $doc;
}

sub _handle_response {
    my ($self, $client, $tx, $cb) = @_;

    return $self->_handle_error($cb,
        {error => 'connection_failed', reason => $tx->error})
      if $tx->error;

    my $rc   = $tx->res->code;
    my $body = $tx->res->body;
    my $data = $self->decode_json($body);

    # $self->log->debug("Handling response: $body");

    return $self->_handle_error($cb, $data)
      unless $rc >= 200 && $rc <= 299;

    my $args = ref $data eq 'HASH' ? $data : {result => $data};
    my $fields = MojoX::CouchDB::Fields->new(couch_db => $self, %$args);

    my $retval =
         $fields->field('_id')
      && $fields->field('_rev')
      ? $self->_build_document($fields)
      : $fields;

    return $cb ? $cb->($self, $retval) : $retval;
}

sub _build_url {
    my ($self, $path) = (shift, shift || '');

    $path = "/$path"
      unless substr($path, 0, 1) eq '/';

    my $url = Mojo::URL->new;
    $url->scheme('http');
    $url->host($self->address);
    $url->port($self->port);
    $url->path($path);

    return $url;
}

sub _make_request {
    my ($self, $method, $path) = (shift, shift, shift);

    my $cb      = (ref $_[-1] && ref $_[-1] eq 'CODE') ? pop : undef;
    my $options = (ref $_[-1] && ref $_[-1] eq 'HASH') ? pop : {};
    my $data    = shift;
    my $body;

    my $url = $self->_build_url($path);
    if ('p' eq lc substr $method, 0, 1) {
        $body = $data;
        if (ref $body) {
            if (blessed $body) {
                die "data-object has no to_json method"
                  unless $body->can('to_json');
                $body = $body->to_json;
            }
            else {
                $body = $self->encode_json($body);
            }
        }
    }
    else {
        $url->query(ref $data eq 'HASH' ? %$data : $data)
          if $data;
    }

    my %headers;
    $headers{Connection} = 'close'
      if $options->{close} || $ENV{MOJOX_COUCHDB_CLOSECONNECTION};
    $headers{'Content-Type'} = 'application/json' if $body;

    my $client = $cb
      && !$options->{synced} ? $self->_asynced_client : $self->_synced_client;

    my $log = $self->log;
    $self->log->debug("$method: $url") if $ENV{MOJOX_COUCHDB_DEBUG} && $log;

    my $retval;

    my @call = ($url);
    if (keys %headers) {
        push @call, \%headers;
        push @call, $body || '';
    }
    push @call, sub {
        my ($c, $tx) = @_;
        $retval = $self->_handle_response($c, $tx, $cb);
    };
    $client->$method(@call)->process;

    return wantarray && ref $retval eq 'ARRAY' ? @$retval : $retval;
}

1;
__END__

=head1 NAME

MojoX::CouchDB - A CouchDB extension to The Box!

=head1 SYNOPSIS

	#!/usr/bin/perl
	
	use strict;
	use warnings;
	
	use MojoX::CouchDB;
	
	my $couch = MojoX::CouchDB->new;
	foreach my $db ($couch->all_databases) {
		print "All documents in database: ", $db->name, "\n";
		print "\t", $_->to_json, "\n"
		  foreach ($db->all_documents);
	}

=head1 DESCRIPTION

MojoX::CouchDB extends The Box! by a CouchDB Model.

=head1 ATTRIBUTES

L<MojoX::CouchDB> inherits all attributes from L<Mojo::Base> and implements the
following new ones.

=head2 C<address>

	my $address = $couch->address;
	$couch->address('127.0.0.1');
	
The address or host of the maschine your CouchDB server is running on.

=head2 C<client>

	my $client = $couch->client;
	$couch->client(Mojo::Client->new);
	
Client object to use for HTTP operations, by default a Mojo::Client object will be used.

=head2 C<log>

	my $log = $couch->log;
	$couch->log(Mojo::Log->new);
	
Log object to use for logging, by default a Mojo::LOg object will be used.

=head2 C<port>

	my $port = $couch->port;
	$couch->port(5984);
	
The TCP port on which your CouchDB server is listening on.

=head1 METHODS

=head2 C<all_databases>

	# GET /_all_dbs
	
	# synchron
	# my @databases = $couch->all_databases; <- ok
	# better
	if(my $databases = $couch->all_databases) {
		foreach my $db (@$databases) {
			# $db isa MojoX::CouchDB::Database
			print "Database: ", $db->name, "\n";
		}
	} else {
		# $information isa MojoX::CouchDB::Error object
		print STDERR "What happened: $databases\n";
	}
	
	# asynchron
	$couch->all_databases(sub {
		my ($c, $databases, $error) = @_;
		
		if(defined $databases) {
			foreach my $db (@$databases) {				
				print "Database: ", $db->name, "\n";
			}
		} else {
			print STDERR "What happened: $error\n";
		}
	});
	
Retrieves a list of C<MojoX::CouchDB::Database> objects of all databases on the CouchDB server.
Optional: first argument may be a callback function to retrieve all databases asynchron. See L<CALLBACKS> for more information.

=head2 C<information>
	
	# GET /

	# synchron
	if(my $information = $couch->information) {
		# $information isa MojoX::CouchDB::Fields object
		print "CouchDB version: ", $information->field('version'), "\n";
	} else {
		# $information isa MojoX::CouchDB::Error object
		print STDERR "What happened: $information\n";
	}
	
	# asynchron
	$couch->information(sub {
		my ($c, $information, $error) = @_;
		
		if(defined $information) {
			print "CouchDB version: ", $information->field('version'), "\n";
		} else {
			print STDERR "What happened: $error\n";
		}
	});
		
Retrieve information of CouchDB server instance.
Optional: first argument may be a callback function to retrieve information asynchron. See L<CALLBACKS> for more information.

=head2 C<create_database>

	# PUT /foo
	
	# synchron
	if(my $database = $couch->create_database('foo')) {
		# $database isa MojoX::CouchDB::Database object
		# do something with it
	} else {
		# $database isa MojoX::CouchDB::Error object
		print STDERR "What happened: $database\n";
	}
	
Creates a new database. 
Required: first argument is the name of the database to be created.
Optional: second argument may be a callback function to create the database asynchron. See L<CALLBACKS> for more information.

=head1 RAW METHODS

All raw methods have the following signature

raw_*( $uri, $data, $options, $cb )

I<$uri>, required: the path of the uri you want to send the request to

I<$data>, optional: query or body data

I<$options>, optional: an hash-ref with addional options

=over 4

=item * synced => 0 | 1, when using a callback, all requests are asynchron. Set this to 1, to make a synced request with using the callback

=item * close => 0 | 1, MojoX::CouchDB uses the advantages of HTTP/1.1 and keeps connections to the CouchDB server alive. 
Setting I<close> to 1 will will close the connection

=back

I<$cb>, optional: a callback function

=head2 C<raw_get>

	# synchron 
	# http://127.0.0.1:5984/foo/_revisions?revs=true
	my $rc = $couch->raw_get( "/foo/_revisions", { revs => 'true' } );
	
=head2 C<raw_put>

	# synchron 	
	my $rc = $couch->raw_put( "/foo", $data )
	
If I<$data> is a not a ref, the content will be used as-is. If it is blessed, the object must support an I<to_json> method.
In all other cases, it will be encoded as json using the encode_json method.
	
=head2 C<raw_post>

	# synchron 
	my $rc = $couch->raw_post( "/foo", $json_body )
	
If I<$data> is a not a ref, the content will be used as-is. If it is blessed, the object must support an I<to_json> method.
In all other cases, it will be encoded as json using the encode_json method.
	
=head2 C<raw_delete>

	# synchron 
	my $rc = $couch->raw_delete( "/foo" );
	
=head2 C<raw>

	# synchron 
	my $rc = $couch->raw('head', "/foo" );
	
Same signature as all other raw methods, but you have to specify the method (delete|head|get|post|put|...) for the request as the 
first argument.

=heads CALLBACKS

All arguments accept an optional callback function as their last argument. This callback always has the following signature

	sub {
		my ($context, $result, $error) = @_;
	}
	
I<$context>: Usually a reference to the object that invoked the callback.

I<$result>:	On success, the object that is returned as the result; undef on error

I<$error>: On error, a MojoX::CouchDB::Error object
	
=head1 SUPPORT

=head2 IRC

    #mojo on irc.perl.org (poke esskar)

=head1 DEVELOPMENT

=head2 Repository

    http://github.com/esskar/mojox-couchdb

=head1 AUTHOR

Sascha Kiefer, C<sk@perl.intertivity.com>.

=head1 CREDITS

In alphabetical order:

Marcus Ramberg

Sebastian Riedel

Viacheslav Tykhanovskyi

=head1 COPYRIGHT AND LICENSE

Copyright (C) 2010, Sascha Kiefer.

This program is free software, you can redistribute it and/or modify it under
the terms of the Artistic License version 2.0.

=cut
