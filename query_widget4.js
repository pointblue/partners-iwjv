		
    function query_map(evt) {
         var output = document.getElementById(this.key + "Output");
         var lonlat = map.getLonLatFromPixel(evt.xy).transform(projSrc, projDisplay);
         alert("You clicked near " + lonlat.lat + " lat, " + lonlat.lon + " lon");
 
    }  


// define the  handler functions for the point done drawing
     function PointDoneHandler(point) 
     {
               var my_point = point.transform(projSrc, projDisplay); 
               alert(my_point.toString());
               var geom = my_point.transform(projSrc, projDisplay);
                     var layer = "jan10_dem5_flddeep"; 
                     var schema = "ocof";
                     var type = "polygon";
                     var proj = "26910";
        
                 geom = encodeURIComponent(geom.toString()); 
                 var query_url = "http://localhost/OpenMap_dev/click_query2.php?geom="+geom+"&type="+type+"&table="+layer+"&proj="+proj;                 
             			   
               //pointControl.deactivate();
              // navControl.activate(); 			   
      };


          function PolygonDoneHandler(geom) {
                     var my_geom = geom.transform(projSrc, projDisplay);
                     var layer = "jan10_dem5_flddeep"; 
                     var schema = "ocof";
                     var type = "polygon";
                     var proj = "26910";
        
                 my_geom = encodeURIComponent(my_geom.toString()); 
                 var query_url = "http://localhost/OpenMap_dev/click_query2.php?geom="+my_geom+"&type="+type+"&table="+layer+"&proj="+proj;                 
             
                alert("GeneralPolygonDoneHandler:  " + my_geom+"  url is  "+ query_url+"  and the layer is: ");
   
  // here we stuff responce into window  
 
               $.get(query_url,  function(data) 
                                {               
                                     top.consoleRef=window.open('','myconsole',
                                    'width=900,height=500'
                                    +',menubar=0'
                                    +',toolbar=1'
                                    +',status=0'
                                    +',scrollbars=1'
                                    +',resizable=1')
                                    top.consoleRef.document.writeln(
                                    '<html><head><title>Console</title></head>'
                                    +'<body bgcolor=white onLoad="self.focus()">'
                                    +data
                                    +'<a href="" onclick="Javascript: window.print()">Print this page</a></body></html>')
                                    top.consoleRef.document.close()
                                } 
                    );    
        }
        
   
   //-------------------------------------------------------------------------------
   // now variables
             
        var style_black = new OpenLayers.StyleMap(
        {
            strokeColor: "#000000",
            strokeOpacity: 0.7,
            strokeWidth: 2,
            pointerEvents: "visiblePainted",
	    fillOpacity: 0.0
        });
                       
        var pointLayer = new OpenLayers.Layer.Vector("Point Layer", {
		    styleMap: style_black,
		    displayInLayerSwitcher: false
		});               

              // define the drawFeatureOptions functions to handle the vector drawing
        var pointDrawFeatureOptions = 
            {
                'displayClass': 'olControlDrawFeaturePoint',
                callbacks : {"done": PointDoneHandler}
            };


        drawControls = {
            point: new OpenLayers.Control.DrawFeature(pointLayer,
            OpenLayers.Handler.Point,pointDrawFeatureOptions )
        };
                              