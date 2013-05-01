//-------------
//
//DEBUG
//
var __FORCEDEBUG = false;   //true to force debug on live/remote/production server

var __DEBUG = false;    //do not set this variable. shows debug variables
//automatic debug mode on localhost or on force debug
if(__BASEHOST === "localhost" || __FORCEDEBUG !== false){
    __DEBUG = true;
}
if(__DEBUG){
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function () { };
    if (!window.console.error) window.console.error = function () { };
}
//
//-------------




//-------------
//
//Main app variables
//
var appModel = new ImjvModel(); //Model loads data

var appView = new ImjvView();   //View controls data display

var appController = new ImjvController();   //Controller responds to events

initApp();  //initialize the app

//Initializes main app variables
function initApp(){
    
    //init app tells which handlers are responsible for which events
    
    appModel.setBaseHost(__BASEHOST);
    
    //listen for when the stategon is finished loading
    appModel.addListener("load", appView.handleStategonLoad);
    appModel.addListener("change", appView.handleEstimateRefresh);
    
    //listen for worksheet changed
    appController.addListener("worksheetChange", appModel.refreshEstimate);
    
    //list for worksheet loaded in view
    appView.addListener("worksheetLoaded", appController.bindWorksheet);
    
}

function ImjvView(){
    
    var that = this;
    
    var _isSpeciesInRegion = null;
    
    var caller = [];
    caller["worksheetLoaded"] = $.Callbacks();
    
    
    this.addListener = function(subject, listener){
        if(typeof caller[subject] !== "undefined"){
            caller[subject].add(listener);
        }
    };
    
    //allows returned stategon to be checked for errors before populating view
        this.handleStategonLoad = function(data){
        var errorMessageText = "No data found for the selected area. Please try a different area.";
        
        that._isSpeciesInRegion = isSpeciesInRegion(data.stategon.species);
        that.populateStategon(data);
        that.populateSpeciesTable(data);
        that.populateWorksheet(data);
        
        if(data.stategon.code === "" || ! that._isSpeciesInRegion){
            alert(errorMessageText);    //report error to user
        }
    };
    
    this.populateStategon = function(data){
        if(data.stategon.code !== ""){
            $("#stategoninfotable").html(data.stategon.habitats.formated);
        } else $("#stategoninfotable").html("");    //if no stategon, reset the info inside
        
    };
    //populate the before after section
    this.handleEstimateRefresh = function(data){
        for(var conditionTime in data.estimate[0]){
            populateSpeciesTableEstimate(conditionTime, data);
        }
        //enable the worksheet buttons
        $("#worksheetContainer button").removeAttr('disabled', 'disabled');
    };
    
    this.handleEstimateRefreshInitialization = function(){
        //animate before and after columns
    };
    
    function populateSpeciesTableEstimate(conditionTime, data){
        for(var key in data.estimate[0][conditionTime]){
            if($("#speciesTable tr." + key).length > 0){
                $("#speciesTable tr." + key + " td." + conditionTime).text(data.estimate[0][conditionTime][key]);
            }
        }
    }
    
    //---------------------------------------------
    //
    // WORKSHEET DISPLAY
    //
    //
    this.populateWorksheet = function(data){
        
        var containerId = "worksheetContainer";
        
        //set container element to blank and return if no stategon code
        if(data.stategon.code === "" || ! that._isSpeciesInRegion) {
            $("#" + containerId).html("");
            return false;
        }
        
        var habitats = data.stategon.habitats.data;
        
        var worksheetTable = $("<table></table>");
        worksheetTable.attr('id', 'worksheetTable');
        worksheetTable.attr('cellspacing', 0);
        
        //First heading row
        var headingRow1 = $("<tr></tr>");
        headingRow1.attr('class', 'worksheetHeadingRow');
        var hr1Td1 = $("<td></td>");
        hr1Td1.attr('rowspan', '2');
        hr1Td1.text('Habitat');
        headingRow1.append(hr1Td1);
        var hr1Td2 = $("<td></td>");
        hr1Td2.attr('class', 'conditionHeading');
        hr1Td2.addClass('before');
        hr1Td2.attr('colspan', '3');
        hr1Td2.html('Condition Before');
        hr1Td2.append($('<br>'));
        hr1Td2.append('<span>(Acres)</span>');
        headingRow1.append(hr1Td2);
        var hr1Td3 = $("<td></td>");
        hr1Td3.attr('class', 'conditionHeading');
        hr1Td3.addClass('after');
        hr1Td3.attr('colspan', '3');
        hr1Td3.html('Condition After');
        hr1Td3.append($('<br>'));
        hr1Td3.append('<span>(Acres)</span>');
        headingRow1.append(hr1Td3);
        worksheetTable.append(headingRow1);
        
        //Second heading row
        var headingRow2ColumnNames = ["Poor", "Fair", "Good", "Poor", "Fair", "Good"];
        var headingRow2 = $("<tr></tr>");
        headingRow2.attr('class', 'worksheetHeadingRow');
        for(var i=0;i<headingRow2ColumnNames.length;i++){
            var singleColumn = $("<td></td>");
            if(i>2) singleColumn.attr('class', 'after');
            else singleColumn.attr('class', 'before');
            if(i===0||i===3)singleColumn.addClass('first');
            singleColumn.text(headingRow2ColumnNames[i]);
            headingRow2.append(singleColumn);
        }
        worksheetTable.append(headingRow2);
        
        var conditions = ["poor", "fair", "good"];
        var conditionTimes = ["before", "after"];
        for(var i=0;i<habitats.length;i++){
            var singleHabitat = $("<tr></tr>");
            singleHabitat.attr('class', 'worksheetHabitatRow');
            if(i%2===0)singleHabitat.addClass('referenceRow');
            
            //
            //habitat name
            //
            var habitatNameContainer = $("<td></td>");
            habitatNameContainer.attr('class', 'worksheetHabitatName');
            //habitat link
            var linkRoot = 'http://data.prbo.org/partners/iwjv/uploads/habitat/';
            var habitatNameLink = $("<a></a>");
            habitatNameLink.attr('title', 'Habitat Description');
            habitatNameLink.attr('href', linkRoot + habitats[i]['LINK']);
            habitatNameLink.attr('target', '_BLANK');
            habitatNameLink.text(habitats[i]['ASSOCIATION']);
            habitatNameContainer.append(habitatNameLink);
            singleHabitat.append(habitatNameContainer);
            
            for(var j=0;j<conditionTimes.length;j++){
                for(var k=0;k<conditions.length;k++){
                    var singleHabitatCondition = $("<td></td>");
                    singleHabitatCondition.attr('class', conditionTimes[j]);
                    singleHabitatCondition.addClass(conditions[k]);
                    var singleMastercode = "MCC-" + habitats[i]['MASTERCODE'] + "-" + (k+1).toString();
                    singleHabitatCondition.addClass(singleMastercode);
                    if(k===0||k===3) singleHabitatCondition.addClass('first');
                    var conditionInput = $("<input/>");
                    conditionInput.attr('type', 'text');
                    
                    singleHabitatCondition.append(conditionInput);
                    singleHabitat.append(singleHabitatCondition);
                }
                
            }
            
            worksheetTable.append(singleHabitat);
            
        }
        
        var submitButton = $("<button></button>");
        submitButton.attr('class', 'defaultButton');
        submitButton.attr('type', 'button');
        submitButton.text("Calculate");
        
        var submitButtonContainer = $("<span></span>");
        submitButtonContainer.attr('class', 'worksheetButtonContainer');
        submitButtonContainer.addClass('psuedo-div');
        submitButtonContainer.append(submitButton);
        
        var worksheetHeading = $("<h2></h2>");
        worksheetHeading.text("Population Worksheet");
        
        var worksheetInstructions = $("<p></p>");
        var instructions = "Enter acres for each habitat you have (before) and will restore (after), then click 'calculate'.<br>";
        instructions    += "Estimates appear in before / after columns of Species Population table above.";
        worksheetInstructions.html(instructions);
        
        var worksheetContent = $("<div></div>");
        worksheetContent.attr('id','worksheetContent');
        
        //add to content container
        $(worksheetContent).html(submitButtonContainer);
        $(worksheetContent).append(worksheetTable);
        $(worksheetContent).append(submitButtonContainer.clone());
        
        //add to main container already on page
        $("#" + containerId).html(worksheetHeading);
        $("#" + containerId).append(worksheetInstructions);
        $("#" + containerId).append(worksheetContent);
        
        
        //call that worksheet has finished loading
        caller["worksheetLoaded"].fire();
        
    };
    
    //---------------------------------------------------------------
    //
    // SPECIES TABLE
    //
    //
    this.populateSpeciesTable = function(data){
        
        var containerId = "speciesTableContainer";
        
        //set container element to blank and return if no stategon code or no species in region
        if(data.stategon.code === "" || ! that._isSpeciesInRegion ) {
            $("#" + containerId).html("");
            return false;
        }
        
        
        var columnDisplayNames = ["Species Name","Occupied Acres", "Population Estimate", "Population Objective", "Objective Increase", "Before", "After"];
        var columnNames = ["SpeciesName", "OccupiedAcres", "PopEstimate", "PopObjective", "ObjectiveIncrease"];
        
        var speciesTable = $("<table></table>");
        speciesTable.attr('id', 'speciesTable');
        speciesTable.attr('cellspacing', '0');
        
        //make the heading
        var headingRow = $("<tr></tr>");
        headingRow.attr('class', 'speciesTableHeadingRow');
        for(var i=0;i<columnDisplayNames.length;i++){
            var cn = columnDisplayNames[i];
            var singleHeading = $("<td></td>");
            singleHeading.text(cn);
            headingRow.append(singleHeading);
        }
        speciesTable.append(headingRow);
        
        //add the main data
        var tableData = data.stategon.speciestable;
        for(var i=0;i<tableData.length;i++){
            var singleDataRow = $("<tr></tr>");
            singleDataRow.attr('class', 'speciesTableRow');
            singleDataRow.addClass(tableData[i]["SPECIES"]);
            var speciesMCC = (tableData[i]["MCC"]).replace(/\./g, "-");
            singleDataRow.addClass(speciesMCC);
            for(var j=0;j<columnNames.length;j++){
                var currentSpecies = tableData[i];
                var currentColumnName = columnNames[j];
                var singleDataColumn = $("<td></td>");
                singleDataColumn.attr('class', columnNames[j]);
                if(j>0) singleDataColumn.addClass('numericContainer');
                singleDataColumn.text(currentSpecies[ currentColumnName ]);
                singleDataRow.append(singleDataColumn);
            }
            var beforeColumn = $("<td></td>");
            beforeColumn.attr('class', 'before');
            beforeColumn.addClass('numericContainer');
            var afterColumn = $("<td></td>");
            afterColumn.attr('class', 'after');
            afterColumn.addClass('numericContainer');
            singleDataRow.append(beforeColumn).append(afterColumn);
            
            speciesTable.append(singleDataRow);
            
        }
        
        var speciesTableHeading = $("<h2></h2>");
        speciesTableHeading.text("Species Populations");
        
        $("#" + containerId).html(speciesTableHeading);
        
        $("#" + containerId).append(speciesTable);

        
    };
    
    function isSpeciesInRegion(species){
        var isSpecies = false;
        var speciesNames = ["BRSP", "GRSP", "LBCU", "SAGS", "SATH"];
        for(var i=0;i<speciesNames.length;i++){
            isSpecies = isSpecies || species[speciesNames[i]];
        }
        return Boolean(isSpecies);
    }
    
}

function ImjvController(){
    
    var worksheetDataChanged = {};                                              //holds data that has been changed in the worksheet w mcc as key and input.value as value
    worksheetDataChanged["before"] = {};
    worksheetDataChanged["after"] = {};
    
    var caller = [];
    caller["worksheetChange"] = $.Callbacks();
    
    
    this.addListener = function(subject, listener){
        if(typeof caller[subject] !== "undefined"){
            caller[subject].add(listener);
        }
    };
    
    //bind functions to events for worksheet
    this.bindWorksheet = function(){
        $("#worksheetContainer button").bind('click', handleWorksheetSubmitClick);
        $("#worksheetTable input").bind('keydown', handleWorksheetInputKeydown);
        $("#worksheetTable input").bind('keyup', handleWorksheetInputKeyup);
    };    
    
    function updateWorksheetData(mcc, data){
        worksheetDataChanged[mcc] = data;
    }
    
    //triggers when the estimate should be refreshed
    function eventEstimateRefresh(){
        //TODO: make sure there is data to send
        //TODO: should remove blank data here
        caller["worksheetChange"].fire(worksheetDataChanged);
    }
    
    function handleWorksheetSubmitClick(event){
        //disable button
        $("#worksheetContainer button").attr('disabled', 'disabled');
        //fire the estimate refresh event
        eventEstimateRefresh();
    }
    
    function handleWorksheetInputKeydown(event){
        var correctKey = -1;
        if(__DEBUG) console.log( "Keydown: " + event.which.toString() );
        
        //
        //Check for valid keys
        //
        if(event.which >= 37 && event.which <= 40) return true;   //arrow keys
        if(event.which === 46) return true; //delete
        if(event.which === 8) return true;  //backspace
        
        if(event.which >= 96 && event.which <= 105) correctKey = event.which-48;
        else correctKey = event.which;
        
        var inputCharacter = String.fromCharCode(correctKey);

        //only allow numbers and backspaces
        if( inputCharacter.match(/[0123456789]/) !== null ) return true;
        else return false;
    }
    
    function handleWorksheetInputKeyup(event){
        //get the mcc code
        var allClasses = $(this).parent("td").attr('class').split(" ");
        var conditionTime = "";
        var mcc = "";
        for(var i=0;i<allClasses.length;i++){
            if(allClasses[i].match(/^MCC-/) !== null){
                var mccAsClass = allClasses[i].substring(4);
                mcc = mccAsClass.replace(/-/, '.');
            }
            if(allClasses[i].match(/before|after/) !== null){
                conditionTime = allClasses[i];
            }
        }
        //make sure empty strings only added as a result of a backspace, not an invalid key blocked from the keydown event
        if($(this).val() === ""){
            if(typeof worksheetDataChanged[conditionTime][mcc] !== "undefined"){
                worksheetDataChanged[conditionTime][mcc] = $(this).val();
            }
        } else worksheetDataChanged[conditionTime][mcc] = $(this).val();

    }
    
}


function ImjvModel(){
    var baseHost =   __BASEHOST;
    var baseUrl = "http://" + baseHost + "/api/v1/";
    var restBaseUrl = "habpop/";
    var stategonUrl = baseUrl + restBaseUrl + "stategons/";
    var estimatesUrl = baseUrl + restBaseUrl + "estimates/";
    
    var caller = [];
    caller["load"] = $.Callbacks();
    caller["change"] = $.Callbacks();
    
    this.setBaseHost = function(newBaseHost){
        //if you are a string and you are not empty
        if(typeof newBaseHost === "string" || newBaseHost !== "") baseHost = newBaseHost;
        //else, you are already set to localhost
    };
    
    this.addListener = function(subject, listener){
        if(typeof caller[subject] !== "undefined"){
            caller[subject].add(listener);
        }
    };
    
    //loads all the data need for this app
    this.loadAppData = function(geom){
        var sendData = {"geom":geom};   //data sent to rest api
        $.ajax({
            data:sendData,
            dataType: "jsonp",
            success: function(data){completeGetStategon("success", data);},
            url: stategonUrl
        }).fail(function(){completeGetStategon("fail", geom);});
    };
    
    //notify listeners on success or report error on fail
    function completeGetStategon(status, data){
        
        //what happens for a given status
        var completeActions = [];
        completeActions["success"] = function(data){caller["load"].fire(data);};    //fire callbacks to listeners
        completeActions["fail"] = function(geom){if(__DEBUG) console.error("Call to stategon rest api failed with geom = " + geom);};
        
        if(typeof completeActions[status] !== "undefined") completeActions[status](data);
    }
    
    this.refreshEstimate = function(worksheetData){
        //call the estimate api with the worksheet data
        var worksheetDataAsJSON = JSON.stringify(worksheetData);
        var sendData = {"data":worksheetDataAsJSON};   //data sent to rest api
        $.ajax({
            data:sendData,
            dataType: "jsonp",
            success: function(data){completeRefreshEstimate("success", data);},
            url: estimatesUrl
        }).fail(function(){completeRefreshEstimate("fail", worksheetData);});
    };
    
    function completeRefreshEstimate(status, data){
        //what happens for a given status
        var completeActions = [];
        completeActions["success"] = function(data){caller["change"].fire(data);};    //fire callbacks to listeners
        completeActions["fail"] = function(data){if(__DEBUG) console.error("Call to estimates rest api failed with data = " + data);};
        
        if(typeof completeActions[status] !== "undefined") completeActions[status](data);
    }
}

// -- Supplemental js for Openlayers Map  --

  // variables
        var siteMarker = new OpenLayers.Layer.Markers( "Site", {displayInLayerSwitcher: false} );
 	var size = new OpenLayers.Size(21,25);
        var iconOffset = new OpenLayers.Pixel(-(size.w/2), -size.h);  // locate center bottom
        var icon = new OpenLayers.Icon('icons/marker.png',size,iconOffset);
                
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

   // define the pointDrawFeatureOptions functions to handle the vector drawing
        var pointDrawFeatureOptions = 
            {
   //     defaultClick: function(event) { siteMarker.destroy(); },
   //    destroyPersistedFeature: function(evt) {siteMarker.destroy();},
              drawFeature: function() {    
                  if(pointLayer.features.length > 0){ pointLayer.removeAllFeatures();}
              
              },
               'displayClass': 'olControlDrawFeaturePoint',
               callbacks : {"done": PointDoneHandler}
            };


        drawControls = {
            point: new OpenLayers.Control.DrawFeature(pointLayer,
            OpenLayers.Handler.Point,pointDrawFeatureOptions )
        };
  		
    function query_map(evt) {
         var output = document.getElementById(this.key + "Output");
         var lonlat = map.getLonLatFromPixel(evt.xy).transform(projSrc, projDisplay);
         alert("You clicked near " + lonlat.lat + " lat, " + lonlat.lon + " lon");
    }  

// define the  handler functions for the point done drawing
    function PointDoneHandler(point) 
    {
        if(__DEBUG) console.log( point.toString() );     
        siteMarker.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(point.x,point.y),icon));		
        var geom = point.transform(projSrc, projDisplay);  
        geom = (geom.toString()); 
        //remove previous sitemarker
        map.removeLayer(siteMarker);
        // add new site marker	
        map.addLayer(siteMarker);         
        // API call with point geom
        appModel.loadAppData(geom);  
        //deactivate point control and activate navigation
        pointControl.deactivate();
        navControl.activate();
    };   

    function birdInfoClick(spp)
    {
       birdInfoClickLayerSwitcher(spp);
       //create sppInfo HTML Element
       $("#birdImgInfo").attr('class', 'birdInfo');
       $("#birdImgInfo").addClass('birdInfoBackground-'+spp);
       
      var birdTextUrl = "http://" + __BASEHOST + "/partners/iwjv/uploads/html/"+spp+"InfoText.php";
      $.get(birdTextUrl, function(data) {
                $("#birdImgInfo").html(data); 
      }).fail(function(){
          $("#birdImgInfo").html(""); 
      });

      var photoCreditUrl = "http://" + __BASEHOST + "/partners/iwjv/uploads/html/"+spp+"PhotoCredit.txt";
      $.get(photoCreditUrl, function(data) {
            $("#photoCredit").text(data); 
      }).fail(function(){
          $("#photoCredit").text("");
      });
       
       $('#mapInstructionContainer').hide();  
       $("#birdInfoContainer").show();
       $("#instructionsButtonContainer").show(); 
       
    }
    
    function birdInfoClickLayerSwitcher(spp)
    {
        //turn off all birdInfo and photoCredit div contents?
        var layerToTurnOn = "Nothing";
        if (spp === 'brsp') layerToTurnOn = "Brewer Sparrow Range";
        if (spp === 'grsp') layerToTurnOn = "Grasshopper Sparrow Range";
        if (spp === 'lbcu') layerToTurnOn = "Long-billed Curlew Range";
        if (spp === 'sasp') layerToTurnOn = "Sage Sparrow Range";
        if (spp === 'sath') layerToTurnOn = "Sage Thrasher Range";
    
         var larray = map.getLayersByName(/\sRange/);   // all bird layers in map
         for (var i = 0; i < larray.length; i++)
         {
             larray[i].setVisibility(false);
             if (larray[i].name.toString() === layerToTurnOn)
             {
                 larray[i].setVisibility(true);             
             }
         }
    }
    
     function showInstructionInfo(){
        $("#birdInfoContainer").hide();  
        $('#mapInstructionContainer').show();
        $("#instructionsButtonContainer").hide();        
    }
    
    function load()
    {
        // load in general introduction and instructions here?
        
        //moved to its own function so you can do multiple this during loading since this is attached to the body element's onload event
        showInstructionInfo();

    }
    