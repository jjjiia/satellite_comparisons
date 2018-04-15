//load census data
//crossfilter
//export filtered data ids
//load map
//click on map filter
//var topics = ["SE_T025_006","SE_T025_007","SE_T025_004","SE_T025_005","SE_T025_002"]
var topics=["SE_T002_002","SE_T030_002","SE_T083_001","SE_T147_001"]

var charts = {}
var filteredData = null
var map = null
var centroids = null
var geoNames = null
  var dataKeys = null

queue()
    .defer(d3.csv,"initial_dataColumns.csv")
    .defer(d3.json,"census_keys_short.json")
    .defer(d3.csv,"geo_names.csv")
    .defer(d3.csv,"centroids.csv")
    .await(dataDidLoad);
    
function dataDidLoad(error,census,censusDictionary,namesFile,centroidsFile){

      dataKeys=censusDictionary
      centroids = makeCentroidsDict(centroidsFile)
      geoNames = makeNamesDict(namesFile)

    var ndx = crossfilter(census);
      var all = ndx.groupAll();      
      
      dc.dataCount("#count")
          .dimension(ndx)
          .group(all)
          .html({
              some:"%filter-count Selected Out of <strong>%total-count</strong> Tracts | <a href='javascript:dc.filterAll(); dc.renderAll();''>Reset All</a>",
              all:"%total-count Tracts"
          })
      
      for(var k in topics){
          console.log("chart "+k)
        var key = topics[k]
        setupBarChart(ndx,key,"_"+k)
      }
//      dc.renderAll();
      
      //basemap(filteredData)
      
}
function makeDictionary(csvFile){
    var formatted = {}
    var valueKey = Object.keys(csvFile[0])[1]
    for(var i in csvFile){
        var gid = csvFile[i]["Gid"]
        var value = csvFile[i][valueKey]
        formatted[gid] = {}
        formatted[gid][valueKey] = value
    }
    return formatted
}
function joinFiles(census,census2,census3,census4,census5){
    
    var f1 = makeDictionary(census)
    var f2 = makeDictionary(census2)
    var f3 = makeDictionary(census3)
    var f4 = makeDictionary(census4)
    var f5= makeDictionary(census5)
    var formatted = $.extend(true,{},f1,f2,f3,f4,f5)    
    var gids = Object.keys(formatted)
    
    var array = []
    for(var g in gids){
        formatted[gids[g]]["Gid"]=gids[g]
        array.push(formatted[gids[g]])
    }    
    return array
}
function basemap(filteredData){
    //mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
   // map = new mapboxgl.Map({
   //     container: 'map',
   //     style: 'mapbox://styles/jjjiia123/cjfgqj2dscri62ro3h9ysrzi3',
   //     center: [-96, 37.8],
   //     zoom: 4
   // });
   // 
   var centroid =[-96, 37.8]
    L.mapbox.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
    var map = L.mapbox.map("map")
        .setView(centroid, 4);
    L.mapbox.styleLayer('mapbox://styles/jjjiia123/cjfgqj2dscri62ro3h9ysrzi3').addTo(map);
        
    map.on("load",function(){
        d3.select(".mapboxgl-ctrl-bottom-left").remove()
        d3.select(".mapboxgl-ctrl-bottom-right").remove()
        map.setFilter("tracts", ["==",  "AFFGEOID", ""]);
        map.on("click",function(){
          //  filterByMap(map)
        })
    })
    console.log("map")
}  
function filtermap(filteredData){
    var filteredIds = getIds(filteredData)
    var filter =  ["in","AFFGEOID"].concat(filteredIds)
    map.setFilter("tracts", filter);
    d3.selectAll(".smallMap").remove()
    for(var i in filteredIds.slice(0,20)){
        var gid = filteredIds.slice(0,20)[i]
        drawSmallMap(gid)
    }
    
}
function  getIds(filteredData){
    var gids = []
    filteredData.forEach(function (d) {
        var gid = d["Gid"].replace("14000US","1400000US")
        gids.push(gid);
    });
    return gids
}
function makeCentroidsDict(centroids){
    var formatted = {}
    for(var g in centroids){
        var geoId = centroids[g]["Geo_GEOID"]
        var lng = centroids[g]["lng"]
        var lat = centroids[g]["lat"]
        formatted[geoId]={"lat":lat,"lng":lng}
    }
    return formatted
}
function makeNamesDict(centroids){
    var formatted = {}
    for(var g in centroids){
        var geoId = centroids[g]["Geo_GEOID"]
        formatted[geoId]=centroids[g]
    }
    return formatted
}
function drawSmallMap(gid){
    if(centroids[gid]!=undefined){
        
        var geoName = geoNames[gid.replace("1400000US","14000US")]["Geo_NAME"]
        var smallMap = d3.select("#likePlaces").append("div").attr("id","map_"+gid).attr("class","smallMap")
        d3.select("#likePlaces").append("div").attr("id","label_"+gid).html(geoName).attr("class","smallMap")
        
        var centroid = [centroids[gid].lat,centroids[gid].lng]
        L.mapbox.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
        var map = L.mapbox.map("map_"+gid)
            .setView(centroid, 13);
        L.mapbox.styleLayer('mapbox://styles/jjjiia123/cjfcwpr9e7wzi2rmkp8al64h7').addTo(map);

        map.removeControl(map.zoomControl);
        d3.selectAll(".leaflet-control-attribution").remove()
    }
    
    
}
function drawBarChart(ndx,key,div){
    var chartDiv = d3.select("#"+div)
    chartDiv.append("div")
        .attr("class","reset")
        .html("<br/>")
        .on("click",function(){
            charts[key].filterAll()
            dc.redrawAll()
        })
        .style("cursor","pointer")
        .attr("id","reset"+div)
        
    chartDiv.append("div")
        .attr("id","chart"+div)
    
    charts[key] =dc.barChart("#chart"+div, div+"_group")

    //  var all = ndx.groupAll();
    var column = ndx.dimension(function(d){
      return parseFloat(d[key])
    })
    var cgroup = column.group();
    var max = column.top(1)[0][key]
    var min = column.bottom(1)[0][key]

    var width = $("#charts").innerWidth()-20

    charts[key].width(width)
            .height(100)
            .ordinalColors(["#63D965"])
            .margins({top: 20, left: 40, right: 10, bottom: 20})
            .group(cgroup)
            .dimension(column)   
            .round(dc.round.floor)    
            .elasticY(true)       
            .x(d3.scale.linear().domain([0, max]))
     charts[key].xAxis().ticks(3)
     charts[key].yAxis().ticks(3)
     charts[key].on("filtered",function(){
        // filteredData=column.top(Infinity)
       //  filtermap(filteredData)
        var max = column.top(1)[0][key]
        var min = column.bottom(1)[0][key]
         d3.select("#"+div+" .reset").html(min+" - "+max+" <u>click to reset</u>")
            //charts[key].filterAll()
     })
 //    charts[key].render()
     dc.renderAll(div+"_group");
     
}
function setupBarChart(ndx,key,div){    
    var chartDiv = d3.select("#charts").append("div").attr("class","dc-chart ").attr("id",div)
  // chartDiv.append("div").html(dataKeys[key]+"<br/>")
    var select = chartDiv.append("select").attr("class","dropdown").attr("id","dropdown"+div).attr("name","dropdown")
    for(var k in topics){
        if(topics[k]==key){
            select.append("option").attr("class","option").attr("value",topics[k]).html(dataKeys[topics[k]]).attr("selected","selected")
        }else{
            select.append("option").attr("class","option").attr("value",topics[k]).html(dataKeys[topics[k]])
        }
    }
    
    document.getElementById("dropdown"+div).onchange=function(){
//        console.log(this.value)
        var column = this.value
        d3.select("#chart"+div).remove()
        d3.select("#reset"+div).remove()
        drawBarChart(ndx,column,div)
    }
    drawBarChart(ndx,key,div)
}