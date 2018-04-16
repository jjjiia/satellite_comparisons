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
var census = null
var censusDictionary = null
var states = null
var currentTopics = ["SE_T145_002","SE_T013_002","SE_T025_005","SE_T147_001"]
var initialFilteredIds = null
var highlightColor = "#63D965"
$(function() {
    queue()
        .defer(d3.csv,"census_filtered_population_100.csv")
        .defer(d3.json,"census_keys_short.json")
        .defer(d3.csv,"geo_names.csv")
        .defer(d3.csv,"allCentroids.csv")
        .defer(d3.json,"us_outline_simplified.geojson")
        .await(dataDidLoad);
})
var availableTopics = ["SE_T025_006","SE_T025_007","SE_T025_004","SE_T025_005","SE_T025_003","SE_T002_002","SE_T025_008","SE_T050_011","SE_T050_010","SE_T050_013","SE_T050_012","SE_T050_014","SE_T078_002","SE_T053_003","SE_T053_002","SE_T053_005","SE_T053_004","SE_T053_006","SE_T147_001","SE_T013_005","SE_T013_004","SE_T013_007","SE_T013_006","SE_T059_001","SE_T013_003","SE_T013_002","SE_T056_017","SE_T145_002","SE_T007_002","SE_T013_008","SE_T157_001","SE_T081_002","SE_T050_006","SE_T050_007","SE_T050_004","SE_T050_005","SE_T050_002","SE_T050_003","SE_T108_002","SE_T050_008","SE_T050_009","SE_T030_002","SE_T083_001","SE_T094_003","SE_T057_001","SE_T182_007","SE_T139_001","SE_T182_002","SE_T007_013","SE_T080_002","SE_T056_002"]
var projection =  d3.geo.albers()
			.center([-92,54])
			.translate([0, 0])
			.scale(300)

function dataDidLoad(error,censusfile,censusDictionaryFile,namesFile,centroidsFile,usGeojson){
    dataKeys = censusDictionaryFile
    census = censusfile
    names = makeDictionary(namesFile)
    centroids = makeDictionary(centroidsFile)
    censusDictionary = makeDictionary(census)
    states = usGeojson
  //  basemap()
    setupCharts()
    drawDetailUSMap()
   // console.log(initialFilteredIds)
    drawDetailUSDots(initialFilteredIds)
    var windowWidth = $("body").innerWidth()
    //console.log(windowWidth)
    d3.select("#smallMaps").style("width",parseInt(windowWidth-700)+"px")
    
    $( window ).resize(function(){
        windowWidth = $("body").innerWidth()
       // console.log(windowWidth)
        d3.select("#smallMaps").style("width",parseInt(windowWidth-700)+"px")
      //  console.log(parseInt(windowWidth-700))
    })
}

function makeDictionary(data){
    var formatted = {}
    for(var i in data){
        var gid = data[i]["Gid"]
        formatted[gid] = data[i]
    }
    return formatted
}
function replaceCurrentTopics(oldTopic,newTopic){
    var index = currentTopics.indexOf(oldTopic);
    if (index !== -1) {
        currentTopics[index] = newTopic;
    }
}

function addSelect(div,currentKey,ndx,t){
    var select = div.append("select").attr("class","dropdown").attr("id","dropdown"+t).attr("name","dropdown")
    var topics = availableTopics//Object.keys(dataKeys)
    for(var k in topics){
        if(topics[k]==currentKey){
            select.append("option").attr("class","option").attr("value",topics[k]).html(dataKeys[topics[k]]).attr("selected","selected")
        }else{
            select.append("option").attr("class","option").attr("value",topics[k]).html(dataKeys[topics[k]])
        }
    }
    document.getElementById("dropdown"+t).onchange=function(){
//        console.log(this.value)
        
        var newTopic = this.value
        replaceCurrentTopics(currentKey,newTopic)

        var tcolumn = ndx.dimension(function(d){
            //console.log(Math.round(parseFloat(d[newTopic])*100)/100)
          return Math.round(parseFloat(d[newTopic])*100)/100
        })
        var tgroup = tcolumn.group()
        
        charts["_"+t].group(tgroup)
            .dimension(tcolumn)  
        charts["_"+t].render()

    }
}
function setupCharts(){
    var ndx = dc.crossfilter(census)
    var all = ndx.groupAll()
    
    dc.dataCount("#count")
        .dimension(ndx)
        .group(all)
        .html({
            some:"%filter-count Selected Out of <strong>%total-count</strong> Tracts | <a href='javascript:dc.filterAll(); dc.renderAll();''>Reset All</a><br/>",
            all:"%total-count Tracts<br/>"
        })
        //SE_T145_002
        var topics=currentTopics

    for(var t in topics){
        var topic = topics[t]
        setupBar(topic,ndx,t)
        drawBar(topic,ndx,t)
    }
    dc.renderAll();
    
}
function setupBar(topic,ndx,t){
    var chartContainer = d3.select("#charts")
            .append("div")
            .attr("id","_"+t)
    var chartTitle = addSelect(chartContainer,topic,ndx,t)
    var chartFilter = chartContainer.append("div")
            .attr("class","reset")
            .html(" <br/>")
            .on("click",function(){
                charts["_"+t].filterAll()
                dc.redrawAll()
                d3.select("#reset_"+t).html(" <br/>")
            })
            .style("cursor","pointer")
            .attr("id","reset_"+t)
    var chartContent = chartContainer.append("div")
        .attr("id","chart_"+t).attr("class","chartContent")
            
}
function getIds(filteredData){
    var gids = []
    var centroidsIds = Object.keys(centroids)
    filteredData.forEach(function (d) {
        var gid = d["Gid"].replace("14000US","1400000US")
        if(gids.indexOf(gid)==-1 && centroidsIds.indexOf(gid)!=-1){
            gids.push(gid);
        }
    });
    return gids.sort()
}
function filtermap(filteredData){
    d3.selectAll(".outer").remove()
    d3.selectAll(".inner").remove()
    
    var filteredIds = getIds(filteredData)
    initialFilteredIds  = filteredIds
    d3.selectAll(".dot").remove()
    console.log("remove dots")
    drawDetailUSDots(filteredIds)
    
    
 //   map.setFilter("tracts", filter);
    d3.selectAll(".smallMaps").remove()
    d3.selectAll(".smallMapsCaption").remove()
    //.slice(0,100)
    for(var i in filteredIds.slice(0,100)){
       // console.log(gid)
        var gid = filteredIds[i]
        
        if(names[gid]!=undefined){
            d3.select("#likePlaces").append("div").attr("class","outer").attr("id","outer_"+gid)
                .style("width","100px")
                .style("height","100px")
                .style("display","inline-block")
                .style("border","1px solid black")
                .style("margin","0px")
                .style("padding","0px")
        
          //  loadSmallMap(gid)
            testMap(gid)
        }
    }
}
function testMap(gid){
   var outer = d3.select("#smallMaps")//+"_c_"+index%numberOfColumns)
        .append("div").attr("class","outer")//.attr("id","columns_"+mainDiv)
        .attr("id","inner_"+gid)
        .style("width","100px")
        .style("height","100px")
        .attr("class","smallMaps")
    
    var imageUrl = "resized/"+gid+".jpg"
    var image = new Image(); 
    image.src = imageUrl;
    image.onerror = function(){
        d3.select("#_"+gid).remove()
    }
    image.onload = function(){
            imageFound(gid)
    }  
     
}
function imageFound(gid){
    var outer = d3.select("#"+"inner_"+gid)
    
    outer.append("div")
        .attr("id","image_"+gid)
        .attr("class","smallMaps")
        .style("width","100px")
        .style("height","100px")
        .style("position","absolute")
       
    var elem = document.createElement("img") 
    document.getElementById("image_"+gid).appendChild(elem);
    elem.src = "resized/"+gid+".jpg";

    outer.append("div")
        .attr("id","text_"+gid)
        .attr("class","smallMapsCaption")
        .style("position","absolute")
        .html("<br/>"+names[gid]["Geo_NAME"].split(",").join("<br/>"))
        .style("height","80px")
        .style("width","80px")
        .style("padding","10px")
       .style("background-color","rgba(255,50,50,.2)")
       .style("opacity",0)
       .style("cursor","pointer")
        .on("click",function(){
            d3.selectAll(".smallMapsCaption").style("opacity",0)
            d3.select(this).style("opacity",1)
            var rolloverGid = d3.select(this).attr("id").split("_")[1]
            d3.selectAll(".dot").transition().duration(500).attr("fill",highlightColor).attr("r",3).attr("opacity",.5)
            d3.select(".dot_"+rolloverGid).transition().duration(500).attr("fill","red").attr("r",30).attr("opacity",.5)
            var gidData = censusDictionary[gid]
            var text = ""
            for(var a in availableTopics){
                var topicCode = availableTopics[a]
                var topicName = dataKeys[topicCode]
                var topicValue = gidData[topicCode]
                text+="<strong>"+topicName+"</strong>: "+topicValue+"<br/>"
            }
            
          //  console.log(names[gid]["Geo_NAME"]+" "+gid)
            d3.select("#mapDetail")
                .html(names[gid]["Geo_NAME"]
                +"<br/>"+gid
             +"<br/><br/>"+text
                
                )
            
        })
      //  .on("mouseout",function(){
      //      d3.select("#mapDetail").html("")
      //      var rolloverGid = d3.select(this).attr("id").split("_")[1]
      //      d3.select(".dot_"+rolloverGid ).attr("fill",highlightColor).attr("r",3).attr("opacity",.5)
      //  })
}
function smallMapDetails(gid){
    
}
function drawDetailUSDots(gids){
    var mapSvg = d3.select("#countryMap svg")
    mapSvg.selectAll("circle")
        .data(gids)
        .enter()
        .append("circle")
       // .attr("class","dots")
        .attr("cx",function(d){
            var centroidY = centroids[d].lat
            var centroidX = centroids[d].lng
           // var py = projection([centroidX,centroidY])[0]
            var px = projection([centroidX,centroidY])[0]
            return px
        })
        .attr("cy",function(d){
            var centroidY = centroids[d].lat
            var centroidX = centroids[d].lng
            var py = projection([centroidX,centroidY])[1]
            var px = projection([centroidX,centroidY])[0]
            return py
        })
        .attr("class",function(d){return "dot dot_"+d})
        .attr("r",3)
        .attr("fill",highlightColor)
        .attr("opacity",.5)   
}
function drawDetailUSMap(){
    
    var width = 400
    var height = 300
    var data = states
        
    var path = d3.geo.path()
        .projection(projection);
        
    var statesMap = d3.select("#countryMap")
    .append("svg").attr("width",width).attr("height",height)
        
    statesMap.selectAll("path")
        .data(states.features)
        .enter()
        .append("path")
        .attr('class',"states")
        .attr("stroke","#999")
        .attr("fill","#ffffff")
        .attr("d", path)     
}
function drawBar(topic,ndx,t){
    var initialFilters = {
        "SE_T145_002":[25,100],
        "SE_T013_002":[0,100],
        "SE_T025_005":[0,100],
        "SE_T147_001":[40,80]
    }
    var tcolumn = ndx.dimension(function(d){
      return parseFloat(d[topic])
    })
    var tgroup = tcolumn.group()
    var max = tcolumn.top(1)[0][topic]
    var min = tcolumn.bottom(1)[0][topic]    
    var width = $("#chart_"+t).innerWidth()
    charts["_"+t] =dc.barChart("#chart_"+t)
    
//    console.log([min,max])
    
    charts["_"+t].width(width)
            .height(100)
            .ordinalColors([highlightColor])
            .margins({top: 20, left: 40, right: 10, bottom: 20})
            .group(tgroup)
            .dimension(tcolumn)   
            .elasticY(true)       
            .elasticX(true)       
            .x(d3.scale.linear().domain([min, max]))
    
     charts["_"+t].xAxis().ticks(3)
     charts["_"+t].yAxis().ticks(3)
    var filterMin = initialFilters[topic][0]
    var filterMax = initialFilters[topic][1]
    charts["_"+t].filter(dc.filters.RangedFilter(filterMin,filterMax))
    filteredData=tcolumn.top(1000)
    filtermap(filteredData)
    
    d3.select(".extent").style("fill","red")
    charts["_"+t].on("filtered",function(){
        filteredData=tcolumn.top(1000)
        filtermap(filteredData)
       var selectionMax = tcolumn.top(1)[0][topic]
       var selectionMin = tcolumn.bottom(1)[0][topic]
        d3.select("#reset_"+t).html(selectionMin+" - "+selectionMax+" <u>click to reset</u>")
           //charts[key].filterAll()
    })
  
    
}
function getFeatureData(geoId){
    var data = censusDictionary[geoId]
    dc.filterAll();
    
    for(var t in currentTopics){
        var topic = currentTopics[t]
        var value = parseFloat(data[topic])
        charts["_"+t].filter(dc.filters.RangedFilter(value-3, value+3));        
    }
    dc.redrawAll();
}
