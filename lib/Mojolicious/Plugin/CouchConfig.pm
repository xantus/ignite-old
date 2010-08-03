package Mojolicious::Plugin::CouchConfig;

use strict;
use warnings;

use base 'Mojolicious::Plugin';

use MojoX::CouchDB;

sub register {
    my ( $plugin, $app, $data ) = @_;

    my ( $couchurl, $config_key ) = @$data;

    my $couch = MojoX::CouchDB->new;

    my $url = Mojo::URL->new( $couchurl );

    $couch->address( $url->host );
    $couch->port( $url->port || 5984 );

    my $db_name = $url->path->parts->[0];
    $config_key ||= $url->path->parts->[1] || 'config';

    my $db = $self->couch->new_database( $db_name );
    my $cfg = $db->get_document( $config_key );

    if ( $cfg->isa( 'MojoX::CouchDB::Error' ) ) {
        die "failed to load config from $url : $cfg\n";
    }

    # load special key mojo_config and apply it to the app
    if ( my $mojo = $doc->field( 'mojo_config' ) ) {
        die "mojo_config from @$cfg is not a hash" unless ref $mojo eq 'HASH';
        @{$app}{keys %$mojo} = values %$mojo;
    }
}

1;
