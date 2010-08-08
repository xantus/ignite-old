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

sub has_json {
    return HAS_JSON;
}

sub setup_hook {
    my $app = $_[1];

    return unless HAS_JSON;

    $app->plugins->add_hook(
        after_build_tx => sub {
            my $tx = $_[1];
            $tx->res->json_class('JSON');
            $tx->req->json_class('JSON');
        }
    );
}

1;
