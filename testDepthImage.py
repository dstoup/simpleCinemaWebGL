#!/usr/bin/python

from DepthImage import *

img = DepthImage(100,100,'test.png')

for i in range ( 0,10000 ) :
    img.addRowData(1/float((i+1)),1)

img.printRowData()
img.writeFile()
