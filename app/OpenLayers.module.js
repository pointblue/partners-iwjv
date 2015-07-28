
(function(OpenLayers){
    angular
        .module('OpenLayers', [])
        .factory('OpenLayers', OpenLayersFactory)
    ;

    function OpenLayersFactory(){
        return OpenLayers;
    }
})(OpenLayers);