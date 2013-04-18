<!DOCTYPE html>
<html>
    <head>
        <title>GeoExt Development</title>
<!--  all of these links and scripts can go in the core  -->		
<script type="text/javascript" src="/ext-3.4.0/adapter/ext/ext-base.js"></script>
<script type="text/javascript" src="/ext-3.4.0/ext-all.js"></script>
     
<script src="http://maps.google.com/maps?file=api&amp;v=3&amp;key=AIzaSyDs6QcNHclTKt5HZNacqC6Cfn2f7JGIXjo" type="text/javascript"></script>
<script src="OpenLayers-2.11/OpenLayers.js"></script>
<script src="/GeoExt/lib/GeoExt.js" type="text/javascript"></script>
<script type="text/javascript" src="proj4js-compressed.js"></script>
      <!-- <script type="text/javascript" src="OpenLayers-2.11/lib/jquery-1.2.1.js"></script>-->
        <script type="text/javascript" src="query_widget4.js"></script>
<!--<script type="text/javascript" src="map_core.js" ></script>-->
<link rel="stylesheet" type="text/css" href="core_map.css"/>


<script type="text/javascript">
          
function get_my_url (bounds) {
	var res = this.map.getResolution();
	var x = Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
	var y = Math.round ((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
	var z = this.map.getZoom();
	var url = this.url;
	if (url instanceof Array) {
		url = this.selectUrl(path, url);
	}
	var path;
	if(this.type == 'esri') path = url+z+"/"+y+"/"+x;
	else path = url + z + "/" + x + "/" + y + "." + this.type;

	return path;
}   


        var projSrc = new OpenLayers.Projection("EPSG:900913");   // openlayers preferred
        var projData = new OpenLayers.Projection("EPSG:26910");   // WGS84 UTM zone 10N
        var projDisplay = new OpenLayers.Projection("EPSG:4326");  // WGS84 digital lat long

         var navControl =  new OpenLayers.Control.Navigation();     
         var pointControl =  new OpenLayers.Control.DrawFeature(pointLayer,OpenLayers.Handler.Point, pointDrawFeatureOptions);


                 
     
// --------
OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },

                initialize: function(options) {
                    this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
                    OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                    ); 
                    this.handler = new OpenLayers.Handler.Click(
                        this, {
                            'click': this.onClick,
                            'dblclick': this.onDblclick 
                        }, this.handlerOptions
                    );
                } 

            });
//-------------------------------------------  
    var bounds = new OpenLayers.Bounds(-13888308, 3676401.75, -11711090, 6274862.5);                
                     
    var options = {
	controls: [
			new OpenLayers.Control.Navigation(),
			new OpenLayers.Control.PanZoomBar(),
			new OpenLayers.Control.ScaleLine(),
			new OpenLayers.Control.MousePosition(),
			new OpenLayers.Control.KeyboardDefaults(),
                        new OpenLayers.Control.LayerSwitcher({'ascending':false}),
	           ],
	projection: projSrc,
	displayProjection: projDisplay,
	units: "m",
	numZoomLevels: 18,
	maxResolution: 156543.0339,
	maxExtent: new OpenLayers.Bounds(-20037508.3427892,-20037508.3427892,20037508.3427892,20037508.3427892), 
	//restrictedExtent: bounds
     };
	
//new OpenLayers.Bounds(-13927593.910905, 4264691.6644281, -13192575.447046, 4898201.7547421)	

// define style for vector drawing


		var white =  new OpenLayers.StyleMap(
                {
			strokeColor: "#FFFFFF",
			strokeOpacity: 0.7,
			strokeWidth: 2,
			pointerEvents: "visiblePainted",
			fillOpacity: 0.0
                });
 
 
//------------------

		var untiled;
		var tiled;
		var pureCoverage = false; 
            
//  need to define controls variable to activate the overrided  default click handler
		var map, controls;
		var mapPanel;
		var format = 'image/png';


Ext.onReady(function() {         
                 
    
     map = new OpenLayers.Map("gxmap",options);
 // base layers
 
     var street = new OpenLayers.Layer.WMS(
            "Global Imagery",
            "http://maps.opengeo.org/geowebcache/service/wms",
           // {layers: "bluemarble"}
	    {layers: "openstreetmap", format: "image/png"}
        );
     var sat = new OpenLayers.Layer.TMS("World Imagery",
	   "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/",
	   { 'type':'esri', 'getURL':get_my_url, isBaseLayer:true, opacity: 1}
	   );
     var ghyb = new OpenLayers.Layer.Google(
                "Google Hybrid",
                {type: G_HYBRID_MAP,'sphericalMercator': true, isBaseLayer:true, opacity:1}
            );
       // map.addLayer(layer);
	   
		map.addLayers([ghyb,sat]);


		 // setup  tiled layer
                states = new OpenLayers.Layer.WMS(
                    "States", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:iwjv_states_3857',
                        STYLES: '',
                        format: format,
			tiled: true,
			transparent: true,
                        tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                    },
                    {
                        buffer: 0,
                        displayOutsideMaxExtent: true,
                        isBaseLayer: false,
			visibility: false,
			opacity: 0.6
                    }
                );
                
               stategons = new OpenLayers.Layer.WMS(
                    "IWJV Region", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:stategons_3857',
                        STYLES: '',
                        format: format,
			tiled: true,
			transparent: true,
                        tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                    },
                    {
                        buffer: 0,
                        displayOutsideMaxExtent: true,
                        isBaseLayer: false,
			visibility: true,
			opacity: 0.6
                    }
                );	                
		BCR_9 = new OpenLayers.Layer.WMS(
                    "BCR 9", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:bcr_9_3857',
                        STYLES: 'iwjv_bcr',
                        format: format,
			tiled: true,
			transparent: true,
                        tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                    },
                    {
                        buffer: 0,
                        displayOutsideMaxExtent: true,
                        isBaseLayer: false,
			visibility: true,
			opacity: 0.6
                    }
                );	

		BCR_10 = new OpenLayers.Layer.WMS(
                    "BCR 10", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:bcr_10_3857',
                        STYLES: '',
                        format: format,
			tiled: true,
			transparent: true,
                        tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                    },
                    {
                        buffer: 0,
                        displayOutsideMaxExtent: true,
                        isBaseLayer: false,
			visibility: true,
			opacity: 0.6
                    }
                );	
				
		BCR_16 = new OpenLayers.Layer.WMS(
                    "BCR 16", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:bcr_16_3857',
                        STYLES: '',
                        format: format,
			tiled: true,
			transparent: true,
                        tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                    },
                    {
                        buffer: 0,
                        displayOutsideMaxExtent: true,
                        isBaseLayer: false,
			visibility: true,
			opacity: 0.6
                    }
                );				
		
                map.addLayers([stategons,states,BCR_9,BCR_10,BCR_16]);
               // map.addLayer(BCR_9);
	
                
   // bird layers
   		brsp = new OpenLayers.Layer.WMS(
                    "Brewer Sparrow", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:brsp_breeding_3857',
                        STYLES: '',
                        format: format,
			tiled: true,
			transparent: true,
                        tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                    },
                    {
                        buffer: 0,
                        displayOutsideMaxExtent: true,
                        isBaseLayer: false,
			visibility: false,
			opacity: 0.6
                    }
                );

   		grsp = new OpenLayers.Layer.WMS(
                    "Grasshopper Sparrow", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:grsp_breeding_3857',
                        STYLES: '',
                        format: format,
			tiled: true,
			transparent: true,
                        tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                    },
                    {
                        buffer: 0,
                        displayOutsideMaxExtent: true,
                        isBaseLayer: false,
			visibility: false,
			opacity: 0.6
                    }
                );
                lbcu = new OpenLayers.Layer.WMS(
                    "Long-billed Curlew", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:lbcu_breeding_3857',
                        STYLES: '',
                        format: format,
			tiled: true,
			transparent: true,
                        tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                    },
                    {
                        buffer: 0,
                        displayOutsideMaxExtent: true,
                        isBaseLayer: false,
			visibility: false,
			opacity: 0.6
                    }
                );
            
   		sath = new OpenLayers.Layer.WMS(
                    "Sage Thrasher", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:sath_breeding_3857',
                        STYLES: '',
                        format: format,
			tiled: true,
			transparent: true,
                        tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                    },
                    {
                        buffer: 0,
                        displayOutsideMaxExtent: true,
                        isBaseLayer: false,
			visibility: false,
			opacity: 0.6
                    }
                );
     		sgsp = new OpenLayers.Layer.WMS(
                    "Sage Sparrow", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:sgsp_breeding_3857',
                        STYLES: '',
                        format: format,
			tiled: true,
			transparent: true,
                        tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                    },
                    {
                        buffer: 0,
                        displayOutsideMaxExtent: true,
                        isBaseLayer: false,
			visibility: false,
			opacity: 0.6
                    }
                );
           
            map.addLayers([brsp, grsp, lbcu, sath, sgsp]);        
          // map.zoomToExtent(bounds);
            
          //  var navControl =  new OpenLayers.Control.Navigation();     
         //   var pointControl =  new OpenLayers.Control.DrawFeature(pointLayer,OpenLayers.Handler.Point, pointDrawFeatureOptions);
         //   var lineControl = new OpenLayers.Control.DrawFeature(lineLayer, OpenLayers.Handler.Path,  lineDrawFeatureOptions);
         // var polygonControl = new OpenLayers.Control.DrawFeature(polygonLayer,OpenLayers.Handler.Polygon, polygonDrawFeatureOptions); 

var panelControls = [
   navControl,
   pointControl
 //  lineControl,
  // polygonControl
];
var toolbar = new OpenLayers.Control.Panel({
   displayClass: 'olControlEditingToolbar',
   defaultControl: panelControls[0]
});
toolbar.addControls(panelControls);
map.addControl(toolbar);

     
 // register the click handler while in navigate mode            
// map.events.register("click", map, query_map );
            
				 

 mapPanel = new GeoExt.MapPanel({
        title: "GeoExt MapPanel",
        renderTo: "gxmap",
     //   stateId: "mappanel",
        height: 600,
        width: 1000,
        map: map

        
        
    
 }); 
 


        map.zoomToExtent(bounds);
 


});        


<?php include("inc/php/martinHeader.php"); ?>

</script>
 
 
    </head>

        
        <body>
 <div id="gxmap"></div>  

    <div id="panel" class="olControlEditingToolbar"></div>
    
    <div id="bottom_panel" class="olControlEditingToolbar"></div>
    
    <?php include("inc/php/martinView.php"); ?>
    
		
    </body>
</html>
