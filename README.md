simpleCinemaWebGL
=================

A working prototype using webGL to perform cinema's image compositing

The code assumes that you've split all of your rbg.jpg images into individual 500x500 pixel images using the provided script, createRGBThumbs.sh. I wrote in in bash for expediency, but it could easily be changed to python for users not on Linux.

To use that script call:

bash createRGBThumbs.sh /path/to/data/

Converting composite.json files to depth images, use the script, createDepthImages.py. To use the script:
1) Install pypng, e.g. `pip install pypng`
2) run with the path to data as an argument `python createDepthImages.py /path/to/data
