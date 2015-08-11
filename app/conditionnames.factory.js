(function(){

    angular
        .module('app')
        .factory('conditionNames', conditionNames);

    function conditionNames(){
        //The index corresponds to their database id
        return [
            "Poor",
            "Fair",
            "Good",
            "Grass",
            "Shrub",
            "Woodland (>30%)",
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
    }

})();