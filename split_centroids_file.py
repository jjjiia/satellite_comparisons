from functools import partial
import random
import pprint
import pylab
import csv
import math
import json
from math import radians, cos, sin, asin, sqrt
from shapely.geometry import *
from shapely.ops import cascaded_union
from operator import itemgetter
import time



def newCentroids():
    
    for i in range(2):
        print i
        with open("new_centroids_"+ str(i)+".csv","w")as outfile:
            csvWriter = csv.writer(outfile)
            csvWriter.writerow(["Geo_GEOID","lng","lat","area"])
    
    
    with open("unfinished.csv","Ur")as infile:
        csvReader = csv.reader(infile) 
        r=0
        for row in csvReader:
            r+=1
            #print r%12
            
            with open("new_centroids_"+ str(r%2)+".csv","a")as outfile:
                csvWriter = csv.writer(outfile)
                csvWriter.writerow(row)
    
#newCentroids()



def findUnfinished():

    finishedIds = []    
    with open("finished.csv","Ur")as infile2:
        csvReader2 = csv.reader(infile2) 
        for row2 in csvReader2:
            gid2 = row2[0]
            if gid2 not in finishedIds:
                finishedIds.append(gid2)
    print "finished", len(finishedIds)

    allIds = []
    unfinished = []
    with open("allCentroids.csv","Ur")as infile:
        csvReader = csv.reader(infile) 
        for row in csvReader:
            gid = row[0]
            allIds.append(gid)
            if gid not in finishedIds:
                unfinished.append(gid)
                with open("unfinished.csv","a")as outfile:
                    csvWriter = csv.writer(outfile)
                    csvWriter.writerow(row)
                
        print len(unfinished)

findUnfinished()