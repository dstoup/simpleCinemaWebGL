#!/usr/bin/python

import os
import sys

trace_level = 0
debug_level = 1
info_level = 2
warn_level = 3
error_level = 4

#Set True to print logging, False to quiet
log_level = info_level

write_debug_map = False
pixelDelimiter = ','

#Walk the data directory looking for all composite.json files
def buildDirectoryList(root):
    dirList = []
    for dirName, subdirList, fileList in os.walk(root):
        debug('Found directory: %s' % dirName)
        for fname in fileList:
            if fname == 'composite.json' :
                dirList.append(dirName)
    return dirList

#Figure out the univers of possible objects for this composite.
#We'll use the query file since it's small to parsse
def buildObjectList(dirName) :
    trace('Bulding object list for: ' + dirName)
    objSet = set()
    qfin = open(os.path.join(dirName, 'query.json'), 'r')
    for line in qfin :
        idx = line.find('+')
        trace( 'line: ' + line )
        #We found our starting point ( '+' )
        #Start parsing the object lists
        if idx != -1 :
            #Skip the leading "
            token = line[1:idx]
            trace('token: ' + token)
            if (token and not token.isspace()) :
                trace( 'Token is not empty' )
                #Add found tokens to the set of possible
                for c in token :
                    trace( 'c: ' + c )
                    objSet.add(c)

    return objSet

#Create the list of possible output file names for this directory
def createOutputFiles(dirName, objSet) :
    outfileList = dict()
    for o in objectSet :
        trace( 'create file name for: ' + o)
        fname = 'depthImage' + o + '.json'
        fullPath = os.path.join(dirName, fname)
        trace('fullPath: ' + fullPath)
        #Create the file in write mode so we always start clean
        f = open(fullPath, 'w')

        #Write out the opening json
        f.write('{\n\"dimensions\": [500, 500],\n')
        f.write('\"depth-image\": \"')
        f.close()
        outfileList[o] = fullPath

    return outfileList

#Given a composite.json file, parse its tokens to create depth
def parseCompositeFile(dirName) :
    cfin = open(os.path.join(dirName, 'composite.json'), 'r')
    debug( 'Parsing ' + os.path.join(dirName, 'composite.json') )

    #Iterate the lines in composite.json
    searchToken = 'pixel-order'
    for line in cfin :
        idx = line.find(searchToken)
        #We found the starting point, pixel-order
        if idx != -1 :
            debug( 'Found the starting point, \'' + searchToken + '\'')
            line = line[idx+len(searchToken):]

            #Below is to clean off the ":   " from the line
            return line.translate(None, ":\" ")

#Given a composites contents, write out the depths for each token
def writeCompositeTokens(line, outfileDict) :
    objCountDict = dict()
    tokensWritten = 0
    numTokens = 0
    plusTokens = 0
    objTokens = 0
    debug( 'Writing composite tokens, line: ' + line[0:20] )
    idx = line.find('+')
    while idx != -1 :
        token = line[0:idx]
        line = line[idx+1:]
        trace('\ntoken: ' + token)
        trace('new line: ' + line[0:40])
        trace('idx: ' + str(idx))
        if token and token[0] == '@' :
            tokensWritten += int(token[1:])
            numTokens += int(token[1:])
            trace(token[1:] + ' tokensWritten: ' + str(tokensWritten))
            writeBackgroundPixel(token[1:], outfileDict)
        elif token :
            tokensWritten += 1
            objTokens += 1
            default = objCountDict.setdefault(token, 0)
            trace('token ' + token + ' has default ' + str(default))
            objCountDict[token] = (default + 1)

            trace('obj tokensWritten: ' + str(tokensWritten))
            writeDepthValues(token, outfileDict)
        if line[0] == '+'  :
            plusCount = 0
            while line[plusCount] == '+' :
                plusCount = plusCount + 1

            line = line[plusCount:]
            trace('plusCount: ' + str(plusCount))
            trace('plus line: ' + line[0:20])
            tokensWritten += int(plusCount)
            plusTokens += int(plusCount)
            trace('+ tokensWritten: ' + str(tokensWritten))
            writeBackgroundPixel(plusCount, outfileDict)

        idx = line.find('+')

    #Write out the closing json
    writeClosingJSON(outfileDict)

    trace( 'Wrote out ' + str(tokensWritten) + ' pixels' )
    trace( 'Wrote out ' + str(numTokens) + ' numTokens' )
    trace( 'Wrote out ' + str(plusTokens) + ' plusTokens' )
    trace( 'Wrote out ' + str(objTokens) + ' objTokens' )

    #The following block writes out a file that is similar to the query.json
    #It is useful for debugging when the counts are off.
    if write_debug_map :
        tout = open('tokenCounts', 'w')
        tout.write('{\n\"dimensions\": [500, 500],\n')
        tout.write('\"counts\": {\n')
        tout.write('\"+\" : 61164')
        for key in sorted(objCountDict) :
            tout.write(',\n')
            tout.write('\"' + key + '+\" : ' + str(objCountDict[key]))
        tout.write('\n}\n}')
        tout.close()


#Function to write out the closing json on each file
def writeClosingJSON(outfileDict) :
    for key in outfileDict :
        f = outfileDict[key]

        #Seek to the end to get rid of trailing delimeter
        fout = open(f, 'rb+')
        fout.seek(-1, os.SEEK_END)
        fout.truncate()

        fout.write('\"\n}')
        fout.close()


#Write out a 1 for each file, numPixels times
def writeBackgroundPixel(numPixels, outfileDict):
    trace('Writing out 1 for ' + str(numPixels) + ' pixels')
    for key in outfileDict :
        f = outfileDict[key]
        debug('Opening outfile: ' + f)
        fout = open(f, 'a+')
        for p in range(0, int(numPixels)) :
            fout.write('1.0' + pixelDelimiter)

        fout.close()

#Write out the depth for all values in token
def writeDepthValues(token, outfileDict) :
    trace( 'writeDepthValues token: ' + token )
    numTokens = len(outfileDict)
    length = len(token)
    increment = 1/float(numTokens)
    trace('increment ' + str(increment) + ' for ' + str(numTokens) + ' objects')
    for key in outfileDict :
        f = outfileDict[key]
        fout = open(f, 'a+')
        idx = token.find(key)
        outVal = 1
        if idx != -1:
            outVal = idx*increment

        if outVal == 1 :
            outVal ='1.0'
        elif outVal == 0 :
            outVal = '0.0'
        else :
            outVal = format(outVal, '0.2f')

        trace( 'Writing val ' + str(outVal) + ' for object ' + key )
        fout.write(outVal + pixelDelimiter)
        fout.close()

#Helper function to abstract logging and easily disable
def debug(msg) :
    if (log_level <= debug_level) :
        print( msg )

#Helper function to abstract logging and easily disable
def trace(msg) :
    if (log_level <= trace_level) :
        print( msg )

#Helper function to abstract logging and easily disable
def info(msg) :
    if (log_level <= info_level) :
        print( msg )

def error(msg) :
    if (log_level <= error_level) :
        print( msg )

#Main
if __name__ == '__main__':
    if len(sys.argv) != 2 :
        error('You must 1 arg, the path to the data directory to work with')
        sys.exit(2)

    directoryList = buildDirectoryList(str(sys.argv[1]))
    debug( 'directoryList size: ' + str(len(directoryList)) )

    #for each directory
    for d in sorted(directoryList) :
        info( 'Processing directory: ' + d )
        objectSet = buildObjectList(d)
        outfileDict = createOutputFiles(d, objectSet)
        line = parseCompositeFile(d)
        writeCompositeTokens(line, outfileDict)
