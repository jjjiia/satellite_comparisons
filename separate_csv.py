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



def newFiltes():
    
    with open("census_percent_2places_selected.csv","Ur")as infile:
    
        csvReader = csv.reader(infile)  
        for row in csvReader:
            longHeaders = row
            print row
            break

        for h in longHeaders:
            header = h
            hIndex = longHeaders.index(h)
            
            with open("separateColumns/"+h+".csv","a")as outfile:
                
                csvWriter = csv.writer(outfile)
                #csvWriter.writerow([longHeaders[0],longHeaders[hIndex]])
                
                infile.seek(0)
                for row in csvReader:
                    csvWriter.writerow([row[0],row[hIndex]])
                    #print row[0],row[hIndex]
                    #print row[0],row[hIndex]
               
    
newFiltes()