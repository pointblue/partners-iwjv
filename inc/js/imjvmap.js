//-------------
//
//DEBUG
//
//TODO: Make __FORCEDEBUG settable at a higher level
var __FORCEDEBUG = false;   //true to force debug on live/remote/production server

var __DEBUG = false;    //do not set this variable. shows debug variables
//automatic debug mode on localhost or on force debug
if(ACTIVE_HOST === "localhost" || __FORCEDEBUG !== false){
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
var conditionCodes = [
    "Poor",
    "Fair",
    "Good",
    "Grass",
    "Woodland (>30%)",
    "Shrub",
    "Recently burned",
    "Dryland",
    "Irrigated",
    "Dry",
    "Wet",
    "Grazed",
    "Ungrazed",
    "Non-native",
    "Native"
];

function getConditionCodeName(conditionCode){
    if(conditionCode < 1 || conditionCode > 15) throw new Error('Cannot retrieve the name of the condition code. Index is out of bounds.');
    return conditionCodes[conditionCode-1];
}

var appModel = new ImjvModel(); //Model loads data

var appView = new ImjvView();   //View controls data display

var appController = new ImjvController();   //Controller responds to events

initApp();  //initialize the app

//Initializes main app variables
function initApp(){

    //init app tells which handlers are responsible for which events

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


        that._isSpeciesInRegion = isSpeciesInRegion(data.stategon.species);
        that.populateStategon(data);
        that.populateSpeciesTable(data);
        that.populateWorksheet(data);

        //
        //build potential error messages
        //
        var errorMessagePrefix = "No ";
        var errorMessageSuffix = " found for the selected area. Please try a different area.";
        var dataMessage, birdMessage;

        if(data.stategon.code === "") dataMessage = "data";
        if( ! that._isSpeciesInRegion ) birdMessage = "bird species";

        var errorSubject = dataMessage || birdMessage;

        //display any errors
        if(errorSubject){
            var errorMessageText = errorMessagePrefix + errorSubject + errorMessageSuffix;
            alert(errorMessageText);    //report error to user
        }
    };

    /*
    this.populateStategon = function(data){
        if(data.stategon.code !== ""){
            $("#stategoninfotable").html(data.stategon.habitats.formated);
        } else $("#stategoninfotable").html("");    //if no stategon, reset the info inside

    };
    */
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
        if(data['stategon']['code'] === '' || ! that._isSpeciesInRegion) {
            $('#' + containerId).html('');
            return false;
        }

        var habitats = data['stategon']['habitats']['data'];

        var worksheets = [];
        var currentWorksheetIndex = -1;
        var currentConditionsSet = '';
        for(var ii=0;ii<habitats.length;ii++){
            if(currentConditionsSet != habitats[ii]['CONDITIONS']){
                //new set, create a worksheet
                currentConditionsSet = habitats[ii]['CONDITIONS'];
                var conditionCodes = currentConditionsSet.split(',');
                var fillerColCount = 3 - conditionCodes.length; //how many blank columns we need
                worksheets.push(  $("<table></table>")  );
                currentWorksheetIndex++;
                worksheets[currentWorksheetIndex].attr('class', 'worksheetTable');
                worksheets[currentWorksheetIndex].attr('cellspacing', 0);

                if(currentWorksheetIndex == 0){
                    //First heading row
                    var headingRow1 = $("<tr></tr>");
                    headingRow1.attr('class', 'worksheetHeadingRow');
                    var hr1Td1 = $("<td></td>");
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
                    worksheets[currentWorksheetIndex].append(headingRow1);
                }

                //Second heading row
                var headingRow2ColumnNames = [];
                for(var jj=0;jj<conditionCodes.length;jj++){
                    var conditionName = getConditionCodeName(  parseInt(conditionCodes[jj])  );
                    headingRow2ColumnNames.push(conditionName);
                }
                //repeat the column names
                //headingRow2ColumnNames = headingRow2ColumnNames.concat(headingRow2ColumnNames.slice());
                var headingRow2 = $("<tr></tr>");
                headingRow2.attr('class', 'worksheetHeadingRow');
                headingRow2.append(  $("<td></td>")  ); //space for the habitat type name
                for(var l=0;l<2;l++){
                    for(var ll=0;ll<3;ll++){   //always make 3 columns

                        var singleColumn = $("<td></td>");
                        if(l===0){
                            singleColumn.attr('class', 'before');
                        } else {
                            singleColumn.attr('class', 'after');
                        }
                        if(ll===0){
                            singleColumn.addClass('first');
                        }

                        var isFillerColumn = ll > 2-fillerColCount;
                        if(!isFillerColumn){
                            singleColumn.text(headingRow2ColumnNames[ll]);
                        }

                        headingRow2.append(singleColumn);
                    }
                }

                worksheets[currentWorksheetIndex].append(headingRow2);
            }


            var singleHabitat = $("<tr></tr>");
            singleHabitat.attr('class', 'worksheetHabitatRow');
            if(ii%2===0) {
                singleHabitat.addClass('referenceRow');
            }

            //
            //habitat name
            //
            var habitatNameContainer = $("<td></td>");
            habitatNameContainer.attr('class', 'worksheetHabitatName');
            //habitat link
            //TODO: The server host should be configuration
            var linkRoot = 'http://data.prbo.org/partners/iwjv/uploads/habitat/';
            var habitatNameLink = $("<a></a>");
            habitatNameLink.attr('title', 'Habitat Description');
            habitatNameLink.attr('href', linkRoot + habitats[ii]['LINK']);
            habitatNameLink.attr('target', '_BLANK');
            habitatNameLink.text(habitats[ii]['ASSOCIATION']);
            habitatNameContainer.append(habitatNameLink);
            singleHabitat.append(habitatNameContainer);

            var conditionTimes = ["before", "after"];
            //CREATE BEFORE AND AFTER COLUMNS WITH CONDITIONS
            for(var j=0;j<conditionTimes.length;j++){
                for(var k=0;k<3;k++){
                    var singleHabitatCondition = $("<td></td>");
                    singleHabitatCondition.attr('class', conditionTimes[j]);
                    var isFillerColumn = k > 2 - fillerColCount;
                    if(!isFillerColumn) {
                        var singleMastercode = "MCC-" + habitats[ii]['MASTERCODE'] + "-" + (k + 1).toString();
                        singleHabitatCondition.addClass(conditionCodes[k]);
                        singleHabitatCondition.addClass(singleMastercode);

                        if (k === 0) {
                            singleHabitatCondition.addClass('first');
                        }

                        var conditionInput = $("<input/>");
                        var conditionName = getConditionCodeName(  parseInt(conditionCodes[k])  );
                        var inputTitle =
                            'Acres of ' +                                               //Acres of
                            habitats[ii]['ASSOCIATION'] +                               //Plains
                            ' in ' +                                                    //in
                            conditionName +                                             //Dry
                            ' condition ' +                                             //condtion
                            '(' + conditionTimes[j] + ')';                              //(before/after)
                        conditionInput.attr('type', 'text');
                        conditionInput.attr('title',inputTitle);

                        singleHabitatCondition.append(conditionInput);
                    }

                    singleHabitat.append(singleHabitatCondition);

                }
            }

            worksheets[currentWorksheetIndex].append(singleHabitat);

        }

        //POST WORKSHEET CREATION

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
        instructions    += "Estimates appear in before / after columns of Species Population table above.<br>";
        instructions    += "For descriptions of the habitats/conditions,  click on the links in the worksheet below.";
        worksheetInstructions.html(instructions);

        var worksheetContent = $("<div></div>");
        worksheetContent.attr('id','worksheetContent');

        //add to content container
        $(worksheetContent).html(submitButtonContainer);
        //add all the worksheets
        for(ii=0;ii<worksheets.length;ii++){
            $(worksheetContent).append(worksheets[ii]);
        }

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
        var tableData = data['stategon']['speciestable'];
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

ImjvView.prototype.populateStategon = function(data){
    if(data['stategon']['code'] !== ''){
        $("#stategonTableContainer").show();
        $("#stategonTableContainer .bcr").text(data.stategon.details.bcr);
        $("#stategonTableContainer .state").text(data.stategon.details.acres);
        $("#stategonTableContainer .acres").text(data.stategon.details.state);
        $("#stategonTableContainer .iwjv").attr('href', data.stategon.details.iwjv);
        $("#stategonTableContainer .swap").attr('href', data.stategon.details.swap);
        $("#stategonTableContainer img").attr('src', 'http://data.pointblue.org/partners/iwjv/uploads/img/' + data.stategon.code + '.jpg');

        var currentConditionSet = '';
        var conditions;
        var currentTableIndex = -1;
        var stategonInfoTables = [];
        for(var i = 0;i<data.stategon.habitats.data.length;i++){
            var thisHabitat = data.stategon.habitats.data[i];
            //create table if we are on a new set of conditions
            if(currentConditionSet != thisHabitat.CONDITIONS){  //new set
                currentConditionSet = thisHabitat.CONDITIONS;
                //create a new table for the new condition set
                stategonInfoTables.push(  $("<table class='stategonInfoTable'></table>")  );
                currentTableIndex++;
                stategonInfoTables[currentTableIndex].attr('cellspacing', '0');
                var tableHeading= $("<thead></thead>");
                var tableHeadingRow = $("<tr></tr>");
                if(currentTableIndex == 0){
                    tableHeadingRow.append(  $("<th>Habitat Type</th>")  );
                } else {
                    tableHeadingRow.append(  $("<th></th>")  );
                }

                conditions = currentConditionSet.split(',');//parse the currentConditionSet into an array. grab the name for each item in the array and add it as a td to the tableHeadingRow
                //if you have less than three conditions, insert blank columns before the existing columns
                var blankColumnsCount = 3 - conditions.length;
                for(var j=0;j<conditions.length;j++){
                    var conditionName = getConditionCodeName(  parseInt(conditions[j])  );
                    tableHeadingRow.append(  $("<th>" + conditionName + "</th>")  );
                }
                for(var jj=0;jj<blankColumnsCount;jj++){
                    tableHeadingRow.append(  $("<th></th>")  );
                }
                if(currentTableIndex == 0){
                    tableHeadingRow.append(  $("<th>Total Acres</th>")  );
                } else {
                    tableHeadingRow.append(  $("<th></th>")  );
                }
                tableHeading.append(tableHeadingRow);
                stategonInfoTables[currentTableIndex].append(tableHeading);
            }
            //add data for current row
            var tableRow = $("<tr></tr>");
            if(i%2 != 0){
                tableRow.attr('class', 'odd');
            }
            tableRow.append( $("<td>" + thisHabitat.ASSOCIATION + "</td>") );
            for(var k=0;k<conditions.length;k++){
                tableRow.append(  $("<td class='total'>" + thisHabitat.CONDITION_TOTALS[k] + "</td>")  );
            }
            for(jj=0;jj<blankColumnsCount;jj++){
                tableRow.append(  $("<td class='total'></td>")  );
            }
            tableRow.append( $("<td class='total'>" + thisHabitat.TOTAL + "</td>") );
            stategonInfoTables[currentTableIndex].append(tableRow);
        }

        $("#stategoninfotable").html("");
        for(i=0;i<stategonInfoTables.length;i++){
            $("#stategoninfotable").append(stategonInfoTables[i]);
        }
    } else {
        $("#stategoninfotable").html(""); //if no stategon, reset the info inside
        $("#stategonTableContainer").hide();
    }
};

function ImjvController(){

    //holds data that has been changed in the worksheet w mcc as key and input.value as value
    var worksheetDataChanged = {};
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
        $('#worksheetContainer button').bind('click', handleWorksheetSubmitClick);
        $('.worksheetTable input').bind('keydown', handleWorksheetInputKeydown);
        $('.worksheetTable input').bind('keyup', handleWorksheetInputKeyup);
    };

    this.resetWorksheetData = function(){
        worksheetDataChanged = {};
        worksheetDataChanged["before"] = {};
        worksheetDataChanged["after"] = {};
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
        //TODO: Allow tab key

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

    var caller = [];
    caller["load"] = $.Callbacks();
    caller["change"] = $.Callbacks();

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
            url: API_HABPOP_STATEGONS_URL,
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
            url: API_HABPOP_ESTIMATES_URL,
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

function birdInfoClick(spp) {
    birdInfoClickLayerSwitcher(spp);
    //create sppInfo HTML Element
    $("#birdImgInfo")
        .attr('class', 'birdInfo')
        .addClass('birdInfoBackground-'+spp);

    var birdTextUrl = "uploads/html/" + spp + "InfoText.php";
    $.get(birdTextUrl, function(data) {
        $("#birdImgInfo").html(data);
    }).fail(function(){
        $("#birdImgInfo").html("");
    });

    var photoCreditUrl = "uploads/html/" + spp + "PhotoCredit.txt";
    $.get(photoCreditUrl, function(data) {
        $("#photoCredit").text(data);
    }).fail(function(){
        $("#photoCredit").text("");
    });

    $('#mapInstructionContainer').hide();
    $("#birdInfoContainer").show();
    $("#instructionsButtonContainer").show();

}
    