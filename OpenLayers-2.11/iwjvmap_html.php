<!DOCTYPE html>
<html>
    <head>
        <title>Our Coast Our Future: CoSMoS Model Results</title>
        <!-- Import OL CSS, auto import does not work with our minified OL.js build -->
        <!--   <link rel="stylesheet" type="text/css" href="http://data.calcommons.org:8080/geoserver/openlayers/theme/default/style.css"/> -->
        <!-- Basic CSS definitions -->
        <!-- prbo map styles -->
      


        <!-- Import OpenLayers, reduced, wms read only version -->
        <script type="text/javascript" src="http://data.calcommons.org/ext-3.4.0/adapter/ext/ext-base.js"></script>
        <script type="text/javascript" src="http://data.calcommons.org/ext-3.4.0/ext-all.js"></script>
       
        <link rel="stylesheet" type="text/css" href="http://data.calcommons.org/ext-3.4.0/resources/css/ext-all.css" />
        <link rel="stylesheet" type="text/css" href="http://data.calcommons.org/ext-3.4.0/examples/shared/examples.css" />
        <link rel="stylesheet" type="text/css" href="http://data.calcommons.org/GeoExt/resources/css/geoext-all.css"/>
        <link rel="stylesheet" type="text/css" href="http://data.calcommons.org/GeoExt/resources/css/geoext-all-debug.css"/>

        <script src="http://maps.google.com/maps?file=api&amp;v=3&amp;key=AIzaSyDs6QcNHclTKt5HZNacqC6Cfn2f7JGIXjo" type="text/javascript"></script>
        <script src="OpenLayers-2.11/OpenLayers.js"></script>
        <script src="http://data.calcommons.org/GeoExt/lib/GeoExt.js" type="text/javascript"></script>
        <script type="text/javascript" src="proj4js-compressed.js"></script>
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" type="text/javascript"></script>
        <!--            script and styling for ajax message about report generation   -->
        <link rel="stylesheet" href="jnotify.css" type="text/css" />
        <script type="text/javascript" src="jnotify-min.js"></script>
          <link rel="stylesheet" type="text/css" href="iwjvmap.css"/>
        <script type="text/javascript" src="map.js"></script>
        <script type="text/javascript" src="iwjvmap.js"></script>
        <script type="text/javascript" src="query_widget.js"></script> 
    </head>
    <body >

        <div id="homer">
            <form name = "homer_form">
                <fieldset id="sea_level_rise">
                    <legend>Sea Level Rise in Centimeters(cm)</legend>
                    <input  type="button" name="slrval" id="slrval" value = "Reset" onClick="makeLayersVisible(value);"/>
                    <input  type="button" name="slrval" id="slrval" value = "Current" onClick="makeLayersVisible(value);"/>
                    <input  type="button" name="slrval" id="slrval" value = "50" onClick="makeLayersVisible(value);"/>
                    <input  type="button" name="slrval" id="slrval" value = "100" onClick="makeLayersVisible(value);"/>
                    <input  type="button" name="slrval" id="slrval" value = "150" onClick="makeLayersVisible(value);"/>
                    <input  type="button" name="slrval" id="slrval" value = "200" onClick="makeLayersVisible(value);"/>
                    <input  type="button" name="slrval" id="slrval" value = "500" onClick="makeLayersVisible(value);"/>
                    <div id="SLR"></div>
                </fieldset>                
                <fieldset id="vulnerability">
                    <legend>Vulnerability Model</legend>
                    <input type="radio" CHECKED  name="productval" id="productval" value = "Flood" onClick="makeLayersVisible();"/>Flood Hazard
                    <input type="radio" name="productval" id="productval" value = "Wave Height" onClick="makeLayersVisible();"/>Wave Height
                    <input type="radio" name="productval" id="productval" value = "Current" onClick="makeLayersVisible();"/>Current Velocity
                    <input type="radio" name="productval" id="productval" value = "Confidence" onClick="makeLayersVisible();"/>Flooding Confidence Intervals
                </fieldset>
                <fieldset id="scenarios">
                    <legend>Storm Scenarios</legend>
                    <input type="radio" CHECKED  name="stormval" id="stormval" value = "000" onClick="makeLayersVisible();"/>No Storm
                    <input type="radio" name="stormval" id="stormval" value = "001" onClick="makeLayersVisible();"/>Annual Storm
                    <input type="radio" name="stormval" id="stormval" value = "010" onClick="makeLayersVisible();"/>10-year Storm
                    <input type="radio" name="stormval" id="stormval" value = "020" onClick="makeLayersVisible();"/>20-year Storm
                    <input type="radio" name="stormval" id="stormval" value = "100" onClick="makeLayersVisible();"/>100-year Storm
                </fieldset>
            </form>
                            <a href="#" id="permalink">Permalink</a>
        </div>
       
        <div id="desc">
            The checkboxes control layer <i>visibility</i>.  The radio buttons set the <i>active</i> layer.  After you select an active layer, the slider can be used to change 
            its opacity.
 
            <div id="downloads">Your data download will be here</div>
            Opacity: 
            <div id="slider"></div>
            <div id="zvalue">&nbsp;</div>
            <div id="search">
                <form action="#" onsubmit="fetchGeocodes(); return false;">
                    <strong>Enter an address or placename in California, and press "Enter" to search:</strong>
                    <br />
                    <input type="text" id="q-adress" name="q" value="" size="40" onClick="document.getElementById('q-adress').value=''"/>
                    <input type="submit" name="find" value="Search" />
                     <button id="recenter" type="button" onClick="recenterMap();" >Recenter Map</button> 
                </form>
            </div>
        </div>
        
      <!-- <img id="watermark" src="images/ocof-transparent.png" alt="watermark" />	-->

        <form id="hiddenElements">
            <input type="hidden" id="activelayer"/>
        </form>

    </body>


</html>