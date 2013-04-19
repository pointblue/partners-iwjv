
//make a loader object
var appModel = new ImjvModel();

var appView = new ImjvView();

initApp();  //initialize the app

function initApp(){
    //listen for when the stategon is finished loading
    appModel.addListener("load", appView.populateStategon);
    appModel.addListener("load", appView.populateSpeciesTable);   
}

function pointDoneHandlerClick(point){
    console.log("point handler called");    //debug
    
    //TODO: SHERIE - Convert point to geom
    
    
    
    
    var geom = "somepoint";
    //this has to be called at the end
    appModel.loadAppData(geom);         //load app data
    
}

function ImjvView(){
    
    this.populateStategon = function(data){
        //TODO: SHERIE - Use the data variable to add stuff to your stageon section
        console.log("populateStategons fired");    //debug
        
        //$("#myExampleDiv").html(data.stategon.habitats);
    };
    
    this.populateSpeciesTable = function(data){
        console.log("populateSpeciesTable fired");  //debug
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
    
}


function ImjvModel(){
    var baseUrl = "http://localhost/api/v1/";
    var restBaseUrl = "habpop/";
    var stategonUrl = baseUrl + restBaseUrl + "stategons/";
    
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
}