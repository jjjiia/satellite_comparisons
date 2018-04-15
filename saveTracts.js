//mapbox://styles/mapboxjia/cjfssqwz07fvr2rqe65mc3j54
//pk.eyJ1IjoibWFwYm94amlhIiwiYSI6ImNqZnNzcThyejNobWIyd3BvdXkzcWV6cXIifQ.4k07SppAzUEKPNGr1SMsFw

//mapbox://styles/mapboxjiajia/cjfsstsa07fy32so9xqqtkyf1
//pk.eyJ1IjoibWFwYm94amlhamlhIiwiYSI6ImNqZnNzc2RmZTAzMngzM252aXZlYXRwZmMifQ.xggtvwti75-ovCrmUkrjIg


var file = "lastbatch.csv"
console.log(file)

$(function() {
    queue()
        .defer(d3.csv,file)
        .defer(d3.csv,"finished.csv")
        .await(dataDidLoad);
})
var finishedIds = 0
//var index = 0
var finished = []
var centroidsData = null
function dataDidLoad(error,centroidsFile, finishedFile){
    centroidsData = makeDictionary(centroidsFile)
        
    
    for(var f in finishedFile){
        if(finished.indexOf(finishedFile[f])==-1){
            finished.push(finishedFile[f]["GID"])
        }
    }
    console.log(finished.length)
  //  mapboxgl.accessToken = 'pk.eyJ1IjoiemhhbmdqaWFtZWRpYSIsImEiOiJjamZzNWw0MHMwMzBvMnFta2sxa2ZvajdzIn0.vKnoHtP8TOUWqLRNpVB8JA';
    //mapboxgl.accessToken ="pk.eyJ1IjoiampqaWlhIiwiYSI6ImNpZzhkODFsaDA3ZGN1bm02dzhkb21rZzUifQ.qfTv3JzF2WJ6IQlACQkr1w"
   // mapboxgl.accessToken ="pk.eyJ1IjoibWxvdGVrIiwiYSI6ImNqZnM5OGYzZDJ3ajUzM3MycWwzNjFsMWwifQ.QT4tiIQnft-2f3wNyFRkhg"//eric

//USED UP//    mapboxgl.accessToken ="pk.eyJ1IjoibWFwYm94amlhamlhamlhIiwiYSI6ImNqZnNzd3AyZTJ1ZHMyeXBiMzFqdzBjcm0ifQ.u1maeM4jt9p2MdsZNx_ScA"
 //USED UP//mapboxgl.accessToken ="pk.eyJ1IjoibWFwYm94amlhamlhIiwiYSI6ImNqZnNzc2RmZTAzMngzM252aXZlYXRwZmMifQ.xggtvwti75-ovCrmUkrjIg"
mapboxgl.accessToken ="pk.eyJ1IjoibWFwYm94amlhIiwiYSI6ImNqZnNzcThyejNobWIyd3BvdXkzcWV6cXIifQ.4k07SppAzUEKPNGr1SMsFw"
//mapboxgl.accessToken ="pk.eyJ1IjoibWFwYm94amlhamlhamlhamlhIiwiYSI6ImNqZnZlZnEzMjBjYmMyd283YXBjZHlsa3oifQ.VwlUloNHMlngVyzLiG7ASQ"


   var map = new mapboxgl.Map({
        container: 'map',
        //style: 'mapbox://styles/zhangjiamedia/cjfs5m9sm6rra2sqcpo4opgvd',
        //style: 'mapbox://styles/jjjiia/cjfs67g2c6ssq2rqxrtm3m6q1',
       // style:'mapbox://styles/mlotek/cjfs9928g6vvj2snw7r0blfs1',//eric
     //USED UP//style:"mapbox://styles/mapboxjiajiajia/cjfssx73v7g2v2rk3obz4qjp1",
     //USED UP  // style:"mapbox://styles/mapboxjiajia/cjfsstsa07fy32so9xqqtkyf1",
        style:"mapbox://styles/mapboxjia/cjfssqwz07fvr2rqe65mc3j54",
      // style:"mapbox://styles/mapboxjiajiajiajia/cjfveg9389uqi2so5v2rwnqzt",
        center:[-86.7322123, 32.45602821889288],
        zoom: 16,
        preserveDrawingBuffer: true    
    });
    //console.log(centroidsData)
    map.on("load",function(){
      //  console.log(map.getStyle().layers)
        
        moveMap(map,1)
    })
  //  console.log(map.getZoom())
}  

function makeDictionary(data){
    var formatted = {}
    for(var i in data){
        var gid = data[i]["Gid"]
        formatted[gid] = data[i]
    }
    return formatted
}

function moveMap(map,index){
    //console.log("move")
  //  var gid = centroidsData[index]["Gid"]
  //  console.log(gid)
  //  var filter = ["!=","AFFGEOID",gid]
  //  map.setFilter("tracts", filter);
    
   // return
    if(index < 10000){//centroidsData.length-1){
        
        var center = [centroidsData[index].lng,centroidsData[index].lat]
        var gid = centroidsData[index]["Gid"]
        if(finished.indexOf(gid)==-1){
            console.log("NEW")
            map.flyTo({
                center:center,
                speed: 5 // make the flying slow
              });
                map.once('moveend',function(){
                 //   console.log("moveend")
                    setTimeout(function(){
                        makePrint(map,index)
                     }, 3000);
                });
            }else{
              //  console.log("finished")
                //console.log(gid)
                index+=1
                finishedIds+=1
                
                moveMap(map,index)                
            }
        }
      
}
function makePrint(map,index){
    
    //console.log(centroidsData[index])
        //console.log("makeprint")
        var gid = centroidsData[index]["Geo_GEOID"]
        var canvas = document.getElementsByClassName("mapboxgl-canvas")[0]
        var image = canvas.toDataURL("image/jpeg")
        window.location.href=image; 
 
        d3.select("#downloadLnk").attr("download",gid+".jpg").html("test")

        function download() {
          var dt = canvas.toDataURL('image/jpeg');
          this.href = dt;
        };
        
        downloadLnk.addEventListener('click', download, true);
        downloadLnk.click()
        index+=1
        moveMap(map,index)
}
