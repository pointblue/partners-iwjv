<html>
    <head>
        <title>OCOF Demo: Layer Tree Selector</title>
		
<script type="text/javascript" src="/ext-3.4.0/adapter/ext/ext-base.js"></script>
<script type="text/javascript" src="/ext-3.4.0/ext-all.js"></script>
<link rel="stylesheet" type="text/css" href="/ext-3.4.0/resources/css/ext-all.css" />
<link rel="stylesheet" type="text/css" href="/ext-3.4.0/examples/shared/examples.css" />
<link rel="stylesheet" type="text/css" href="/GeoExt/resources/css/geoext-all.css">
<link rel="stylesheet" type="text/css" href="/GeoExt/resources/css/geoext-all-debug.css">
<script src="http://maps.google.com/maps?file=api&amp;v=3&amp;key=AIzaSyDs6QcNHclTKt5HZNacqC6Cfn2f7JGIXjo" type="text/javascript"></script>
<script src="OpenLayers-2.11/OpenLayers.js"></script>
<script src="/GeoExt/lib/GeoExt.js" type="text/javascript"></script>
<script type="text/javascript" src="proj4js-compressed.js"></script>
        <script type="text/javascript" src="OpenLayers-2.11/lib/jquery-1.2.1.js"></script>
        <script type="text/javascript" src="habpop.js"></script>


<script type="text/javascript">
OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";
			
//Proj4js.defs["EPSG:1000"] = "+proj=utm +zone=30 +ellps=intl +towgs84=-131,-100.3,-163.4,-1.244,-0.020,-1.144,9.39 +units=m +no_defs";
Proj4js.defs["EPSG:3310"] = "+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +datum=NAD83 +units=m +no_defs";
//Proj4js.defs["EPSG:26910"] = "+proj=utm +zone=10 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:4326"] = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

var projSrc = new OpenLayers.Projection("EPSG:3857");
var projData = new OpenLayers.Projection("EPSG:3857");
var projDisplay = new OpenLayers.Projection("EPSG:4326");

var map, geocoder, wms, slider;



function urlencode(str) {
	str = escape(str);
	str = str.replace('+', '%2B');
	str = str.replace('%20', '+');
	str = str.replace('*', '%2A');
	str = str.replace('/', '%2F');
	str = str.replace('@', '%40');
	return str;
}

function urldecode(str) {
	str = str.replace('+', ' ');
	str = unescape(str);
	return str;
}

function dumpProps(obj, parent) {
   for (var i in obj) {
      if (parent) { var msg = parent + "." + i + "\n" + obj[i]; } else { var msg = i + "\n" + obj[i]; }
      if (!confirm(msg)) { return; }
      if (typeof obj[i] == "object") {
         if (parent) { dumpProps(obj[i], parent + "." + i); } else { dumpProps(obj[i], i); }
      }
   }
}

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
    else if(this.type == 'google') path = url+"Z"+z+"/"+y+"_"+x+".png";
    else path = url + z + "/" + x + "/" + y + "." + this.type;
	
    return path;
}

function fetchGeocodes() {
	geocoder = new GClientGeocoder();
	geocoder.getLocations(document.getElementById('q-adress').value, gotGeocodes);
}

function gotGeocodes(response) {
	if (!response || response.Status.code != 200) {
		//alert("Sorry, we were unable to geocode that address");
	} else {
		var placemarks = response.Placemark;
		if (placemarks.length > 0) {
			var coords = placemarks[0].Point.coordinates;
			var ll = new OpenLayers.LonLat(coords[0],coords[1]).transform(new OpenLayers.Projection("EPSG:4326"), map.mapanel.map.getProjectionObject());
			var pointGeometry = new OpenLayers.Geometry.Point(ll.lon, ll.lat);
			map.mapanel.map.setCenter (ll, 16);
		}
	}
}

function getUrlParam(name) {
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

function getLayerVisibilityFromParam(layerNameParam) {
	//map_visibility_Major%20Roads
	var layerName = "map_visibility_"+layerNameParam;
	layerName = layerName.replace(' ', '%20');
	//alert(layerName);
	if (getUrlParam(layerName) == 'true') { return true; }
	else { return false ;}
}

function updateLayerVisibility() {
	for (var k = map.mapPanel.map.layers.length - 1; k >= 0; k--) {
		//alert(map.mapanel.map.layers[k].name);
		var theName = map.mapPanel.map.layers[k].name;
		var theVis = getLayerVisibilityFromParam(theName);
		//alert(theName + " " + theVis);
		map.mapPanel.map.layers[k].setVisibility(theVis);
		//map.removeLayer(map.layers[k]);
	}
	map.mapPanel.map.layers[0].setVisibility(true);
}



Ext.BLANK_IMAGE_URL = "/ext-3.4.0/resources/images/default/s.gif";
var map, mapPanel, legendPanel, items = [], controls = [];

        Ext.onReady(function() {
		

	
			wms = new OpenLayers.Layer.WMS(
				"Global Imagery",
				"http://maps.opengeo.org/geowebcache/service/wms",
				{layers: "bluemarble"}
			);
	
	
            map = new Ext.Viewport({
                layout: "border",
                items: items
            });
			
			
		slider = new GeoExt.LayerOpacitySlider({
			layer: wms,
			aggressive: true, 
			width: 200,
			isFormField: true,
			fieldLabel: "opacity",
			renderTo: "slider",
			plugins: new GeoExt.LayerOpacitySliderTip({template: '<div>Opacity: {opacity}%</div>'})
		});
	
		
		  
	
	updateLayerVisibility();
        
        //       Map Panel and Controls for User-drawn vectors

var panelControls = [
 new OpenLayers.Control.Navigation(),
 new OpenLayers.Control.DrawFeature(pointLayer,
     OpenLayers.Handler.Point, pointDrawFeatureOptions),
 new OpenLayers.Control.DrawFeature(lineLayer,
     OpenLayers.Handler.Path, lineDrawFeatureOptions ),
 new OpenLayers.Control.DrawFeature(polygonLayer,
     OpenLayers.Handler.Polygon, polygonDrawFeatureOptions)
];

var toolbar = new OpenLayers.Control.Panel({
   displayClass: 'olControlEditingToolbar',
   defaultControl: panelControls[0]
});
toolbar.addControls(panelControls);
  map.addControl(toolbar);
 map.mapPanel.map.addControl(toolbar);
       
	
        });

		// test url for roads visibility:
		// http://localhost/ocofmap/simple.php?map_x=-13655745.623513&map_y=4569718.406585&map_zoom=11&map_visibility_Major%20Roads=true
		//http://localhost/ocofmap/simple.php?map_x=-13655745.623513&map_y=4569718.406585&map_zoom=11&map_visibility_Major%20Roads=true
		//
		//alert(getUrlParam("map_visibility_Major%20Roads"));
		//alert(getUrlParam("map_visibility_Major Roads"));

		//var temp = getLayerVisibilityFromParam("Major%20Roads");

        items.push( {
            xtype: "gx_mappanel",
            ref: "mapPanel",
            region: "center",
            map: {
	      controls: controls,
              projection: new OpenLayers.Projection("EPSG:900913"),
			  displayProjection: new OpenLayers.Projection("EPSG:4326"),
	          units: "m",
	          numZoomLevels: 20,
	          maxResolution: 156543.0339,
	          maxExtent: new OpenLayers.Bounds(-20037508.3427892,-20037508.3427892,20037508.3427892,20037508.3427892)
            },
			 center: [-13662624.952468, 4561768.9520558],
			zoom: 8,
			 stateId: "map",
			prettyStateKeys: true,
            layers: [
			new OpenLayers.Layer.TMS(
				"ESRI Aerial Imagery",
				"http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/",
				{ 'type':'esri', 'getURL':get_my_url, isBaseLayer:true, visibility: true, opacity: 1}
			),
			new OpenLayers.Layer.TMS("ESRI Place Names",
		"http://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/",
		{ 'type':'esri', 'getURL':get_my_url, isBaseLayer:false, visibility: false, opacity: 1
		}),
			
   
   /*new OpenLayers.Layer.TMS(
		       "Flood Depth", "http://data.calcommons.org/tiles/ocof/SLR100Wave010_flddeep/",
		       { 
			     'type':'google', 
				 'getURL':get_my_url, 
				 isBaseLayer:false, 
				 visibility: false, 
				 opacity: 1
		       }),        
                        
     */                   
                        new OpenLayers.Layer.WMS(
                    "Major Roads", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:planet_osm_line',
                       STYLES: 'ocof_roads',
						transparent: true,
						CQL_FILTER: "ftype='roads' and z_order > 1 ",
						format: 'image/png'
                    },
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility:  false } 
                ),
				new OpenLayers.Layer.WMS(
                    "Residential Roads", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:planet_osm_line',
                       STYLES: 'ocof_roads',
						transparent: true,
						CQL_FILTER: "ftype='roads' and z_order = 1 ",
						format: 'image/png'
                    },
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
			new OpenLayers.Layer.WMS("Rivers and Streams", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {LAYERS: 'spatial2:planet_osm_line', STYLES: 'ocof_osm', CQL_FILTER: "waterway = 46000 or waterway = 46006 or waterway like 'MR'", transparent: true,format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
			new OpenLayers.Layer.WMS(
                    "Railway", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:planet_osm_line',
                        STYLES: 'ocof_rail',
						CQL_FILTER: "railway like 'rail'",
						transparent: true,
                        format: 'image/png'
                    },
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
				new OpenLayers.Layer.WMS(
                    "Subway", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:planet_osm_line',
                        STYLES: 'ocof_rail',
						CQL_FILTER: "railway like 'subway'",
						transparent: true,
                        format: 'image/png'
                    },
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS(
                    "Light Rail", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:planet_osm_line',
                        STYLES: 'ocof_rail',
						CQL_FILTER: "route like 'tram'",
						transparent: true,
                        format: 'image/png'
                    },
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
			new OpenLayers.Layer.WMS(
                    "Airports", "http://data.calcommons.org:8080/geoserver/wms",
                    {
                        LAYERS: 'ocof_osm',
						CQL_FILTER: "aeroway is not null",
						transparent: true,
                        format: 'image/png'
                    },
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
			new OpenLayers.Layer.WMS(
                    "Ferry Route", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:planet_osm_line',
                        STYLES: 'ocof_ferry',
						transparent: true,
						CQL_FILTER: "route like 'ferry'" ,
                        format: 'image/png'
                    },
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
			new OpenLayers.Layer.WMS(
                    "Trails", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                    {
                        LAYERS: 'spatial2:planet_osm_line',
                        STYLES: 'ocof_paths',
						transparent: true,
						CQL_FILTER: "highway like 'track' OR highway LIKE 'footway' OR highway LIKE 'path' OR highway LIKE 'cycleway'" ,
                        format: 'image/png'
                    },
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				// start the "amenity" layers.
				new OpenLayers.Layer.WMS("Ferry Terminal", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'ocof_osm', CQL_FILTER: "amenity like 'ferry_terminal'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				new OpenLayers.Layer.WMS("Prime Farmland", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'ocof_osm', CQL_FILTER: "landuse = 'polygon_ty' AND ftype LIKE 'farm_prime' ", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),	
				new OpenLayers.Layer.WMS("Other Farmland", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'ocof_osm', CQL_FILTER: "landuse = 'polygon_ty' AND ftype LIKE 'farm_other'  ", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				new OpenLayers.Layer.WMS("Range or Grazing Land", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'ocof_osm', CQL_FILTER: "landuse = 'polygon_ty' AND ftype = 'range' ", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				new OpenLayers.Layer.WMS("Built-up Area", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'ocof_osm', CQL_FILTER: " landuse = 'polygon_ty' AND ftype LIKE 'developed' ", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				new OpenLayers.Layer.WMS("Native Vegetation", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'ocof_osm', CQL_FILTER: "landuse = 'polygon_ty' AND ftype like 'natural' ", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("School", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: "spatial2:planet_osm_point", styles: 'ocof_osm', CQL_FILTER: "amenity like 'school'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Parking", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'parking'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Place of Worship", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'place_of_worship'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Bank", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'bank'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Ferry Terminal", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'ferry_terminal'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Library", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'library'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Post Office", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'post_office'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Gas Station", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point',styles: 'ocof_osm',   CQL_FILTER: "amenity like 'fuel'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Town Hall", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'townhall'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Police Station", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'police'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Fire Station", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'fire_station'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Hospital", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'hospital'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Detention Facility", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'prison'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Cemetary", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'grave_yard'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Public Building", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'public_building'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Bus Station", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'bus_station'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Courthouse", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'courthouse'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
			
		new OpenLayers.Layer.WMS("Restaurant", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'restaurant'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Public Restroom", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'toilets'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		
		new OpenLayers.Layer.WMS("Water Treatment", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "ftype LIKE 'water_treatment'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
				
		new OpenLayers.Layer.WMS("Shopping", "http://data.calcommons.org:8080/geoserver/wms",
                    {LAYERS: 'spatial2:planet_osm_point', styles: 'ocof_osm',  CQL_FILTER: "amenity like 'shopping'", transparent: true, format: 'image/png'},
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
		new OpenLayers.Layer.WMS(
                    "Power Lines, Generators, & Stations", "http://data.calcommons.org:8080/geoserver/wms",
                    {
                        LAYERS: 'ocof_osm',STYLES: 'ocof_power',
						CQL_FILTER: "power is not null and power not like 'tower' and power not like 'pole' and power not like '%cabinet'",
						transparent: true,
                        format: 'image/png'
                    },
                    {singleTile: true, ratio: 1, isBaseLayer: false, visibility: false} 
                ),
                    
                     /*
		new OpenLayers.Layer.WMS(
				"USFWS Critical Habitat", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
				{LAYERS: 'ocof:usfws_critical_habitat_all', format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
			),		
		new OpenLayers.Layer.WMS(
				"USFWS Nat'l Wetlands Inv.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
				{LAYERS: 'ocof:wetlands_usfws_nwi', format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
			),		
	
		new OpenLayers.Layer.WMS(
				"ebird: Snowy Plover", "http://data.calcommons.org:8080/geoserver/multimap/wms?",
				{LAYERS: 'multimap:multimap_locations_species', CQL_FILTER: " speciescollection LIKE '%SNPL%' ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
			),			
		
               
                new OpenLayers.Layer.WMS(
				"ebird: Clapper Rail", "http://data.calcommons.org:8080/geoserver/multimap/wms?",
				{LAYERS: 'multimap:multimap_locations_species', CQL_FILTER: " speciescollection LIKE '%CLRA%' ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
			),
		new OpenLayers.Layer.WMS(
			"Flood Hazard, 000 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_000_fldhazd",  styles: 'ocof_flood', CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: true} 
		),
		new OpenLayers.Layer.WMS(
			"Low-lying Areas, 000 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_000_lowfld",   styles: 'ocof_flood_lowlying',  CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: true} 
		),
		new OpenLayers.Layer.WMS(
			"Flood Uncertainty, 000 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_000cm_staticmhhw_fld_uncert",   styles: 'ocof_flood_uncertainty',  CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"Flood Hazard, 100 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_100_fldhazd",  styles: 'ocof_flood', CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"Low-lying Areas, 100 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_100_lowfld",   styles: 'ocof_flood_lowlying',  CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"Flood Uncertainty, 100 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_100cm_staticmhhw_fld_uncert",   styles: 'ocof_flood_uncertainty',  CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"Flood Hazard, 150 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_150_fldhazd",  styles: 'ocof_flood', CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"Low-lying Areas, 150 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_150_lowfld",   styles: 'ocof_flood_lowlying',  CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"Flood Uncertainty, 150 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_150cm_staticmhhw_fld_uncert",   styles: 'ocof_flood_uncertainty',  CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"Flood Hazard, 200 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_200_fldhazd",  styles: 'ocof_flood', CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"Low-lying Areas, 200 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_200_lowfld",   styles: 'ocof_flood_lowlying',  CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"Flood Uncertainty, 200 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_200cm_staticmhhw_fld_uncert",   styles: 'ocof_flood_uncertainty',  CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"Flood Hazard, 500 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_500_fldhazd",  styles: 'ocof_flood', CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"Low-lying Areas, 500 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_500_lowfld",   styles: 'ocof_flood_lowlying',  CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"Flood Uncertainty, 500 cm.", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:slr_500cm_staticmhhw_fld_uncert",   styles: 'ocof_flood_uncertainty',  CQL_FILTER: " grid_code > 0 ", format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		)
		,
		new OpenLayers.Layer.WMS(
			"Jan. 10, 2010 Wave Height", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:jan10_wave_ht_shore",   styles: 'jan10_wave_ht', format: 'image/png',transparent: true, projection:'EPSG:26910'}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"Jan. 10, 2010 Current Velocity", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:jan10_bolinas_current_vel",   styles: 'jan10_current_vel', format: 'image/png',transparent: true, projection:'EPSG:26910'}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"Jan. 10, 2010 Flood Depth", "http://data.calcommons.org:8080/geoserver/ocof/wms?",
			{LAYERS: "ocof:jan10_dem5_flddeep",   styles: 'jan10_flddeep', format: 'image/png',transparent: true, projection:'EPSG:26910'}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"PRBO Bird Species Richness", "http://data.calcommons.org:8080/geoserver/ecn/wms?",
			{LAYERS: 'ecn:ocof_richness_idw10m_clipped',  format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		),
		new OpenLayers.Layer.WMS(
			"PRBO Conservation Priority", "http://data.calcommons.org:8080/geoserver/ecn/wms?",
			{LAYERS: 'ecn:allcurr_weights',  format: 'image/png',transparent: true}, {singleTile: true, ratio: 1, isBaseLayer: false, opacity: 1, visibility: false} 
		)
		*/	
		

			]
        });
		
		
			
        controls.push(
			new OpenLayers.Control.Navigation(),
			new OpenLayers.Control.PanZoomBar(),

			new OpenLayers.Control.MousePosition(),
			new OpenLayers.Control.KeyboardDefaults(),
                                                new OpenLayers.Control.Permalink(),
                        new OpenLayers.Control.ScaleLine(),
                        new OpenLayers.Control.Permalink('permalink')
        );
		
		
	
		
		items.push({
		xtype: "gx_legendpanel",
		region: "east",
		width: 200,
		autoScroll: true,
		collapsible: true,
                collapseMode: "mini",
		padding: 5
		});
		
		items.push({
		xtype: "panel",
		region: "south",
		contentEl: "desc",
		autoScroll: true,
		collapsible: true,
                collapseMode: "mini",
		height: 200,
		padding: 5
		});
		
		
		
controls.push(new OpenLayers.Control.WMSGetFeatureInfo({
    autoActivate: true,
    infoFormat: "application/vnd.ogc.gml",
    maxFeatures: 3,
    eventListeners: {
        "getfeatureinfo": function(e) {
            var items = [];
            Ext.each(e.features, function(feature) {
                items.push({
                    xtype: "propertygrid",
                    title: feature.fid,
                    source: feature.attributes
                });
            });
            new GeoExt.Popup({
                title: "Feature Info",
                width: 200,
                height: 200,
                layout: "accordion",
                map: map.mapPanel,
                location: e.xy,
                items: items
            }).show();
        }
    }
}));


		
		
		
		 // create our own layer node UI class, using the TreeNodeUIEventMixin
    var LayerNodeUI = Ext.extend(GeoExt.tree.LayerNodeUI, new GeoExt.tree.TreeNodeUIEventMixin());
        
    // using OpenLayers.Format.JSON to create a nice formatted string of the
    // configuration for editing it in the UI
    var treeConfig = [{
        nodeType: "gx_baselayercontainer"
    }, { 
	nodeType:"async",
	expanded: true,
	text:"Bird Species Ranges",
	children: [
		{nodeType: "gx_layer", uiProvider: "layernodeui", layer: "Major Roads"},
		{nodeType: "gx_layer", uiProvider: "layernodeui",  layer: "Parking"},
		{nodeType: "gx_layer", uiProvider: "layernodeui",  layer: "Residential Roads"}]
		}, { 
	nodeType:"async",
		text:"Land Use (Farmland Mapping & Monitoring Program)",
		children: [
		{nodeType: "gx_layer", uiProvider: "layernodeui",  layer: "Prime Farmland"},
		{nodeType: "gx_layer", uiProvider: "layernodeui", layer: "Other Farmland"},
		{nodeType: "gx_layer", uiProvider: "layernodeui", layer: "Native Vegetation"}]
		},  

	];
	
	
	
	// create the tree with the configuration from above
    tree = new Ext.tree.TreePanel({
        border: true,
        region: "west",
        title: "Layers",
        width: 200,
        split: true,
        collapsible: true,
        collapseMode: "mini",
		enableDD: true,
        autoScroll: true,
        plugins: [
            new GeoExt.plugins.TreeNodeRadioButton({
                listeners: {
                    "radiochange": function(node) {
						var currentExtent = map.mapPanel.map.getExtent();
						//alert(currentExtent);
						
                        //alert(node.text + " is now the active layer, yes it is.");
						
						//alert(node.layer.getOptions() );
						//dumpProps(node.layer.getOptions());
						node.layer.setVisibility (true);
						//alert(node.layer.getFullRequestString('download=1'));
						//alert(node.layer.getURL(new OpenLayers.Bounds(-20037508.3427892,-20037508.3427892,20037508.3427892,20037508.3427892)));
						
						//alert(map.layers.length);
						//alert(app.mapPanel.map.layers.length);
						



						//var downloadurl = node.layer.getURL(new OpenLayers.Bounds(-20037508.3427892,-20037508.3427892,20037508.3427892,20037508.3427892));
						var downloadurl = node.layer.getURL(currentExtent);
						
						var projectedExtent = currentExtent.transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:26910"));
						
						var downloadurl_b = node.layer.getURL(projectedExtent);
						
						//alert(projectedExtent);
						
						
						//dumpProps(node.layer.getFullRequestString('x=y'));
						// mind the single-double quotes here.  The CQL_FILTER will often have single quotes in the LIKE strings.
						//http://data.calcommons.org:8080/geoserver/spatial2/wms?LAYERS=spatial2%3Aplanet_osm_line&STYLES=ocof_rail&CQL_FILTER=railway+like+'subway'&TRANSPARENT=TRUE&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&SRS=EPSG%3A900913&BBOX=-20037508.342789,-20037508.342789,20037508.342789,20037508.342789&WIDTH=1513&HEIGHT=666
						
						//works, this is right out of GeoServer.
						//http://data.calcommons.org:8080/geoserver/ocof/wms?service=WMS&version=1.1.0&layers=ocof%3Ajan10_wave_ht_shore&request=GetMap&styles=jan10_wave_ht&format=image%2Fpng&transparent=TRUE&bbox=460922.9458437746,4162750.277379163,586129.2483046062,4221559.407151006&width=314&height=512&srs=EPSG%3A26910
						//Not working:
						//http://data.calcommons.org:8080/geoserver/ocof/wms?service=WMS&version=1.1.1&layers=ocof%3Ajan10_wave_ht_shore&request=GetMap&styles=jan10_wave_ht&format=image%2Fpng&transparent=TRUE&bbox=-20037508.342789,-20037508.342789,20037508.342789,20037508.342789&SRS=EPSG%3A900913&width=1513&height=666
						//http://data.calcommons.org:8080/geoserver/wms?LAYERS=ocof:jan10_wave_ht_shore&TRANSPARENT=TRUE&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A26910&BBOX=-13741584.402672,4524620.5563159,-13583665.502264,4598917.3477957&WIDTH=1033&HEIGHT=486
						
						var nodeText = "http://data.calcommons.org:8080/geoserver/ocof/wms?service=WMS&version=1.1.0&request=GetMap&layers=ocof:jan10_wave_ht_shore&styles=&bbox=512946.22,4140310.5,549936.22,4200450.5&width=314&height=512&srs=EPSG:26910&format=image%2Fpng";
						
						var testUrl = '<a href="'+nodeText+'">'+nodeText+'</a>';
						//document.getElementById("downloadlink").innerHTML = '<a href="'+downloadurl+'">'+node.text+'</a>';
						//document.getElementById("downloadlink").innerHTML = '<a href="'+downloadurl+'">'+node.text+'</a>' + '&nbsp;|&nbsp;<a href="'+downloadurl_b+'">'+node.text+'</a>';
						
						slider.setLayer(node.layer);
  
		
                    }
                }
            })
        ],
        loader: new Ext.tree.TreeLoader({
            // applyLoader has to be set to false to not interfer with loaders
            // of nodes further down the tree hierarchy
            applyLoader: false,
            uiProviders: {
                "layernodeui": LayerNodeUI
            }
        }),
        root: {
            nodeType: "async",
            // the children property of an Ext.tree.AsyncTreeNode is used to
            // provide an initial set of layer nodes. 
            children: treeConfig
            
        },
        listeners: {
			// n.b: this listener doesn't seem to be firing.  Use the onle in plugins.
            "radiochange": function(node){
                //alert(node.layer.name + " is now the the active layer, yo.");
            }
        },
        rootVisible: false,
        lines: false
    });
	
	items.push(tree);
	

	
		


        </script>
    </head>

        
        <body>
		
	  <div id="desc">
	  <!--
			 The checkboxes control layer <i>visibility</i>.  The radio buttons set the <i>active</i> layer.  After you select an active layer, the slider can be used to change 
			 its opacity.
			 <br><br>
			Opacity: 
			 <div id="slider" style="clear:both"></div>

     
           <form action="#" onsubmit="fetchGeocodes(); return false;">
			<br><br><strong>Enter an address or placename, and press "Enter" to search for a specific place:</strong>
			<input type="text" id="q-adress" name="q" value="" size="40" onClick="document.getElementById('q-adress').value=''/>
			<input type="submit" name="find" value="Search" />
		</form>
	-->
        </div>
		
		
    </body>
</html>
