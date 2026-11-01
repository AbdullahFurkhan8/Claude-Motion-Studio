#!/bin/sh
# usage: tools/stills.sh <v> <out.jpg> t1 t2 ...  (renders stills at scale .5 and tiles them)
v=$1; out=$2; shift 2; d=cache/stills_$$; mkdir -p $d; i=0
for t in "$@"; do node src/render.js --v $v --fps 1 --from $t --to $(python -c "print($t+0.5)") --scale .5 --out $d/s$i --jpg >/dev/null 2>&1; cp $d/s$i/00000.jpg $d/$(printf %03d $i).jpg; i=$((i+1)); done
n=$i; ffmpeg -v error -y -i $d/%03d.jpg -vf tile=${n}x1 $out; rm -rf $d
