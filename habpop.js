
var pixel_geom = [];
                

function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}

function todays_date()
{ 
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();
  if(dd<10){dd='0'+dd} if(mm<10){mm='0'+mm} var today = mm+'/'+dd+'/'+yyyy;
  return (today)
}

   //  First function to handle pt click                
         
 function new_post_to_url(path,params,method,target)
 {
    method = method || "post"; // Set method to post by default, if not specified.
    target = target || "_self";   // set to "_self" by default if not specified - was "_blank"
    $.blockUI({ message: '<img src="/apps/common/deju/icons/busy.gif" /> Generating your report...',
	            css: { border: 'none', padding: '30px'}});
	
    $.ajax({type: method, url: path, data: params})    //dataType: dataType, 
        .done(function() {
			$.unblockUI();
		})
        .fail(function(jqXHR, textStatus, errorThrown) { 
			$.unblockUI();
			alert("We encountered an error with your polygon. Please try again."); 
		});
        
 }
 // Need this function to pass paramters to report generating OCOF API since scraped map tiles for the image will be too large for a get
 function post_to_url(path, params, method, target) {
    method = method || "post"; // Set method to post by default, if not specified.
    target = target || "_self";   // set to "_self" by default if not specified - was "_blank"

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    form.setAttribute("target", target);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
         }
    }

    document.body.appendChild(form);
    form.submit();
}
  
  //  First function to handle pt click                         
     function query_map(evt) {
             var output = document.getElementById(this.key + "Output");
             var lonlat = map.getLonLatFromPixel(evt.xy).transform(projSrc, projDisplay);
             alert("You clicked near " + lonlat.lat + " lat, " + lonlat.lon + " lon");
     }  

// define the  handler functions for the point done drawing
    // function PointDoneHandler(pt_geom) 
    // define the  handler functions for the point done drawing
      function PointDoneHandler(point)
     {         
            var coord = point.transform(projSrc, projDisplay);
            alert("The Latitude/Longitude at this point is:  " + roundNumber(coord.y,1) + " / " + roundNumber(coord.x,1) );       
      };

    function LineDoneHandler(geom) {
 // need to discover what layers are active and queriable
//  then use rest api  to discover what analyses can be performed on that layer                 
             layername = ActiveLayer;
             if(layername=="") 
             {
                layername = "2 m Digital Elevation Model";
                alert("please choice an active layer using the radio buttons");
                return
             }  
   
     if(category == "") {category = 'ocof';}
     layername = encodeURIComponent(layername); 
//  get layername from layer picker radio button and pass to LineDoneHandler
      var gridsurl = 'http://data.prbo.org/api/v1/grids/'+category+'.'+layername+'/?type=json&method=get&callback=?';
      
    //  var query_url = "http://localhost/prototype/ocof_report_html2pdf.php";
    //  window.open(query_url, '_blank' );     

}  

 
//     generic function for handling user-drawn polygon feature added - 
//     capture the pixel coordinates of user-drawn geometry to pass along for map image in report
function PolygonFeatureAdded(feature) 
{     
     pixel_geom = [];
     if (polygonControl.layer.features.length > 0)
     {
         for(var vert in polygonControl.layer.features[0].geometry.getVertices())
         {
             var pxl = map.getPixelFromLonLat(
                 new OpenLayers.LonLat(
                     polygonControl.layer.features[0].geometry.getVertices()[vert].x,
                     polygonControl.layer.features[0].geometry.getVertices()[vert].y));
                     pixel_geom[vert] = {x:pxl.x, y:pxl.y};
         }
     }

    var geom = feature.geometry;
    PolygonDoneHandler(geom, 'drawn');
}
   
//     generic function for handling user-drawn polygon geometries - pass along information for report generation
function PolygonDoneHandler(geom, method)
{      
    
   		
    if (geom.getArea() > 2500000.0)
    {
        alert("The area you have drawn is larger than our server can process.  Please try making your polygon about 200 acres or less.");
            return;
    }  
 
    if(category == "") {category = 'ocof';}       
   // var gridsurl = 'http://localhost/api/v1/grids/'+category+'.'+layername+'/?type=json&method=get&callback=?';
    var gridsurl = 'http://data.prbo.org/api/v1/grids/'+category+'.'+layername+'/?type=json&method=get&callback=?';

    $.getJSON(gridsurl, function(data) 
    {

        if (data.statuscode != "200")
        {
            alert("ERROR getting grids (" + data.statuscode + "): " + data.message);           
        }
        else
        {  
            var my_geom = geom.transform(projSrc, projDisplay);
            my_geom = encodeURIComponent(my_geom.toString());
            var randomnumber=Math.floor(Math.random()*100000001);
            var prefix = "tmp"+randomnumber;
            var  s = encodeURIComponent(data.grids[0].spatialdatasetname);
            var  projection = data.grids[0].projection;
            var  database = data.grids[0].db; 
            var  schema = data.grids[0].scheme; 
            var  table =  data.grids[0].dbtable; 
            var  reporttype =  data.grids[0].gridvariable; 
            var  tif   =  encodeURIComponent(data.grids[0].multibandtiffuri);  
			tif = 'F:\\tif\\ocof\\flddeep_50cm.multiband.4326.tif';
            //to pass parameter of DEM tif location and name to create elevation report for OCOF           
            // get dem on server-side
            var demLayer = encodeURIComponent("2 m Digital Elevation Model");
            //  gridset EPSG:26190   not strings so can't decode
            var myArr = projection.split(":");
            var proj=myArr[1];                
            // notice("Your report is being generated. <br/>Please be patient.");   
            polygonControl.deactivate();
            navControl.activate();
            pixels = OpenLayersTileStitchPrinter.json_encode(pixel_geom);
            pixel_geom = [];
            OpenLayersTileStitchPrinter.process(map);
            tile = OpenLayersTileStitchPrinter.tiles;
            tile_url = encodeURIComponent(tile);  
           alert("the geom is:  "+my_geom);
            var query_url = "http://data.calcommons.org/OCOFMapReport.php";      //"OCOFMapReport.php"; 
 //           var query_url = "http://localhost/prototype/OCOFMapReport.php";   
            // not using  vtype, db, table, schema anymore now that we use polygon and tmp tables in public tests2 
            //pass parameters to API for generating report AND parameters for making the call to create the tmp postgis tables that need to be queried to generate the report
            var postdata = {};
            postdata.geom = my_geom;
            postdata.proj = proj;
            postdata.prefix = prefix;
            postdata.tiles = tile;
            postdata.width = OpenLayersTileStitchPrinter.width;
            postdata.height = OpenLayersTileStitchPrinter.height;
            postdata.method = 'GET';  //'GET'  for REST API
            postdata.pixels = pixels; 
            postdata.application = category;
            postdata.tif = tif; 
            postdata.reporttype = reporttype; 
            post_to_url(query_url, postdata, 'POST');               // remove , '_blank'  '_self'
        } 
    });

    if (method == 'drawn')
    {
        polygonControl.deactivate();
        polygonLayer.removeAllFeatures();  // must delete polygon
        navControl.activate(); 
    }
}
  

 
   //-------------------------------------------------------------------------------
   // now variables              

                var style_white = new OpenLayers.StyleMap(
                {
                    pointRadius: 4,
                    strokeColor: "#FFFFFF",
                    strokeOpacity: 0.9,
                    strokeWidth: 4,
                    pointerEvents: "visiblePainted",
                    fillOpacity: 0.1
                });   
                
                var style_green = new OpenLayers.StyleMap(
                {
                    strokeColor: "#59B4B3",
                    strokeOpacity: 0.9,
                    strokeWidth: 4,
                    pointerEvents: "visiblePainted",
                    fillOpacity: 0.1
                }); 
                
              var pointLayer = new OpenLayers.Layer.Vector("Point Layer", {
		    styleMap: style_white,
		    displayInLayerSwitcher: false
		});               
                var lineLayer = new OpenLayers.Layer.Vector("Line Layer",{
		    styleMap: style_white,
		    displayInLayerSwitcher: false
		});        
                var polygonLayer = new OpenLayers.Layer.Vector("Polygon Layer", {
		    styleMap: style_white,
		    displayInLayerSwitcher: false
		});
                var boxLayer = new OpenLayers.Layer.Vector("Box layer", {
		    styleMap: style_white,
		    displayInLayerSwitcher: false
		});
 
              // define the drawFeatureOptions  to handle the vector drawing
                var pointDrawFeatureOptions = 
                {
                    'displayClass': 'olControlDrawFeaturePoint',
                    title: "Click on a point to get the lat/long at that point",
                    callbacks : {"done": PointDoneHandler}
                };
               var lineDrawFeatureOptions = 
               {
                        'displayClass': 'olControlDrawFeaturePath',
                        handlerOptions: {persist:true},   // so vector will persist after done event fires
                        title: "Create a report for your vector of interest\nDefine your vector by clicking on points, \n finish by double clicking",
                        callbacks : {"done": LineDoneHandler}
               };
             
               var polygonDrawFeatureOptions = 
               {       
                       'displayClass': 'olControlDrawFeaturePolygon',
                       handlerOptions: {persist:true},  // so vector will persist after done event fires
                       title: "Create a report for an area of interest \nDefine your area by clicking on points,\nfinish by double clicking",
                       callbacks:  [{"featureAdded": PolygonFeatureAdded}, {"done": PolygonDoneHandler } ]                              
               };   



                var navOptions = 
                {
                    saveState: true,
                    defaultControl : navControl
                };
                
                function noteAdded(f) {
                  alert(f.geometry.getBounds());
                }

              
    
            var pointControl =  new OpenLayers.Control.DrawFeature(pointLayer,
                        OpenLayers.Handler.Point, pointDrawFeatureOptions);
            var lineControl = new OpenLayers.Control.DrawFeature(lineLayer,
                        OpenLayers.Handler.Path,  lineDrawFeatureOptions);
            var polygonControl = new OpenLayers.Control.DrawFeature(polygonLayer,
                        OpenLayers.Handler.Polygon, polygonDrawFeatureOptions);
                        
            polygonControl.featureAdded = PolygonFeatureAdded;  
                
            var navControl =   new OpenLayers.Control.Navigation(navOptions);      // navOptions
                         
           drawControls = {                
		    point: pointControl,
                    line: lineControl,            //  , pathDrawFeatureOptions  specify the custom "pathDrawFeatureOptions"                      
                    polygon: polygonControl                        
                    
                };  