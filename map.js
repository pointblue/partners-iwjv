
if (navigator.cookieEnabled == 0) {
  alert("You need to enable cookies for this site to load properly!");
}

		
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

function loadRasterAndReloadPage()
{
    loadRaster();
    window.location.reload();
}		

function changeOpacity(byOpacity) 
{
	var newOpacity = (parseFloat(OpenLayers.Util.getElement('opacity').value) + byOpacity).toFixed(1);
	newOpacity = Math.min(maxOpacity, Math.max(minOpacity, newOpacity));
	OpenLayers.Util.getElement('opacity').value = newOpacity;
	tiled.setOpacity(newOpacity);
	mask.setOpacity(newOpacity);

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
	else path = url + z + "/" + x + "/" + y + "." + this.type;

	return path;
}

// pink tile avoidance
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
// make OL compute scale according to WMS spec
OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;

 OpenLayers.Control.Hover = OpenLayers.Class(OpenLayers.Control, {                
	defaultHandlerOptions: {
		'delay': 500,
		'pixelTolerance': null,
		'stopMove': false
	},

	initialize: function(options) {
		this.handlerOptions = OpenLayers.Util.extend(
			{}, this.defaultHandlerOptions
		);
		OpenLayers.Control.prototype.initialize.apply(
			this, arguments
		); 
		this.handler = new OpenLayers.Handler.Hover(
			this,
			{'pause': this.onPause, 'move': this.onMove},
			this.handlerOptions
		);
	}, 

	onPause: function(evt) {
		var msg = 'pause ' + evt.xy;
		//alert(msg);
		
		var lonlat = map.getLonLatFromPixel(new OpenLayers.Pixel(evt.xy.x,evt.xy.y));
		lonlat.transform(projSrc,projDisplay);  
		
		var params = {
		lat: lonlat.lat,
		lon: lonlat.lon
		};
		
		// n.b: because we already have a cookie named raster, it will override any instances named raster that you might pass in the params.
		OpenLayers.loadURL("http://data.calcommons.org/ecnmap/gridinfo.php", params, this, setHTML, setHTML);
		//OpenLayers.Event.stop(evt);
		
		//document.getElementById("test").innerHTML = msg;

	},

	onMove: function(evt) {
		// if this control sent an Ajax request (e.g. GetFeatureInfo) when
		// the mouse pauses the onMove callback could be used to abort that
		// request.
	}
});
			
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
		'click': this.trigger
		}, this.handlerOptions
		);
	}, 

	trigger: function(e) {
		
		var lonlat = map.getLonLatFromPixel(new OpenLayers.Pixel(e.xy.x,e.xy.y));
		lonlat.transform(projSrc,projDisplay);  
		
		var params = {
		lat: lonlat.lat,
		lon: lonlat.lon
		};
		
		// n.b: because we already have a cookie named raster, it will override any instances named raster that you might pass in the params.
		OpenLayers.loadURL("http://data.calcommons.org/ecnmap/gridinfo.php", params, this, setHTML, setHTML);
		OpenLayers.Event.stop(e);
	}
});
	
function setHTML(response){
	document.getElementById('nodelist').innerHTML = response.responseText;
};



	


            



