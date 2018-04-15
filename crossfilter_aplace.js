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
var currentTopics = ["SE_T145_002","SE_T013_002","SE_T025_005","SE_T147_001"]
$(function() {
    queue()
        .defer(d3.csv,"census_filtered_population_10.csv")
        .defer(d3.json,"census_keys_short.json")
        .defer(d3.csv,"geo_names.csv")
        .defer(d3.csv,"allCentroids.csv")
        .await(dataDidLoad);
})
  
function dataDidLoad(error,censusfile,censusDictionaryFile,namesFile,centroidsFile){
    dataKeys = censusDictionaryFile
    census = censusfile
    names = makeDictionary(namesFile)
    centroids = makeDictionary(centroidsFile)
    censusDictionary = makeDictionary(census)
    
  //  basemap()
    setupCharts()
    
    $("#likePlaces").resizable({
        handles: 'w'
    });
  //  $("left-panel").resizable()
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
    var topics = Object.keys(dataKeys)
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
          return parseFloat(d[ newTopic])
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
    filteredData.forEach(function (d) {
        var gid = d["Gid"].replace("14000US","1400000US")
        gids.push(gid);
    });
    return gids.sort()
}
function filtermap(filteredData){
    var filteredIds = getIds(filteredData)
    var filter =  ["in","AFFGEOID"].concat(filteredIds)
 //   map.setFilter("tracts", filter);
    d3.selectAll(".smallMaps").remove()
    //.slice(0,100)
    for(var i in filteredIds.slice(0,100)){
       // console.log(gid)
        var gid = filteredIds[i]
        
        if(names[gid]!=undefined){
            console.log(gid)
            d3.select("#likePlaces").append("div").attr("class","smallMaps").attr("id","_"+gid)
                .style("width","100px")
                .style("height","100px")
                .style("display","inline-block")
                //.style("bottom","1px solid black")
                .style("margin","0px")
                .style("padding","0px")
        
           
            
          //  d3.select("#_"+gid).append("div").attr("class","smallMapsCaption") 
          //      .style("width","150px")
          //      .style("height","150px")
          //      .attr("class","inner")
          //      .style("padding","5px")
          //      .attr("id","caption_"+gid)
                
               // .style("border","1px solid black")
                //.html(names[gid]["Geo_NAME"].split(", ").join("<br/>"))
                //.style("z-index",9)
                //.style("cursor","pointer")
           // .on("mouseover",function(){
           //     d3.select(this).style("background-color","rgba(255,20,20,.4)")
           // })
           // .on("mouseout",function(){
           //     d3.select(this).style("background-color","rgba(255,20,20,0)")
           // })
           // .on("click",function(){
           //     var gid = d3.select(this).attr("id").split("_")[1]
           //     getFeatureData(gid)
           // })
            loadSmallMap(gid)
        }
    }
    
}
function loadSmallMap(div){
   // console.log(div)
    d3.select("#_"+div).append("div").attr("id","smallmap_"+div) 
        .style("width","100px")
        .style("height","100px")
        .attr("class","inner")
        .style("z-index",1)
    
    
    d3.select("#smallmap_"+div).append("img").attr("src","resized/"+div+".jpg")
}
function drawSmallMap(div){
    var centroid = [centroids[div].lat,centroids[div].lng]
    L.mapbox.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
    var smallMap = L.mapbox.map("smallmap_"+div)
        .setView(centroid, 10);
    L.mapbox.styleLayer('mapbox://styles/jjjiia123/cjfcwpr9e7wzi2rmkp8al64h7').addTo(smallMap);

    smallMap.removeControl(smallMap.zoomControl);
    d3.selectAll(".leaflet-control-container").remove()
    
}
function drawBar(topic,ndx,t){
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
            .ordinalColors(["#63D965"])
            .margins({top: 20, left: 40, right: 10, bottom: 20})
            .group(tgroup)
            .dimension(tcolumn)   
            .elasticY(true)       
            .x(d3.scale.linear().domain([0, max]))
    
     charts["_"+t].xAxis().ticks(3)
     charts["_"+t].yAxis().ticks(3)
    
    charts["_"+t].on("filtered",function(){
        filteredData=tcolumn.top(1000)
        filtermap(filteredData)
       var max = tcolumn.top(1)[0][topic]
       var min = tcolumn.bottom(1)[0][topic]
        d3.select("#reset_"+t).html(min+" - "+max+" <u>click to reset</u>")
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
function basemap(){
    mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jjjiia123/cjfgqj2dscri62ro3h9ysrzi3',
        center: [-96, 37.8],
        zoom: 4,
        minZoom:4    
    });
    
    map.addControl(new mapboxgl.NavigationControl(),"top-right");
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }),"top-right");
    map.on("load",function(){
       
      //  var filter = ["in","AFFGEOID"].concat(gidsPopulation100)
      //  map.setFilter("tracts", filter);
      //  map.setFilter("tracts", ["==",  "AFFGEOID", ""]);
        map.on("click",function(e){
            var features = map.queryRenderedFeatures(e.point,"tracts");
            var geoId = features[0]["properties"]["AFFGEOID"]
          //  filterByMap(map)
            getFeatureData(geoId)
            d3.select("#placeName").html(names[geoId])
        })
    })
}  