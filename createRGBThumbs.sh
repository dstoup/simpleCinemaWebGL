#!/bin/bash

data_dir=$1

if [ -ne $data_dir ]
then
    echo "Required argument missing: Path to the data directory"
    exit 1;
fi

for dir in `find $data_dir -type d | sort` ; do
    echo $dir
    y=0
    i=0
    if [ -e "$dir/rgb.jpg" ]
    then
        echo "$dir/rgb.jpg exists"
        while [ $y -lt 11000 ]; do
            echo "cropping $dir/rgb.jpg to $dir/rgb$i.jpg"
            convert $dir/rgb.jpg -crop 500x500+0+$y $dir/rgb$i.jpg
            let y=y+500
            let i=i+1
        done
    fi
done
