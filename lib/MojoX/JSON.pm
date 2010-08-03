package MojoX::JSON;

use Mojo::JSON;

our $SINGLETON;

BEGIN {
    # install JSON::XS if you can!
    eval 'use JSON();';
    eval ( $@ ? 'sub HAS_JSON(){ 0 }' : 'sub HAS_JSON(){ 1 }' );
};

sub singleton {
    $SINGLETON ||= shift->new( @_ );
}

sub new {
    return HAS_JSON ? 'JSON'->new( @_[ 1 .. $#_ ] ) : Mojo::JSON->new( @_[ 1 .. $#_ ] );
}

1;
