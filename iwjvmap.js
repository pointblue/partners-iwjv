/* functions */

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
        if (parent) {
            var msg = parent + "." + i + "\n" + obj[i];
        } else {
            msg = i + "\n" + obj[i];
        }
        if (!confirm(msg)) {
            return;
        }
        if (typeof obj[i] == "object") {
            if (parent) {
                dumpProps(obj[i], parent + "." + i);
            } else {
                dumpProps(obj[i], i);
            }
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
	
    if (this.type == 'esri') 
    {
        path = url+z+"/"+y+"/"+x;
    }
    else if (this.type == 'google') 
    {
		// these are calls to our tiles, in the google tile schema.
        path = url+"Z"+z+"/"+y+"_"+x+".png";
    }
	else if(this.type == 'googleapi') { 
		// these are calls to the actual google tile server.
		path = url+"&x="+x+"&y="+y+"&z="+z;
	}
    else 
    {
        path = url + z + "/" + x + "/" + y + "." + this.type;
    }
	
    return path;
}

function recenterMap() {
    map.setCenter(center, 10) ;  //, 	dragging, forceZoomChange)
}

function fetchGeocodes() {
    geocoder = new GClientGeocoder();
 //if not blank...
    if( document.getElementById('q-adress').value.length >0)
    {
            var add = document.getElementById('q-adress').value + ', CA';
            geocoder.getLocations(add, gotGeocodes);
    }

}

function gotGeocodes(response) {
    if (!response || response.Status.code != 200) 
    {
    //alert("Sorry, we were unable to geocode that address");
    } 
    else 
    {
        var placemarks = response.Placemark;
        if (placemarks.length > 0) {
            
            var north = response.Placemark[0].ExtendedData.LatLonBox.north;
            var south = response.Placemark[0].ExtendedData.LatLonBox.south;
            var east  = response.Placemark[0].ExtendedData.LatLonBox.east;
            var west  = response.Placemark[0].ExtendedData.LatLonBox.west;
            
            var bounds = new OpenLayers.Bounds();
            bounds.extend(new OpenLayers.LonLat(east,north).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()));
            bounds.extend(new OpenLayers.LonLat(west,south).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject()));

            map.zoomToExtent(bounds);
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

function changeOpacity(byOpacity) {
	var newOpacity = (parseFloat(OpenLayers.Util.getElement('opacityVal').value) + byOpacity).toFixed(1);
	newOpacity = Math.min(maxOpacity, Math.max(minOpacity, newOpacity));
	OpenLayers.Util.getElement('opacityVal').value = newOpacity;
	for (var k = map.layers.length - 1; k >= 0; k--) {
		if(map.layers[k].isBaseLayer == false) map.layers[k].setOpacity(newOpacity);
    }
}
	
function getLayerVisibilityFromParam(layerNameParam) {
    var layerName = "map_visibility_"+layerNameParam;
    layerName = layerName.replace(' ', '%20');
    if (getUrlParam(layerName) == 'true') {
        return true;
    }
    else {
        return false ;
    }
}

function updateLayerVisibility() {
    for (var k = map.layers.length - 1; k >= 0; k--) {
        var theName = map.layers[k].name;
        var theVis = getLayerVisibilityFromParam(theName);
        map.layers[k].setVisibility(theVis);
    }
    map.layers[0].setVisibility(true);
}

function setActiveLayer(layer)
{
    ActiveLayer = layer.name;
    var currentExtent = map.getExtent();
    layer.setVisibility (true);
    var downloadurl = layer.getURL(currentExtent);

    var projectedExtent = currentExtent.transform(projSrc, projData);		
    var downloadurl_b = layer.getURL(projectedExtent);

    var nodeText = "http://data.calcommons.org:8080/geoserver/ocof/wms?service=WMS&version=1.1.0&request=GetMap&layers=ocof:jan10_wave_ht_shore&styles=&bbox=512946.22,4140310.5,549936.22,4200450.5&width=314&height=512&srs=EPSG:26910&format=image%2Fpng";

    var testUrl = '<a href="'+nodeText+'">'+nodeText+'</a>';

    if (ActiveLayer.indexOf("Depth") != -1 )  createPseudoCookie('activelayer', layer.name, 60);					
    //slider.setLayer(layer);		
}

function makeLayersVisible() {
    var SLR_LAYER_NAME;
    var STORM_VALUE;
    var STORM_LAYER_NAME;
    var PRODUCT_NAME;
    var SLRValue = null;
    var stormValue = null;
    var productValue = null;
    // grab the value from the SLR picker
    // grab the value from the storm scenario picker	
    for (var i=0; i < document.homer_form.slrval.length; i++) 
    {
        if (document.homer_form.slrval[i].checked)
        {
            SLR_VALUE = document.homer_form.slrval[i].value;
            SLRValue = SLR_VALUE;
        }
    }
    /* Special processing for sea level rise scenarios */
    if(SLRValue)
    { 
        switch (SLRValue)
        {
            case "Current":
                SLR_VALUE = "000cm"; 
                break;
            case "25":
                SLR_VALUE = "025cm"; 
                break;
            case "50":
                SLR_VALUE = "050cm"; 
                break;
            case "75":
                SLR_VALUE = "075cm"; 
                break;
            default:
                SLR_VALUE = SLRValue+"cm";
        }
            
    //var container = document.getElementById("SLR");
    //container.innerHTML = "Displaying "+SLRValue+" sea level rise";
    }
    // grab the value from the storm scenario picker	
    for ( i=0; i < document.homer_form.stormval.length; i++) 
    {
        if (document.homer_form.stormval[i].checked) 
        {
            STORM_VALUE = document.homer_form.stormval[i].value;
            stormValue = STORM_VALUE;
        }
    }

    /* Special processing for storm scenarios */
    if(stormValue)
    { 
        switch (stormValue)
        {
            case "Current":
                STORM_VALUE = "000"; 
                break;
            default:
                STORM_VALUE = "Wave "+stormValue;
        }
    }

    // and get the OCOF product.  i.e. Wave, Current, Flood.  By tweaking grids.SpatialDataSetName, we can create intuitive groupings.
    for (i=0; i < document.homer_form.productval.length; i++) 
    {
        if (document.homer_form.productval[i].checked)
        {
            PRODUCT_VALUE = document.homer_form.productval[i].value;
             productValue = PRODUCT_VALUE;
        }
    }
    /* Special processing for products */
    if(productValue)
    { 
        switch (productValue)
        {
            case "Shoreline":
                PRODUCT_VALUE = "MHW"; 
                break;
            default:
                PRODUCT_VALUE = productValue;
        }
    }

    // append the units.  This all needs to match up what is in the data_registry.
    // Make sure to zero-pad the values in the dataregistry so 2 doesn't match both 2 and 20, e.g.
    //SLR_LAYER_NAME = SLR_VALUE+"cm";
    STORM_LAYER_NAME = "Wave " + STORM_VALUE;
	
    if (map != undefined && map.layers != undefined && map.layers.length != undefined)
    {
        for (var k = map.layers.length - 1; k >= 0; k--) 
        {
            var theName = map.layers[k].name;
            // First, turn any SLR layer off.
            if (theName.indexOf("SLR") != -1 )
            {
                map.layers[k].setVisibility(false);
            }
            // Then turn ON the desired vulnerability, SLR level, storm scenario.
            if (theName.indexOf(SLR_VALUE) != -1  
                && theName.indexOf(STORM_VALUE) != -1 
                && theName.indexOf(PRODUCT_VALUE) != -1) 
            { 
                setActiveLayer(map.layers[k]);
            }
            if(theName.indexOf("Duration") != -1 )
            {
                map.layers[k].setVisibility(false);
            }
        }
    }
	
	document.getElementById("downloadmeta").innerHTML = "<a target='_new' href='http://data.calcommons.org/ocofmap/meta.php?model=SLR"+SLRValue+"&scenario="+STORM_VALUE+"&variable="+PRODUCT_VALUE+"&raster=SLR500Wave100_flddeep'>Metadata</a>";
	
}

function makeOtherLayersVisible(checkbox)
{
    var otherValue = null;
    var k = null;
    var theName = null;
    
    otherValue = checkbox.value;    
        
    switch (otherValue)
    {
        case "buildings":
            for (k = map.layers.length - 1; k >= 0; k--) 
            {
                theName = map.layers[k].name;
                if(theName.indexOf("Buildings")!= -1)
                {
                    map.layers[k].setVisibility(checkbox.checked);
                    //slider.setLayer(map.layers[k]);
                }
            }
            break;
        case "placenames":
            for (k = map.layers.length - 1; k >= 0; k--) 
            {
                theName = map.layers[k].name;
                if(theName.indexOf("ESRI Place Names")!= -1)
                {
                    map.layers[k].setVisibility(checkbox.checked);
                    //slider.setLayer(map.layers[k]);
                }
            }
            break;
        case "protected":
            for (k = map.layers.length - 1; k >= 0; k--) 
            {
                theName = map.layers[k].name;
                if(theName.indexOf("Protected Areas")!= -1)
                {
                    map.layers[k].setVisibility(checkbox.checked);
                    //slider.setLayer(map.layers[k]);
                }
            }
            break;
        case "csmw":
            for (k = map.layers.length - 1; k >= 0; k--) 
            {
                theName = map.layers[k].name;
                if((theName.indexOf("Coastal Armoring")!= -1) ||
                    (theName.indexOf("Beaches of Erosional Concern")!= -1) ||
                    (theName.indexOf("Navigation Channels")!= -1) ||
                    (theName.indexOf("Coastal Barriers")!= -1))                {
                    map.layers[k].setVisibility(checkbox.checked);
                    //slider.setLayer(map.layers[k]);
                }
            }
            break;
			
        case "cliffretreat":  
            for (k = map.layers.length - 1; k >= 0; k--) 
            {
                theName = map.layers[k].name;
                if( (theName.indexOf("Cliff Retreat")!= -1) ||
				(theName.indexOf("Shoreline")!= -1)  ||
				(theName.indexOf("Cliff Intersection - 2010")!= -1) 
				
				)                {
                    map.layers[k].setVisibility(checkbox.checked);
                    //slider.setLayer(map.layers[k]);
                }
            }
            break;
			
        case "landuse":
            for (k = map.layers.length - 1; k >= 0; k--) 
            {
                theName = map.layers[k].name;
                if(theName.indexOf("Gap")!= -1)
                {
                    map.layers[k].setVisibility(checkbox.checked);
                    //slider.setLayer(map.layers[k]);
                }
            }
            break;
        case "rivers":
            for (k = map.layers.length - 1; k >= 0; k--) 
            {
                theName = map.layers[k].name;
                if(theName.indexOf("Rivers")!= -1)
                {
                    map.layers[k].setVisibility(checkbox.checked);
                    //slider.setLayer(map.layers[k]);
                }
            }                    
            break;
        case "shorebirds":
            for (k = map.layers.length - 1; k >= 0; k--) 
            {
                theName = map.layers[k].name;
                if((theName.indexOf("Shorebird")!= -1) &&
                    (theName.indexOf("Annual")!= -1))
                    {
                    map.layers[k].setVisibility(checkbox.checked);
                    
                }
            }                  
            break;
        case "transportation":
            for (k = map.layers.length - 1; k >= 0; k--) 
            {
                theName = map.layers[k].name;
                if((theName.indexOf("Roads")!= -1) ||
                    (theName.indexOf("Rails")!= -1) ||
                    (theName.indexOf("Airports")!= -1) ||
                    (theName.indexOf("Public Parking")!= -1) ||
                    (theName.indexOf("Public Transportation")!= -1))
                    {
                    map.layers[k].setVisibility(checkbox.checked);
                    //slider.setLayer(map.layers[k]);
                }
            }
                    
            break;
			
		 case "trails":
            for (k = map.layers.length - 1; k >= 0; k--) 
            {
                theName = map.layers[k].name;
                if((theName.indexOf("Pedestrian")!= -1)   )
                    {
                    map.layers[k].setVisibility(checkbox.checked);
                    
                }
            }
			break;
			
        case "utilities":
            for (k = map.layers.length - 1; k >= 0; k--) 
            {
                theName = map.layers[k].name;
                if((theName.indexOf("Services")!= -1) ||
                    (theName.indexOf("Utilities")!= -1) ||
                    (theName.indexOf("Commercial")!= -1))
                    {
                    map.layers[k].setVisibility(checkbox.checked);
                    //slider.setLayer(map.layers[k]);
                }
            }
                    
            break;

        default:
            break;
    }
}


function turnOffOtherLayers()
{
    for (var k = map.layers.length - 1; k >= 0; k--) 
    {
        var theName = map.layers[k].name;

        // this should skip all the SLR data and only turn off other data
        //
        if (theName.indexOf('SLR +') == -1 && theName.indexOf('2010 ') == -1)
        {
            map.layers[k].setVisibility(false);
        }
    }

}

function clearUI()
{
    for (i=0; i < document.homer_form.other.length; i++) 
    {
        var checkbox = document.homer_form.other[i]; 
        if(checkbox.checked) {
            checkbox.checked=false;
        } 
           
    }
    for (i=0; i < document.homer_form.stormval.length; i++) 
    {
        var radiobutton = document.homer_form.stormval[i]; 
        if(radiobutton.checked) {
            radiobutton.checked=false;
        } 
    }
    for (i=0; i < document.homer_form.slrval.length; i++) 
    {
        radiobutton = document.homer_form.slrval[i]; 
        if(radiobutton.checked) {
            radiobutton.checked=false;
        } 
    }
    for (i=0; i < document.homer_form.productval.length; i++) 
    {
        radiobutton = document.homer_form.productval[i]; 
        if(radiobutton.checked) {
            radiobutton.checked=false;
        } 
    }
    
    // var download_style = '<a style="display:none" href="http://www.prbo.org"></a>';
    // document.getElementById("download").innerHTML = download_style;
   
}

function resetDefaultLayers()
{
	SLR_VALUE = "000cm";
	STORM_VALUE = "Wave 000"; 
	PRODUCT_VALUE ="Flood";
    STORM_LAYER_NAME = "Wave " + STORM_VALUE;
//check the buttons
	document.getElementById("slrCurrent").checked=true
	document.getElementById("flood").checked=true
	document.getElementById("scen000").checked=true
	
    if (map != undefined && map.layers != undefined && map.layers.length != undefined)
    {
        for (var k = map.layers.length - 1; k >= 0; k--) 
        {
            var theName = map.layers[k].name;
  // Then turn ON the default vulnerability, SLR level, storm scenario.
            if (theName.indexOf(SLR_VALUE) != -1  
                && theName.indexOf(STORM_VALUE) != -1 
                && theName.indexOf(PRODUCT_VALUE) != -1) 
            { 
                setActiveLayer(map.layers[k]);
				map.layers[k].setVisibility(true);
				
            }
            if(theName.indexOf("Duration") != -1 )
            {
                map.layers[k].setVisibility(false);
            }
        }
    }
}

function showSLRHelper()
{
    window.open("http://data.prbo.org/cadc/tools/sealevelrise/compare/","_blank");
}

function unselectAllLayers()
{
    for (i = (map.layers.length - 1); i > 0; i--) 
    {
        //turn all layers off.
        if(map.layers[i].isBaseLayer == false) map.layers[i].setVisibility(false);
    }
    //unselect checkboxes and radio buttons
    clearUI();
	// set default layers here???  create  function resetDefaultLayers();
	//resetDefaultLayers();
     
}

function getElevation(response){
                elevation =  response.responseText;
};


function setInnerHTML(response){
    document.getElementById('zvalue').innerHTML = response.responseText;
};


function createPseudoCookie(name,newValue,days) {
    document.getElementById(name).value = newValue;
//alert(document.getElementById(name).value);

}

function readPseudoCookie(name) {
    // you can set the map defaults in the hidden form inputs.  If the get params are not set, use the form default.
    // use the default value id the get is not set
    if (getUrlParam(name) == null || getUrlParam(name) == '') {
        return document.getElementById(name).value;
    }
    // otherwise return the get.
    else {
        return getUrlParam(name);
    }
}

function erasePseudoCookie(name) {
    document.getElementById(name).value = null;
}

function getTreeConfig(grids)
{
    var i=0;
    // remove redundant baselayer choice in layer-picker
    //  var JSON = '[{nodeType: "gx_baselayercontainer"},';
    var JSON = '[';
    while (i<grids.length) 
    {   
        subCategory = grids[i].subcategory;
        if(i>0)
        {
            JSON = JSON+', ';
        }
        JSON = JSON+'{ nodeType:"async",expanded: false,';
        JSON = JSON+' text:"'+grids[i].subcategory +'",';
        JSON = JSON+'children: [';
        addComma = false;
        while ((i<grids.length) && (grids[i].subcategory == subCategory))
        {
            if(addComma){
                JSON = JSON+', '
            }
            JSON = JSON+'{nodeType:"gx_layer",';
            JSON = JSON+'uiProvider:"layernodeui",';
            JSON = JSON+'radioGroup:"mLayer",';
            JSON = JSON+'layer: "'+grids[i].spatialdatasetname+'"}';
            i++;
            addComma = true;
        }
        JSON = JSON+' ]}';

    }
    JSON = JSON+']';
    return JSON;
}

var homer = {
   switchExplanation: function(divName){
       $('div.expl').hide();
       $(divName).show();
   },
   help: function(turnOn){
       if (turnOn === true)
       {
           homer.helpPopup.show();
       }
       else
       {
           homer.helpPopup.hide();
       }
   },
   topics: function(turnOn){
       if (turnOn === true)
       {
           homer.topicPopup.show();
       }
       else
       {
           homer.topicPopup.hide();
       }
   },
   polygonType: function(turnOn){
       if (turnOn === true)
       {
           homer.polygonTypePopup.show();
       }
       else
       {
           homer.polygonTypePopup.hide();
       }
   },
   download: function(turnOn,url) {
       if (turnOn)
       {
           homer.downloadPopup.show();
           var now = new Date();
           var nowString = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
           $('div#downloadOnMapLink').html(
               nowString + 
              '<br />The dataset you requested is available for download by <a href="' + url + '" target="_blank">clicking on this link.</a>');
       }
       else
       {
           homer.downloadPopup.hide();
       }    
   },
   helpPopup: null,
   topicPopup: null,
   downloadPopup: null,
   polygonTypePopup: null,
   activeMapPanel: null,
   initializeMapControls: function() {
        // hidden until now to keep from weird flash/layout during load
        $('div#mapLoading').hide();
        $('div#topics').show();
        $('div#search').show();
        $('div#zvalue').show();
   },
   initializePopupWindows: function(mapPanel) {
       homer.activeMapPanel = mapPanel;
       homer.initializeHelp();
       homer.initializeTopic();
       homer.initializeDownload();
       homer.initializePolygonType();
   },
   initializeHelp: function() {
       var htmlHelp = '';
       htmlHelp += '<table><tr><td>';
       htmlHelp += '   <img src="http://data.prbo.org/apps/ocof/uploads/images/OCOF-logo.png" width="100px" />';
       htmlHelp += '</td><td>';
       htmlHelp += '   <h3>Interactive Map Help</h3>';
       htmlHelp += '</td></tr></table>';
       htmlHelp += '<br />';
	   htmlHelp += 'A <a href="http://youtu.be/hTgRks-GErs" target="_blank">short video tutorial</a> about using this tool is available on You Tube.';
       htmlHelp += '<br /><br />';
       htmlHelp += 'Enter an address or placename in the area at the top of the map and click the magnifying glass to zoom into a specific location.';
       htmlHelp += '<br /><br />';
       htmlHelp += 'Select the buttons on the left to choose a combination of:';
       htmlHelp += '<br />';
       htmlHelp += '<span class="indent">1) the Topic you are interested in</span><br />';
       htmlHelp += '<span class="indent">2) an amount of Sea Level Rise in centimeters</span><br />';
       htmlHelp += '<span class="indent">3) a Storm Scenario</span><br />';
       htmlHelp += '<br />';
       htmlHelp += 'Switch between different levels of Sea Level Rise and Storm Scenarios to see changes in ';
       htmlHelp += 'storm intensity and water levels.  Turn on Other Layers to see the effects relative to natural ';
       htmlHelp += 'and built features within your area of interest.';
       htmlHelp += '<br /><br />';
       htmlHelp += 'If you need help with choosing a Sea Level Rise amount, <a href="#" onclick="showSLRHelper();">click here</a> to ';
       htmlHelp += 'view a comparative look at current global and state projections.';
       htmlHelp += '<br /><br />';
       htmlHelp += 'The icons in the upper right part of the window provide the following functionality:';
       htmlHelp += '<table>';
       htmlHelp += '  <tr><td><img src="http://data.calcommons.org/images/pan_active.jpg?ver=130214.1"  style="vertical-align:middle"/></td>';
       htmlHelp += '    <td> Panning and zooming in the map with your mouse.</td></tr>';
       htmlHelp += '  <tr><td><img src="http://data.calcommons.org/images/draw_poly_active.jpg?ver=130214.1" style="vertical-align:middle"/></td>';
       htmlHelp += '   <td>  Create a report for an area of interest by clicking on the map to define the boundary, finish by double-clicking.';    
       htmlHelp += '            </td> </tr>';
       htmlHelp += '  <tr><td><img src="http://data.calcommons.org/images/load_kml_active.jpg?ver=130214.1"   style="vertical-align:middle"/></td>';
       htmlHelp += '   <td>  Create a report using your own GIS file to define your area of interest by uploading a KML, KMZ or zipped SHP file.';
       htmlHelp += '             </td></tr>';      
       htmlHelp += '  <tr><td><img src="http://data.calcommons.org/images/draw_box_active.jpg?ver=130214.1"   style="vertical-align:middle"/></td>';
       htmlHelp += '    <td> Draw opposite corners of a box with your mouse to download a dataset from within that area.</td></tr>';
       htmlHelp += '</table>';
       htmlHelp += '<br />';
       htmlHelp += 'The report will contain graphs of projected average flood depth and projected percent of area flooded for your area of interest for a range of sea level rise and storm scenarios';
       htmlHelp += '<br /><br />';       
       htmlHelp += 'Please <a href="mailto:cadc_webmaster@prbo.org?subject=OCOF Feedback">give us feedback</a> ';
       htmlHelp += 'if you have suggestions on how we can improve this application.';
       homer.helpPopup = new GeoExt.Popup({
                title: 'OCOF Interactive Map Help',
                anchored: false,
                width:500,
                height: 420,
                map: homer.activeMapPanel,
                html: htmlHelp,
                bodyCssClass: 'mapPopup',
                maximizable: true,
                draggable: true,
                collapsible: true,
                unpinnable: false,
                closeAction: 'hide'
        });       
   },
    initializeTopic: function() {
       var htmlTopic = '';
       htmlTopic += '<table><tr><td>';
       htmlTopic += '   <img src="http://data.prbo.org/apps/ocof/uploads/images/OCOF-logo.png" width="100px" />';
       htmlTopic += '</td><td>';
       htmlTopic += '   <h3>"Choose a Topic" Help</h3>';
       htmlTopic += '</td></tr></table>';
       htmlTopic += '<br />';
       htmlTopic += 'The Topics are: Flooding, Waves, Current, and Uncertainty';
       htmlTopic += '<br /><br />';
       htmlTopic += 'The "Flooding" topic will display layers for the average flooding extent, flood depth and low-lying (flood-prone) areas.   You can explore these layers for various combinations of sea level rise and storm scenarios.';
       htmlTopic += '<br /><br />';
       htmlTopic += 'The "Waves" topic will display layers for Wave height along shore and the magnitude and location of the maximum wave heights (and maximum wave run-up?).  You can explore these layers for various combinations of sea level rise and storm scenarios.';
       htmlTopic += '<br /><br />';

       htmlTopic += 'The "Current" topic will display layers for the velocity of the ocean waters near shore.  You can explore these layers for various combinations of sea level rise and storm scenarios.';
       htmlTopic += '<br /><br />';
       htmlTopic += 'The "Uncertainty" topic will display layers for the minimum inundation and maximum inundation expected for a particular scenario.  These layers represent the +/- 68 cm  variations in predicted flooding incurred from the modeling and the DEM base data set.';
       htmlTopic += '<br /><br />';
       htmlTopic += '<br /><br />';
       htmlTopic += 'If you need help with choosing a Sea Level Rise amount, <a href="#" onclick="showSLRHelper();">click here</a> to ';
       htmlTopic += 'view a comparative look at current global and state projections.';
       htmlTopic += '<br />';
       htmlTopic += 'Please <a href="mailto:cadc_webmaster@prbo.org?subject=OCOF Feedback">give us feedback</a> ';
       htmlTopic += 'if you have suggestions on how we can improve this application.';
       homer.topicPopup = new GeoExt.Popup({
                title: 'OCOF Interactive Map - Topic Help',
                anchored: false,
                width:500,
                height: 420,
                map: homer.activeMapPanel,
                html: htmlTopic,
                bodyCssClass: 'mapPopup',
                maximizable: true,
                draggable: true,
                collapsible: true,
                unpinnable: false,
                closeAction: 'hide'
        });       
   },  
   polygonLayer: null,
   pixel_geom: null,
   initializePolygonType: function() {
       var htmlGet = '';
       htmlGet += '<h2>Load a GIS file</h2>';
       htmlGet += '<p>You can select and upload a KML, KMZ or zipped SHP file with polygons and select one.';
       htmlGet += ' All uploaded files are expected to be in Latitude/Longitude WGS-84.</p>';
       htmlGet += '<hr />';
       htmlGet += '<input id="fileupload" type="file" name="fileupload" />';
       htmlGet += '<input type="button" onclick="homer.polygonType(false);" value="Close Window" />';
       htmlGet += '<div id="polygonFileSelection"></div>'
       homer.polygonTypePopup = new GeoExt.Popup({
                title: 'OCOF Report from GIS Polygon',
                anchored: false,
                width:500,
                height: 350,
                map: homer.activeMapPanel,
                html: htmlGet,
                bodyCssClass: 'mapPopup',
                maximizable: false,
                draggable: true,
                collapsible: false,
                unpinnable: false,
                closeAction: 'hide'
        });
        homer.polygonTypePopup.on("beforehide",homer.beforeHideHandler);
                
        var style_white = new OpenLayers.StyleMap(
        {
            pointRadius: 3,
            strokeColor: "#FFFFFF",
            strokeOpacity: 0.9,
            strokeWidth: 3,
            pointerEvents: "visiblePainted",
            fillOpacity: 0.1
        });   
        
        homer.polygonFromFileLayer = new OpenLayers.Layer.Vector("Polygon From File Layer", {
            styleMap: style_white,
            displayInLayerSwitcher: false
        });
        map.addLayer(homer.polygonFromFileLayer);
        
        // have to initialize it to make the file uploading work
        homer.polygonType(true);
        homer.polygonType(false);

   },
   beforeHideHandler: function(window) {
        homer.polygonFromFileLayer.removeAllFeatures();
        homer.polygonFromFileLayer.redraw();
        $('div#polygonFileSelection').html('&nbsp;');
   },
   initializePolygonTypeFileUploadHandler: function() {
        $('#fileupload').fileupload({
            dataType: 'json',
          //  url: 'http://data.calcommons.org/GetPolygonsFromGISFile.php',   
            url: 'http://localhost/prototype/GetPolygonsFromGISFile.php', 
            add: function (e, data) {
                $('div#polygonFileSelection').html('<h2>Uploading...</h2>');
                homer.polygonTypeUploadedList = {};  // clear out what any previous upload
                data.submit();
            },
            fail: function (e, data) {
                alert('Failed to upload file successfully.');
            },
            done: function (e, data) {
                homer.polygonTypeUploadedList = data.result;
                if (homer.polygonTypeUploadedList.polygonlist.length > 0)
                {
                    var htmlOpt = '<br /><h2>Areas in your GIS file ' + homer.polygonTypeUploadedList.gisfilename + '</h2>';
                    htmlOpt += '<table><tr><td>';
                    htmlOpt += '<select id="polygonSelect" onchange="homer.handlePolygonInList();">';
                    htmlOpt += '<option value="-1">Choose an area...</option>';
                    for (var i=0; i<homer.polygonTypeUploadedList.polygonlist.length; i++)
                    {
                        htmlOpt += '<option value="' + i + '">' + homer.polygonTypeUploadedList.polygonlist[i].polygonname + '</option>';
                    }
                    htmlOpt += '</select>'
                    htmlOpt += '</td><td><input type="button" onclick="homer.zoomToPolygonFromFileLayer()" value="zoom" />';
                    htmlOpt += '</td></tr></table>';
                    htmlOpt += '<br />';
                    htmlOpt += '<input type="button" onclick="homer.generateReportFromPolygonInList();" value="create report" />';
                    $('div#polygonFileSelection').html(htmlOpt);
                }
                else
                {
                    $('div#polygonFileSelection').html('<h2>Error</h2><p>' + homer.polygonTypeUploadedList.error + '</p>');
                }
            }
        }); 
   },
   polygonTypeUploadedList: {},
   polygonInListGeom: null,
   handlePolygonInList: function()
   {
        homer.polygonInListGeom = null;
        homer.polygonFromFileLayer.removeAllFeatures();
        var selectedId = $("select#polygonSelect option:selected").val();
        if (selectedId < 0) return;
        var wktForId = homer.polygonTypeUploadedList.polygonlist[selectedId].wkt;
        homer.polygonInListGeom = OpenLayers.Geometry.fromWKT(wktForId).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
        var featAttributes =  {name: homer.polygonTypeUploadedList.polygonlist[selectedId].polygonname};
       // var featStyling = {'strokeWidth': 5, 'strokeColor': '#ffffff'};
        var featForId = new OpenLayers.Feature.Vector(homer.polygonInListGeom, featAttributes);  //, featStyling);
        homer.polygonFromFileLayer.addFeatures([featForId]);
        homer.polygonFromFileLayer.visibility = true;
        
        if (! featForId.onScreen())
        {
            var dataExtent = homer.polygonFromFileLayer.getDataExtent();
            map.zoomToExtent(dataExtent);
        }
        homer.polygonFromFileLayer.redraw();
  
   },
   zoomToPolygonFromFileLayer: function()
   {
        var dataExtent = homer.polygonFromFileLayer.getDataExtent();
        map.zoomToExtent(dataExtent);
        homer.polygonFromFileLayer.redraw();
   },
   generateReportFromPolygonInList: function()
   {
        if (homer.polygonInListGeom == null) return;
        pixel_geom = [];
        
        for(var vert in homer.polygonInListGeom.getVertices())
        {
            var pxl = map.getPixelFromLonLat(
                new OpenLayers.LonLat(
                    homer.polygonInListGeom.getVertices()[vert].x,
                    homer.polygonInListGeom.getVertices()[vert].y));

            pixel_geom[vert] = {x:pxl.x, y:pxl.y};
        }

       PolygonDoneHandler(homer.polygonInListGeom, 'file');
   },

   initializeDownload: function() {  

        var htmlDownload = '';
        htmlDownload += '<div id="downloadOnMapLink"></div>';
        homer.downloadPopup = new GeoExt.Popup({
                title: 'OCOF Data Download',
                anchored: false,
                width:250,
                height: 120,
                map: homer.activeMapPanel,
                html: htmlDownload,
                bodyCssClass: 'mapPopup',
                maximizable: false,
                draggable: true,
                collapsible: true,
                unpinnable: false,
                closeAction: 'hide'
        });
   }
   
};


/* inline code */

if (navigator.cookieEnabled == 0) {
    alert("You need to enable cookies for this site to load properly!");
}
		
OpenLayers.ProxyHost = "/cgi-bin/proxy.cgi?url=";
			
Proj4js.defs["EPSG:1000"] = "+proj=utm +zone=30 +ellps=intl +towgs84=-131,-100.3,-163.4,-1.244,-0.020,-1.144,9.39 +units=m +no_defs";
Proj4js.defs["EPSG:3310"] = "+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +datum=NAD83 +units=m +no_defs";
Proj4js.defs["EPSG:26910"] = "+proj=utm +zone=10 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
Proj4js.defs["EPSG:4326"] = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

var projSrc = new OpenLayers.Projection("EPSG:900913");
var projData = new OpenLayers.Projection("EPSG:26910");
var projDisplay = new OpenLayers.Projection("EPSG:4326");

var maxOpacity = 1.0;
var minOpacity = 0.0;

var map, geocoder, wms;

Ext.BLANK_IMAGE_URL = "http://data.calcommons.org/ext-3.4.0/resources/images/default/s.gif";
var app, items = [], controls = [];
var elevation;
var grids;
var APILayers = new Array();
var treeConfig = "";
var category = 'ocof';
var ActiveLayer =''
var gridsurl = 'http://data.prbo.org/api/v1/grids/'+category+'/?type=json&method=get&callback=?';
//var gridsurl = 'http://localhost/api/v1/grids/'+category+'/?type=json&method=get&callback=?';
var legendRecord = {}; 
var gridsize = 0;
center = new OpenLayers.LonLat(-13662624.952468, 4561768.9520558);
/*
 *This is the call to the API to get the data layers. After the call back returns with the layer definitions 
 *the OpenLayers are created and added to the APILayers array 
 */
$.getJSON(gridsurl, function(data) 
{
    if (data.statuscode != "200")
    {
        alert("ERROR getting grids (" + data.statuscode + "): " + data.message);           
    }
    else
    {   
        gridsize = data.grids.length;
        for (i=0;i<data.grids.length;i++) 
        {
                                                        
            switch (data.grids[i].datatype)
            {                                
                case 'Tiles':
                    if(data.grids[i].isbaselayer=='true')
                    {
                        var OpenLayer = new OpenLayers.Layer.TMS(data.grids[i].spatialdatasetname, data.grids[i].uri, 
                        {
                            'type': data.grids[i].modeldatatype, 
                            'getURL': get_my_url, 
                            isBaseLayer:true, 
                            visibility: true,  
                            opacity: data.grids[i].opacity
                        }); 
                    }
                    else 
                    {
                        //create the array object to hold layerRec# and url for legend
                        legendRecord[i] = data.grids[i].legenduri;
                        OpenLayer = new OpenLayers.Layer.TMS(data.grids[i].spatialdatasetname, data.grids[i].uri,
                        
                        {
                                'type': data.grids[i].modeldatatype, 
                                'getURL': get_my_url, 
                                isBaseLayer:false, 
                                visibility: false,              
                                opacity: data.grids[i].opacity
                            });
                    }
                    APILayers = APILayers.concat(OpenLayer); 
                    break;
                                     
                default:
                    OpenLayer = new OpenLayers.Layer.WMS(data.grids[i].spatialdatasetname, data.grids[i].uri,
                    {
                        LAYERS: data.grids[i].layers,
                        CQL_FILTER: data.grids[i].filter,
                        STYLES: data.grids[i].styles,
                        transparent: true,
                        format: data.grids[i].format
                    },
                    {
                        singleTile: true, 
                        ratio: 1,
                        isBaseLayer: false, 
                        visibility:  false,
                        opacity: data.grids[i].opacity
                                       
                    } ); 
                    APILayers = APILayers.concat(OpenLayer);
                    break;
            } 
        }
    }
    
    var polygonTypeButton = new OpenLayers.Control.Button({
        trigger: function() { homer.polygonType(true);},
        displayClass: 'polygonfromfile',
        title: "Create a report for an area of interest. \nDefine your area by loading a GIS file."
    });
    
// define toolbar controls 
//individual controls defined in query_widget.js
 var panelControls = [
   // boxControl,
    pointControl,
   // lineControl,
    polygonTypeButton,
    polygonControl,
    navControl
    ];
    var toolbar = new OpenLayers.Control.Panel({
        displayClass: 'olControlEditingToolbar',
        defaultControl: navControl
       // activateControl:navResetControl
        
    });
    toolbar.addControls(panelControls);

    var save = new OpenLayers.Control.Button({
        title: "Save Changes",
        trigger: function() {
            if(edit.feature) {
                edit.selectControl.unselectAll();
            }
        },
        displayClass: "olControlSaveFeatures"
    });


    OpenLayers.Control.Hover = OpenLayers.Class(OpenLayers.Control, {                
        defaultHandlerOptions: {
            'delay': 10,
            'pixelTolerance': 8,
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
                {
                    'pause': this.onPause, 
                    'move': this.onMove
                },
                this.handlerOptions
                );
        }, 

        onPause: function(evt) {
            var lonlat = map.getLonLatFromPixel(new OpenLayers.Pixel(evt.xy.x,evt.xy.y));
            lonlat.transform(projSrc,projDisplay);   
            layername =  ActiveLayer;     //       readPseudoCookie('activelayer'); 
               
            // n.b: watch your namespaces here.  Any cookie will override any GET or POST with the same name.  $_COOKIE[raster] > $_POST[raster] for example.
            var params = {
                lat: lonlat.lat,
                lon: lonlat.lon,
                activelayer:  layername //  layername readPseudoCookie('activelayer')
            };

            OpenLayers.loadURL("http://data.calcommons.org/ocofmap/gridinfo.php", params, this, setInnerHTML, setInnerHTML);
        },
        
        CLASS_NAME: "OpenLayers.Control.Hover"

    });

    var options = {
        controls: [
        new OpenLayers.Control.Navigation(),
        new OpenLayers.Control.PanZoomBar(),
        new OpenLayers.Control.ScaleLine(),
        new OpenLayers.Control.Hover({
            autoActivate: true
        }),
        //new OpenLayers.Control.MousePosition(),
        //new OpenLayers.Control.MousePosition({prefix: '<a target="_blank" ' +'href="http://spatialreference.org/ref/epsg/4326/">' +'EPSG:4326</a> coordinates: ', separator: ' | ', numDigits: 2, emptyString: 'Mouse is not over map.' }),
        new OpenLayers.Control.KeyboardDefaults()
        ],
        projection: projSrc,
        displayProjection: projDisplay,
        units: "m",
        numZoomLevels: 19,
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(-20037508.3427892,-20037508.3427892,20037508.3427892,20037508.3427892)
    // I'm turning off the restricted extent because it makes stupid things happen with the geocoding.  i.e. any searches for locations in SoCal fail ugly.
    //,restrictedExtent: new OpenLayers.Bounds(-13927593.910905, 4264691.6644281, -13192575.447046, 4898201.7547421)
    };
    // create the basic map
    map = new OpenLayers.Map(options);
   

    map.addControl(toolbar);	
			
    // create our own layer node UI class, using the TreeNodeUIEventMixin
    var LayerNodeUI = Ext.extend(GeoExt.tree.LayerNodeUI, new GeoExt.tree.TreeNodeUIEventMixin());
    //LayerNodeUI  
    // using OpenLayers.Format.JSON to create a nice formatted string of the
    // configuration for editing it in the UI
    treeConfig = Ext.decode(getTreeConfig(data.grids)); 
      
    var legendPanel = new GeoExt.LegendPanel({
        defaults: {
            labelCls: 'mylabel',
            style: 'padding:5px'
        },
        bodyStyle: 'padding:5px',
        width: 200,
        autoScroll: true,
        collapsible: true,
        collapsed: false,
        collapseMode: "header",
        padding: 5,
        region: 'east'
    }); 
    
    var mapPanel = new GeoExt.MapPanel({
        region: 'center',
        contentEl: "mapPanel",
        map: map,
        center: [-13662624.952468, 4561768.9520558],
        zoom: 10,
        prettyStateKeys: true,
        layers: APILayers
    });

// this WAS called "panel" -- at bottom
    var descPanel = new Ext.Panel({         
        region: "south",
        contentEl: "desc",
        autoScroll: true,
        collapsible: true,
        collapsed: true,
        collapseMode: "header",
        height: 200,
        padding: 5      
    }) ;
  
  // was "homerPanel" -- topic simple interface on left
    var topicsPanel = new Ext.Panel({         
        id: "topicsPanel",
        contentEl:"topics",
        autoScroll: true,
        resizable: true,
        resizeHandles: 'all',
        buttons: [
         { text: 'Detail View',
            handler: function(){
                detailsPanel.expand(true);
                layerPanel.setWidth(350);
                app.doLayout();
            } 
         },
         {  iconCls: 'panelCloseButton',
            width: 16,
            height: 16,
            handler: function(){
                // Ext.getCmp('layersPanel').collapse(false);
                layerPanel.collapse(false);
            } 
         }
        ]
    }) ;
  
    // was "tree" -- detailed interface on left
    var detailsPanel = new Ext.tree.TreePanel({
        id: "detailsPanel",
        contentEl:"details",
        split: true,
        autoScroll: true,
                resizable: true,
        resizeHandles: 'all',
        plugins: [
        new GeoExt.plugins.TreeNodeRadioButton({
            listeners: {
                "radiochange": function(node) {
                    setActiveLayer(node.layer)
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
            // n.b: this listener doesn't seem to be firing.  Use the one in plugins.
            "radiochange": function(node){
            //alert(node.layer.name + " is now the the active layer, yo.");
            }
        },
        rootVisible: false,
        lines: false,
        buttons: [
         { text: 'Topic View',
            handler: function(){
                unselectAllLayers();
                topicsPanel.expand(true);
			//	makeLayersVisible();
			    resetDefaultLayers();
                layerPanel.setWidth(250);
                app.doLayout();
            } 
         },
         {  iconCls: 'panelCloseButton',
            width: 16,
            height: 16,
            handler: function(){
                layerPanel.collapse(false);
            } 
         }
        ]

    }); 
    
    // left panel - map layers        
    var layerPanel = new Ext.Panel({  
        id: "layersPanel",
        region: "west",
        contentEl: "layers",
        collapsible: true,
        collapsed: false,
        collapseMode: "header",
        resizable: true,
        resizeHandles: 'all',
        frame: false,
        width : 250,
//        autoWidth: true,
        padding: 5,
        layout: {
            type: 'accordion',
            align: 'left'
        },
        items: [topicsPanel, detailsPanel]
    }) ;
       
    
    //use array, legendRecord here
    for (var i=0; i<gridsize; i++) {
        if(legendRecord[i] !== undefined)
        {
            mapPanel.layers.getAt(i).set("legendURL", legendRecord[i]);
                     
        }

    }

//        items: [items, layerPanel, legendPanel, mapPanel, descPanel]  


    
    
    // load mapPanel first so other panels will be ontop
   app = new Ext.Viewport({
        title: "Try GeoExt LegendPanel Demo",
        layout: "border",
        items: [mapPanel, layerPanel, legendPanel]
    });
    homer.initializeMapControls();
    

/*
 * This needs to be at the bottom to ensure that the 'items' element has been created and 
 * populated with all of the controls before this code executes.  Otherwise you get an 
 * empty map and the error 'Border Layout Center Panel Not Defined' or something like that -TF
 */ 
    Ext.onReady(function() 
    {    
        updateLayerVisibility();
        homer.initializePopupWindows(mapPanel);
        homer.initializePolygonTypeFileUploadHandler();
    });
	
});
