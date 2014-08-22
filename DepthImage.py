#!/usr/bin/python

import png
import math
from numpy import *

class DepthImage:


    def __init__(self, w, h, p):
        self.width = w
        self.height = h
        self.path = p
        self.dataType = int
        self.rows = ones((w,h), dtype = int)
        self.bitDepth = 8
        self.x_index = 0
        self.y_index = 0
        self.quantizeFactor = (2 ** self.bitDepth) - 1

    def setDimensions( self, w, h ) :
        self.width = w
        self.height = h

    def setPath( self, p ) :
        self.path = p

    def setDataType( self, dt ) :
        self.dataType = dt

    def setBitDepth( self, d ) :
        self.bitDepth = d

    def initializeImage( self ) :
        self.rows = ones((w,h), dtype = self.dataType)

    def writeFile( self ) :
#        print( 'called writeFile')
        f = open(self.path, 'wb')
        w = png.Writer(len(self.rows[0]), len(self.rows), greyscale=True, bitdepth=self.bitDepth)
        w.write(f, self.rows)
        f.close()

    def addRowData(self, data, repeat) :
        q = self.quantize( float(data) )
        for i in range (0, int(repeat)) :
#            print('adding: ' + str(q) + ' at [' + str(self.x_index%self.width) + ',' + str(self.y_index) + ']' )
            self.rows[self.x_index%self.width][self.y_index] = q
#            print (self.path + ' added value: ' + str(self.rows[self.x_index%self.width][self.y_index]))
            self.x_index += 1
            #When we wrap x, add another row
            if self.x_index%self.width == 0 :
                self.y_index += 1

    def quantize(self, data) :
        q = data*self.quantizeFactor
        return int(math.floor(q))

    def printRowData(self) :
#        print( 'Current rows for ' + self.path )
        dataString = '[\n'
        for y in range (0, self.y_index) :
            dataString += '['
            for x in range (0, self.x_index%500) :
                dataString += (str(self.rows[x,y]) + ' ')
            dataString += '],\n'
        dataString += ']\n'
#        print (dataString)

    def path(self) :
        return self.filePath
