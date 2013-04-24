
//make a loader object
var appModel = new ImjvModel();

var appView = new ImjvView();

var appController = new ImjvController();

initApp();  //initialize the app

function initApp(){
    
    appModel.setBaseHost(__BASEHOST);
    
    //listen for when the stategon is finished loading
    appModel.addListener("load", appView.populateStategon);
    appModel.addListener("load", appView.populateSpeciesTable);
    appModel.addListener("load", appView.populateWorksheet);
    appModel.addListener("change", appView.handleEstimateRefresh);
    
    //listen for worksheet changed
    appController.addListener("worksheetChange", appModel.refreshEstimate);
    
    //list for worksheet loaded in view
    appView.addListener("worksheetLoaded", appController.bindWorksheet);
    
}

function ImjvView(){
    
    var caller = [];
    caller["worksheetLoaded"] = $.Callbacks();
    
    
    this.addListener = function(subject, listener){
        if(typeof caller[subject] !== "undefined"){
            caller[subject].add(listener);
        }
    };
    
    this.populateStategon = function(data){
        
        $("#stategoninfotable").html(data.stategon.habitats.formated);
        
    };
    //populate the before after section
    this.handleEstimateRefresh = function(data){
        //for each before, then each after
        //if your species exists in the current species table
        //set the before/after value
//        for(var key in data.estimate[0].before){
//            if($("#speciesTable tr." + key).length > 0){
//                $("#speciesTable tr." + key + " td.before").text(data.estimate[0].before[key]);
//            }
//        }
        for(var conditionTime in data.estimate[0]){
            populateSpeciesTableEstimate(conditionTime, data);
        }
        
    };
    
    function populateSpeciesTableEstimate(conditionTime, data){
        for(var key in data.estimate[0][conditionTime]){
            if($("#speciesTable tr." + key).length > 0){
                $("#speciesTable tr." + key + " td." + conditionTime).text(data.estimate[0][conditionTime][key]);
            }
        }
    }
    
    
    
    this.populateWorksheet = function(data){
        
        var habitats = data.stategon.habitats.data;
        
        var containerId = "worksheetContainer";
        
        var worksheetTable = $("<table></table>");
        worksheetTable.attr('id', 'worksheetTable');
        
        //First heading row
        var headingRow1 = $("<tr></tr>");
        headingRow1.attr('class', 'worksheetHeadingRow');
        var hr1Td1 = $("<td></td>");
        hr1Td1.attr('rowspan', '2');
        hr1Td1.text('Habitat');
        headingRow1.append(hr1Td1);
        var hr1Td2 = $("<td></td>");
        hr1Td2.attr('colspan', '3');
        hr1Td2.text('Condition Before');
        headingRow1.append(hr1Td2);
        var hr1Td3 = $("<td></td>");
        hr1Td3.attr('colspan', '3');
        hr1Td3.text('Condition After');
        headingRow1.append(hr1Td3);
        worksheetTable.append(headingRow1);
        
        //Second heading row
        var headingRow2ColumnNames = ["Poor", "Fair", "Good", "Poor", "Fair", "Good"];
        var headingRow2 = $("<tr></tr>");
        headingRow2.attr('class', 'worksheetHeadingRow');
        for(var i=0;i<headingRow2ColumnNames.length;i++){
            var singleColumn = $("<td></td>");
            singleColumn.text(headingRow2ColumnNames[i]);
            headingRow2.append(singleColumn);
        }
        worksheetTable.append(headingRow2);
        
        var conditions = ["poor", "fair", "good"];
        var conditionTimes = ["before", "after"];
        for(var i=0;i<habitats.length;i++){
            var singleHabitat = $("<tr></tr>");
            singleHabitat.attr('class', 'worksheetHabitatRow');
            var habitatName = $("<td></td>");
            habitatName.attr('class', 'worksheetHabitatName');
            habitatName.text(habitats[i]['ASSOCIATION']);
            singleHabitat.append(habitatName);
            
            for(var j=0;j<conditionTimes.length;j++){
                for(var k=0;k<conditions.length;k++){
                    var singleHabitatCondition = $("<td></td>")
                    singleHabitatCondition.attr('class', conditionTimes[j]);
                    singleHabitatCondition.addClass(conditions[k]);
                    var singleMastercode = "MCC-" + habitats[i]['MASTERCODE'] + "-" + (k+1).toString();
                    singleHabitatCondition.addClass(singleMastercode);
                    var conditionInput = $("<input/>");
                    conditionInput.attr('type', 'text');
                    
                    singleHabitatCondition.append(conditionInput);
                    singleHabitat.append(singleHabitatCondition);
                }
                
            }
            
            worksheetTable.append(singleHabitat);
            
        }
        
        var submitButton = $("<button></button>");
        submitButton.attr('type', 'button');
        submitButton.text("Submit");
        
        $("#" + containerId).html(submitButton);
        
        $("#" + containerId).append(worksheetTable);
        
        //call that worksheet has finished loading
        caller["worksheetLoaded"].fire();
        
    };
    
    this.populateSpeciesTable = function(data){
        var containerId = "speciesTableContainer";
        var columnDisplayNames = ["Species Name","Occupied Acres", "Population Estimate", "Population Objective", "Objective Increase", "Before", "After"];
        var columnNames = ["SpeciesName", "OccupiedAcres", "PopEstimate", "PopObjective", "ObjectiveIncrease"];
        
        var speciesTable = $("<table></table>");
        speciesTable.attr('id', 'speciesTable');
        
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
                singleDataColumn.text(currentSpecies[ currentColumnName ]);
                singleDataRow.append(singleDataColumn);
            }
            var beforeColumn = $("<td></td>");
            beforeColumn.attr('class', 'before');
            var afterColumn = $("<td></td>");
            afterColumn.attr('class', 'after');
            singleDataRow.append(beforeColumn).append(afterColumn);
            
            speciesTable.append(singleDataRow);
            
        }
        
        
        $("#" + containerId).html(speciesTable);

        
    };
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
        //TODO: make sure this is data to send
        //TODO: should remove blank data here
        
        caller["worksheetChange"].fire(worksheetDataChanged);
    }
    
    function handleWorksheetSubmitClick(event){
        //first the estimate refresh event
        eventEstimateRefresh();
    }
    
    function handleWorksheetInputKeydown(event){
        var inputCharacter = String.fromCharCode(event.which);
        //only allow numbers and backspaces
        if( inputCharacter.match(/[0123456789]/) === null ){
            if(event.which === 8) return true;
            else return false;
        } else return true;
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
        
        
        //debug
        //console.log("conditionTime: " + conditionTime + ", mcc: " + mcc);
        //console.log("new data: " + worksheetDataChanged[conditionTime][mcc]);
        //console.log("data length at keyup: " + worksheetDataChanged[conditionTime].length);

    }
    
}


function ImjvModel(){
    var baseHost = "localhost";
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
        completeActions["fail"] = function(geom){console.error("Call to stategon rest api failed with geom = " + geom);};
        
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
        completeActions["fail"] = function(data){console.error("Call to estimates rest api failed with data = " + data);};
        
        if(typeof completeActions[status] !== "undefined") completeActions[status](data);
    }
}