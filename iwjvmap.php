<!DOCTYPE html>
<html>
<head>
    <title>Inter-Mountain West Joint Venture</title>
    <?php
    //
    // VERSIONING AND HOST LOCATION
    //
    // __BASEHOST defines the host to use for this instance (JavaScript)
    // $isRunningInProduction is true if the current host is not local (PHP)
    // $siteVersion is used on remote hosts, appended to some javascript files to force refresh
    //
    require('config.php');
    $siteVersion = "";
    $isRunningInProduction = ($_SERVER["HTTP_HOST"] === SITE_HOST);

    ?>
    <script type="text/javascript">
        //Export variables defined in config.php to Javascript
        <?php foreach($globalsExportToJavascript as $key => $exportValue): ?>
        var <?php echo $key; ?> = "<?php echo $exportValue; ?>"; <?php echo "\r\n"; ?>
        <?php endforeach; ?>
        //OTHER GLOBAL VARIABLES
        var ACTIVE_HOST = "localhost";      //The active value being used in places where SITE_HOST would normally be used. This allows us to dynamically change it when working locally.
        var GEO_FULL_URL = GEO_PROTOCOL + '://' + GEO_HOST;                 //Geoserver full url
        var API_FULL_URL = API_PROTOCOL + "://" + API_HOST + API_ROUTE;     //data.prbo.org api v1 full url
        var API_HABPOP_STATEGONS_URL = API_FULL_URL + API_ROUTE_HABPOP + API_ROUTE_HABPOP_STATEGONS;    //habpop stategons api full url
        var API_HABPOP_ESTIMATES_URL = API_FULL_URL + API_ROUTE_HABPOP + API_ROUTE_HABPOP_ESTIMATES;    //habpop estimates api full url
    </script>
    <?php
    if( $isRunningInProduction ) :
        $siteVersion = "?" . (string)(time());
        ?>
        <script type="text/javascript">__BASEHOST = "<?php echo SITE_HOST; ?>";</script>
    <?php
    endif;
    ?>
    <link type="text/css" rel="stylesheet" href="inc/css/iwjvmap.css<?php echo $siteVersion ?>">
    <script type="text/javascript">

        var _gaq = _gaq || [];
        _gaq.push(['_setAccount', 'UA-40690497-30']);
        _gaq.push(['_trackPageview']);

        (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        })();

    </script>
    <script type="text/javascript" src="inc/js/ext-3.4.0/adapter/ext/ext-base.js"></script>
    <script type="text/javascript" src="inc/js/ext-3.4.0/ext-all.js"></script>
    <script type="text/javascript" src="http://maps.google.com/maps?file=api&amp;v=3&amp;key=AIzaSyDs6QcNHclTKt5HZNacqC6Cfn2f7JGIXjo"></script>
    <script type="text/javascript" src="OpenLayers-2.11/OpenLayers.js"></script>
    <script type="text/javascript" src="inc/js/GeoExt/lib/GeoExt.js" ></script>
    <script type="text/javascript" src="proj4js-compressed.js"></script>
    <script type="text/javascript" src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="inc/js/imjvmap.js<?php echo $siteVersion ?>"></script>
    <script type="text/javascript" src="inc/js/mapInit.js<?php echo $siteVersion ?>"></script>
</head>
<body onload="load();">
<div id="iwjvContainer">
    <div id="siteTitleContainer">
        <h1>Inter-Mountain West Joint Venture Mapping Tool</h1>
        <a href="http://iwjv.org/" target="_blank"><img src="./uploads/img/IWJV_logo.png" /></a>
    </div>
    <div id="subtitle"><h2>Habitats and Populations Strategies (HABPOPS) Database</h2></div>
    <div id="iwjvBodyContainer">
        <div id="gxmap"></div>
        <div id="panel" class="olControlEditingToolbar"></div>
        <div id="mapSidebarRightContainer">
            <div id="buttonContainer">
                <button type="button" id="instr_button"  class="defaultButton" value="instr" onclick="showInstructionInfo();">Instructions</button>
                <button type="button" class="defaultButton" value="sasp" onclick="birdInfoClick('sasp');">Sage Sparrow</button>
                <button type="button" class="defaultButton" value="sath" onclick="birdInfoClick('sath');">Sage Thrasher</button>
                <button type="button" class="defaultButton" value="brsp" onclick="birdInfoClick('brsp');">Brewer's Sparrow</button>
                <button type="button" class="defaultButton" value="lbcu" onclick="birdInfoClick('lbcu');">Long-billed Curlew</button>
                <button type="button" class="defaultButton" value="grsp" onclick="birdInfoClick('grsp');">Grasshopper Sparrow</button>
            </div>
            <div id="birdInfoContainer">
                <div id="birdImgInfo"></div>
                <div id="photoCredit"></div>
            </div>
            <div id="mapInstructionContainer">
                <h2>Mapping Tool Use</h2>
                <p>
                    Click in the map and place a marker <img src="icons/marker.png" style="vertical-align:middle"/> to generate report
                    for the selected State / Bird Conservation Region (BCR) including habitat composition, populations of bird species,
                    and goals for their future populations.
                </p>
                <p>
                    Click a bird species <img src="uploads/img/birdButton.png" style=" width:140px; vertical-align:middle"/> button for
                    information about the species' habitat preferences.
                </p>
                <p>
                    The population worksheet estimates the effects of various habitat conservation efforts on regional bird populations.
                </p>
                <p>
                    This mapping tool was developed to help resource and land managers develop and implement habitat
                    conservation projects that are both strategic and effective. It allows planners to explore the
                    impact that various restoration and management plans have on bird populations for BCR's 9, 10 and 16 within the Inter-Mountain West Joint Venture (IWJV) region.
                </p>
                <p>
                    This mapping tool was developed as a collaborative effort between IWJV, ABC, and Point Blue Conservation Science.
                </p>
            </div>
        </div>
        <div id="stategonTableContainer">
            <!-- The content for the #stategoninfotable is rendered in /api/v1/routes/Habpop.php -->
            <div id="stategoninfotable" ></div>
        </div>
        <div id="speciesTableContainer"></div>
        <div id="worksheetContainer"></div>
    </div>
    <div class="footer">
        <div id="prbo"><a href="http://www.pointblue.org/" target="_blank" ><img src="images/PB_logo_notag_sm90.jpg"></a> powered by Point Blue Data Solutions</div>
        <div id="abc"><a href="http://www.abcbirds.org/" target="_blank" ><img src="./uploads/img/ABC_logo.jpg" /></a></div>
    </div>
</div>
</body>
</html>