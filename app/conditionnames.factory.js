(function(){

    angular
        .module('app')
        .factory('conditionNames', conditionNames);

    function conditionNames(){
        return [
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
    }

})();