#!/usr/bin/perl


use strict;
use warnings;

use JSON;

open(my $fh,">>data.txt") or die $!;
open(FH,"sudo ngrep -d eth3 -W byline port 80|") or die $!;
while(<FH>) {
    foreach(split(/\n/)) {
        next unless m/<script>d\(([^\)]+)\)/;
        my $x = "$1";my $y = "$1";
        $x =~ s/"//g;
        my $o = { utime => time() };
        # 4,2,"last","norm","time","change","bid size","bid","ask","ask size"
        @{$o}{qw( n1 n2 unk last time change bid_size bid ask ask_size )} = split( ',', $x );
        my $out = JSON::encode_json($o);
        print "$y\n$x\n$out\n";
        print $fh "$out\n";
    }
}
close($fh);
close(FH);
