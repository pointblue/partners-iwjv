<!DOCTYPE html>
<html>
    <head>
        <title>Inter-Mountain West Joint Venture</title>   
        <?php //__BASEHOST defines the host to use for this instance?>
        <script type="text/javascript">var __BASEHOST = "localhost";</script>
        <?php if($_SERVER["HTTP_HOST"] !== "localhost") : ?>
            <script type="text/javascript">__BASEHOST = "data.prbo.org";</script>
        <?php endif;?>
            
        <!--  all of these links and scripts can go in the core  -->		
        <script type="text/javascript" src="inc/js/ext-3.4.0/adapter/ext/ext-base.js"></script>
        <script type="text/javascript" src="inc/js/ext-3.4.0/ext-all.js"></script>
        <script src="http://maps.google.com/maps?file=api&amp;v=3&amp;key=AIzaSyDs6QcNHclTKt5HZNacqC6Cfn2f7JGIXjo" type="text/javascript"></script>
        <script src="OpenLayers-2.11/OpenLayers.js"></script>
        <script src="inc/js/GeoExt/lib/GeoExt.js" type="text/javascript"></script>
        <script type="text/javascript" src="proj4js-compressed.js"></script>
        <link type="text/css" rel="stylesheet" href="inc/css/iwjvmap.css">
        <script type="text/javascript" src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
        <script type="text/javascript" src="inc/js/imjvmap.js"></script>
        <script type="text/javascript" src="inc/js/mapInit.js"></script>
    </head>    
    <body  onload="load();">
        <div id="iwjvContainer">         
          <div id="siteTitleContainer">
             <!-- <h1>Inter-Mountain West Joint Venture Mapping Tool</h1>-->
             <a href="http://iwjv.org/" target="_blank"><img src="./uploads/img/IWJV_logo.png" /></a>
          </div>
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
                               <!--<div id="birdImg"></div>-->
                          </div>
                          <div id="mapInstructionContainer">
                              <h2>Mapping Tool Use</h2>
                              <p>
                                Place a map marker <img src="./uploads/img/add_point_on.png" style="vertical-align:middle"/> to generate reports 
                                for the selected State / Bird Conservation Region (BCR) including habitat composition, populations of bird species, 
                                and goals for their future populations.
                              </p>
                              <p>
                                Click a bird species <img src="./uploads/img/birdButton.png" style=" width:100px; vertical-align:middle"/> for
                                information about population estimates, goals, habitat preferences, and range.
                              </p>
                              <p>
                                  The population worksheet estimates the effects of various habitat conservation efforts on regional bird populations.
                              </p>
                              <p>
                                This mapping tool was developed to help resource and land managers develop and implement habitat 
                                conservation projects that are both strategic and effective. It allows planners to explore the 
                                impact that various restoration and management plans have on bird populations.
                              </p>
                              <p>
                                This mapping tool was developed as a collaborative effort between IWJV, ABC, and PRBO Conservation Science.
                              </p>
                          </div>
                      </div>
                      <div id="stategonTableContainer">    
                         <div id="stategoninfotable" ></div> 
                      </div>
                    <div id="speciesTableContainer"></div>
                    <div id="worksheetContainer"></div>
            </div>
            <div id="footer"><a href="http://www.prbo.org/" target="_blank" ><img src="./uploads/img/logo_prbo.jpg" /></a> powered by PRBO</div>
            <!-- <img src="./uploads/img/powered_by_PRBO.gif" />-->
        </div>	
    </body>
</html>
