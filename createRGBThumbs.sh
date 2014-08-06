#!/bin/bash



for dir in `find data -type d | sort` ; do
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
