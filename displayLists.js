//load census data
//crossfilter
//export filtered data ids
//load map
//click on map filter
//var topics = ["SE_T025_006","SE_T025_007","SE_T025_004","SE_T025_005","SE_T025_002"]
var charts = {}
var filteredData = null
var map = null
var centroids = null
var names = null
var dataKeys = null
var censusData = null
var censusDictionary = null
var censusColumn1 = null
var censusColumn2 = null
var states = null
var ascending1 = false
var ascending2 = false
var currentTopic1 = null
var currentTopic2 = null
var currentTopics = ["SE_T025_006","SE_T025_007","SE_T025_004","SE_T025_005","SE_T025_002","SE_T025_003",
"SE_T025_001","SE_T002_003","SE_T002_002","SE_T002_001","SE_T025_008","SE_T050_011","SE_T050_010",
"SE_T050_013","SE_T050_012","SE_T050_014","SE_T078_002","SE_T139_067","SE_T182_001","SE_T139_122",
"SE_T053_001","SE_T053_003","SE_T053_002","SE_T053_005","SE_T053_004","SE_T053_006","SE_T139_034",
"SE_T147_001","SE_T013_005","SE_T013_004","SE_T013_007","SE_T013_006","SE_T013_001","SE_T059_001",
"SE_T013_003","SE_T013_002","SE_T056_017","SE_T145_002","SE_T007_002","SE_T013_008","SE_T007_001",
"SE_T139_085","SE_T157_001","SE_T081_001","SE_T081_002","SE_T050_006","SE_T050_007","SE_T050_004",
"SE_T050_005","SE_T050_002","SE_T050_003","SE_T108_002","SE_T050_001","SE_T005_001","SE_T139_002",
"SE_T145_001","SE_T050_008","SE_T050_009","SE_T030_001","SE_T030_002","SE_T083_001","SE_T094_003",
"SE_T004_001","SE_T080_001","SE_T004_003","SE_T004_002","SE_T057_001","SE_T139_091","SE_T094_001",
"SE_T182_007","SE_T108_001","SE_T139_001","SE_T182_002","SE_T007_013","SE_T080_002","SE_T056_001","SE_T056_002","SE_T078_001"]

var imageLimit =500

var currentTopics = ["SE_T025_006","SE_T025_007","SE_T025_004","SE_T025_005","SE_T025_003","SE_T002_002","SE_T025_008","SE_T050_011","SE_T050_010","SE_T050_013","SE_T050_012","SE_T050_014","SE_T078_002","SE_T053_003","SE_T053_002","SE_T053_005","SE_T053_004","SE_T053_006","SE_T147_001","SE_T013_005","SE_T013_004","SE_T013_007","SE_T013_006","SE_T059_001","SE_T013_003","SE_T013_002","SE_T056_017","SE_T145_002","SE_T007_002","SE_T013_008","SE_T157_001","SE_T081_002","SE_T050_006","SE_T050_007","SE_T050_004","SE_T050_005","SE_T050_002","SE_T050_003","SE_T108_002","SE_T050_008","SE_T050_009","SE_T030_002","SE_T083_001","SE_T094_003","SE_T057_001","SE_T182_007","SE_T139_001","SE_T182_002","SE_T007_013","SE_T080_002","SE_T056_002"]


$(function() {
    queue()
        .defer(d3.csv,"census_filtered_population_100.csv")
        .defer(d3.json,"states.geojson")
        .defer(d3.json,"census_keys_short.json")
        .defer(d3.csv,"geo_names.csv")
        .defer(d3.csv,"allCentroids.csv")
        .defer(d3.csv,"finished.csv")
        .await(dataDidLoad);
})
  
function dataDidLoad(error,censusfile,statesGeojson,censusDictionaryFile,namesFile,centroidsFile){
    dataKeys = censusDictionaryFile
    censusData = censusfile
    names = makeDictionary(namesFile)
    centroids = makeDictionary(centroidsFile)
    censusDictionary = makeDictionary(censusData)
    states = statesGeojson
    
  
    
    
//    var tempGid = "1400000US02290000100"
  //  drawDetailUSMap(tempGid)
    
    var column1 = "SE_T013_004"//"SE_T157_001"//"SE_T057_001"
    sortedData1 = sortByValue(column1).slice(0,imageLimit)
    
    var column2 = "SE_T013_002"//"SE_T157_001"//"SE_T057_001"
    sortedData2 = sortByValue(column2).slice(0,imageLimit)
    var censusColumn1 = makeDictionary(sortedData1)
    var censusColumn2 = makeDictionary(sortedData2)
    //console.log(censusDictionaryFile[column])

    currentTopic1 = column1
    currentTopic2 = column2


    $(function() {
        $('.lazy').Lazy();
    });
          
    var columnName1 = dataKeys[column1]
    var columnName2 = dataKeys[column2]
    //console.log(sortedData)
    addSelect("#header1",column1,"left")
    addSelect("#header2",column2,"right")
    
     d3.select("#header1")
        .append("div")
        .attr("id","range1")
        .html(addRange(sortedData1))
    d3.select("#header2")
        .append("div")
        .attr("id","range2")
        .html(addRange(sortedData2))
    
     d3.select("#header1")
        .append("div")
        .attr("id","sortOrder1")
        .html(function(){
            if(ascending1==true){
                return "low to high &uarr;	click to reverse"
            }else{
                return "high to low &darr; click to reverse"
            }
        })
        .style("text-decoration","underline")
        .style("cursor","pointer")
        .on("click",function(){
            if(ascending1==true){
                d3.select(this).html("high to low &darr; click to reverse")
                ascending1 = false
            }else{
                d3.select(this).html("low to high &uarr;	click to reverse")
                ascending1 = true
            }
            d3.selectAll(".map1").remove()
            var newName = dataKeys[currentTopic1]
            var newSortedData = sortByValue(currentTopic1,"left").slice(0,imageLimit)
            console.log(newSortedData)
            var newColumnData = makeDictionary(newSortedData)
            d3.select("#range1").html(addRange(newSortedData))
            setUpThumbnails(newSortedData,newName,"map1",newColumnData)
        })
                
     d3.select("#header2")
        .append("div")
        .attr("id","sortOrder2")
        .html(function(){
            if(ascending2==true){
                return "low to high &uarr;	click to reverse"
            }else{
                return "high to low &darr; click to reverse"
            }
        })
        .style("text-decoration","underline")
        .style("cursor","pointer")
        .on("click",function(){
            if(ascending2==true){
                d3.select(this).html("high to low &darr; click to reverse")
                ascending2 = false
            }else{
                d3.select(this).html("low to high &uarr;	click to reverse")
                ascending2 = true
            }
            d3.selectAll(".map2").remove()
            var newName = dataKeys[currentTopic2]
            var newSortedData = sortByValue(currentTopic2,"right").slice(0,imageLimit)
            var newColumnData = makeDictionary(newSortedData)
            d3.select("#range2").html(addRange(newSortedData))
            setUpThumbnails(newSortedData,newName,"map2",newColumnData)
            
        })
    
    setUpThumbnails(sortedData1,columnName1,"map1",censusColumn1)
    setUpThumbnails(sortedData2,columnName2,"map2",censusColumn2)
    
}
function addRange(data){
    var max = Math.round(data[0].value*100)/100
    var min = Math.round(data[data.length-1].value*100)/100
    var range = min+" to " +max  
    return range
}
function makeColumnDictionary(data){
    var formatted = {}
    for(var i in data){
        var gid = data[i]["gid"]
        formatted[gid] = data[i]
    }
    return formatted
}
function setUpThumbnails(data,cName,mainDiv,columnData){
  // console.log(data)
    var width = $("#"+mainDiv).innerWidth()
    console.log(width)
    var numberOfColumns = Math.round(width/100)
     var loadedIndex = 0

    for(var i in data){
        var gid = data[i]["Gid"]
        testImage(gid,i,mainDiv,columnData,i,numberOfColumns)
    }
}
function makeDictionary(data){
    var formatted = {}
    for(var i in data){
        var gid = data[i]["Gid"]
        formatted[gid] = data[i]
    }
    return formatted
}
function sortByValue(column,lr){
    var formatted = []
    if(lr == "left"){
        var order = ascending1
    }else{
        var order = ascending2
    }
    for(var i in censusData){
        var entry = censusData[i]
        var gid = entry["Gid"]
        var value = parseFloat(entry[column])
        if(value!=0){
            formatted.push({Gid:gid,value:value})
        }
    }
    var sorted =formatted.sort(function(a, b){
        if(order == false){
            return parseFloat(b["value"])-parseFloat(a["value"])
        }else{
            return parseFloat(a["value"])-parseFloat(b["value"])
        }
    })
    return sorted;
}
function testImage(gid,index,mainDiv,columnData,loadedIndex,numberOfColumns) {
   var outer = d3.select("#"+mainDiv)//+"_c_"+index%numberOfColumns)
       .append("div").attr("class","outer "+mainDiv)//.attr("id","columns_"+mainDiv)
       .attr("id",mainDiv+"_"+gid)
      .style("width","100px")
      .style("height","100px")
    
    var imageUrl = "resized/"+gid+".jpg"
    var image = new Image(); 
    image.src = imageUrl;
    image.onerror = function(){
        d3.select("#"+mainDiv+"_"+gid).remove()
    }
    image.onload = function(){
       // console.log(image.width)
        if (image.width !=0) {
            imageFound(gid,loadedIndex,mainDiv,columnData,numberOfColumns)
            loadedIndex+=1
        }
    }    
}
function imageNotFound(gid){
    console.log("notfound")
    d3.select("#map").append("div").attr("id","_"+gid).attr("class","outer").attr("class","smallMaps")
        .style("width","100px")
        .style("height","100px")
    var elem = document.createElement("img");
   
     document.getElementById("_"+gid).appendChild(elem);
     elem.src = "placeholder.jpg";
}
function addSelect(div,currentKey,lr){
    var select = d3.select(div).append("select").attr("class","dropdown").attr("id","dropdown"+currentKey).attr("name","dropdown")
    var topics = Object.keys(dataKeys)
    for(var k in currentTopics){
        if(topics.indexOf(currentTopics[k])>-1){
            if(currentTopics[k]==currentKey){
                select.append("option").attr("class","option").attr("value",currentTopics[k]).html(dataKeys[currentTopics[k]])
                .attr("selected","selected")
            }else{
                select.append("option").attr("class","option").attr("value",currentTopics[k]).html(dataKeys[currentTopics[k]])
            }
        }
    }
    document.getElementById("dropdown"+currentKey).onchange=function(){        
        var newTopic = this.value        
        if(lr=="left"){
            currentTopic1 = newTopic
            d3.selectAll(".map1").remove()
            var newName = dataKeys[newTopic]
            var newSortedData = sortByValue(newTopic,lr).slice(0,imageLimit)
            var newColumnData = makeDictionary(newSortedData)
            d3.select("#range1").html(addRange(newSortedData))
            setUpThumbnails(newSortedData,newName,"map1",newColumnData)
        }else{
            currentTopic2 = newTopic
            d3.selectAll(".map2").remove()
            var newName = dataKeys[newTopic]
            var newSortedData = sortByValue(newTopic,lr).slice(0,imageLimit)
            var newColumnData = makeDictionary(newSortedData)
            d3.select("#range2").html(addRange(newSortedData))
            setUpThumbnails(newSortedData,newName,"map2",newColumnData)
        }
    }
}
var toolTipDiv = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0)
    .style("background-color","rgba(255,255,255,.9)")
    .style("padding","5px")
    .style("border-radius","5px")
     .style("z-index",999999)

function imageFound(gid,index,mainDiv,columnData,numberOfColumns) {
   // alert('That image is found and loaded');
   var column = index%numberOfColumns
   var row = Math.floor(index/numberOfColumns)
  // console.log(index+" "+column+" "+row+" "+columnData[gid].value)
  
    var outer = d3.select("#"+mainDiv+"_"+gid)
    outer.append("div")
        .attr("class","smallMapsCaption")
        .style("position","absolute")
        .html("<br/><br/>"+columnData[gid].value)
        .style("height","100px")
        .style("width","100px")
   
        .style("z-index",99999)
       .style("background-color","rgba(255,255,255,.2)")
       .style("opacity",0)
       .style("cursor","pointer")
       .on("mouseover",function(){
           d3.select(this).style("opacity",1)
           toolTipDiv.transition()		
               .duration(200)		
               .style("opacity", .9);
           toolTipDiv.html(names[gid]["Geo_NAME"].split(",").join("<br/>"))	
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY) + "px");	
       })
       .style("line-height","100%")
       .on("mouseout",function(){
           d3.select(this).style("opacity",0)
           toolTipDiv.transition()		
               .duration(1000)		
               .style("opacity", 0);
       })
       .on("click",function(){
           d3.select(this).style("opacity",1)
           loadDetailMap(gid)
           d3.select("#tractName").html(names[gid]["Geo_NAME"].split(",").join("<br/>"))
           drawCharts(gid)
           drawDetailUSMap(gid)
       })
    //d3.select("#"+mainDiv+"_c_"+index%5)
    outer.append("div")
        .attr("id",mainDiv+"_"+gid).attr("class","smallMaps")
        .style("width","100px")
        .style("height","100px")
        .attr("class","lazy _"+gid)
        .style("position","absolute")
        .on("mouseover",function(){
          // console.log(columnData[gid])
        })
       
    var elem = document.createElement("img") 
    document.getElementById(mainDiv+"_"+gid).appendChild(elem);
    elem.src = "resized/"+gid+".jpg";

    d3.select("#"+mainDiv+"_"+gid+" img ")
        .style("z-index",-1)
        .on("mouseover",function(){
          //  console.log(columnData[gid])
        })
}
function drawCharts(gid){
    d3.selectAll("#chart svg").remove()
    //d3.select("#chart").append("svg").attr("")
    var text ="population"+" "+censusDictionary[gid]["SE_T002_001"]+"<br/>"
    console.log(text+" "+gid)
    for(var i in dataKeys){
        var columnName = dataKeys[i]
        var value = censusDictionary[gid][i]
        if(value!=undefined && value!=0){
            text=text+columnName +" "+value+"<br/>"
        }
    }
    d3.select("#chart").html(text).style("line-height","120%").style("padding","10px")
}
function drawDetailUSMap(gid){
    d3.selectAll("#countryMap svg").remove()
    var width = 300
    var height = 220
    var data = states
    var projection =  d3.geo.albers()
			.center([-92,55])
			.translate([0, 0])
			.scale(220)
         //   .translate([width / 2, height / 2]);
        
    var path = d3.geo.path()
        .projection(projection);
        
    var statesMap = d3.select("#countryMap")
                    .append("svg").attr("width",300).attr("height",220)
        
        var lat = parseFloat(centroids[gid].lat)
        var lng = parseFloat(centroids[gid].lng)
		var projectedX = projection([lng, lat])[0];
		var projectedY = projection([lng, lat])[1];
    statesMap.selectAll("path")
        .data(states.features)
        .enter()
        .append("path")
        .attr('class',"states")
        .attr("stroke","#555555")
        .attr("fill","#ffffff")
        .attr("d", path)
    statesMap.append("circle").attr("cx",projectedX).attr("cy",projectedY).attr("r",5).attr("fill","red").attr("opacity",.7)        
}
function loadDetailMap(gid){
    var centroid = [centroids[gid].lng,centroids[gid].lat]
    mapboxgl.accessToken ="pk.eyJ1IjoibWFwYm94amlhamlhamlhamlhIiwiYSI6ImNqZnZlZnEzMjBjYmMyd283YXBjZHlsa3oifQ.VwlUloNHMlngVyzLiG7ASQ"
    var map = new mapboxgl.Map({
         container: 'tractMap',
         style:"mapbox://styles/mapboxjiajiajiajia/cjfveg9389uqi2so5v2rwnqzt",
         center:centroid,
         zoom: 16,
         preserveDrawingBuffer: true    
     });
     map.on("load",function(){
         d3.select(".mapboxgl-ctrl-bottom-right").remove()
         d3.select(".mapboxgl-ctrl-bottom-left").remove()
         
         map.flyTo({
             speed:.1,
             zoom: 14 
           });
     })
    
}


function loadSmallMap(div){
    console.log(div)
    
    d3.select("#map").append("div").attr("id","_"+div).attr("class","outer")
        .style("width","100px")
        .style("height","100px")

    document.getElementById("_"+div).appendChild(elem);
    elem.src = "resized/"+div+".jpg";


   // d3.select("#_"+div).append("div").attr("id","smallmap_"+div).attr("class","smallMaps")
   //     .style("width","100px")
   //     .style("height","100px")
   //     .attr("class","inner")
   // d3.select("#smallmap_"+div).append("img").attr("src","resized/"+div+".jpg")
}
