(function(){
    angular
        .module('underscore', [])
        .factory('_', _);

    function _(){
        return window._;
    }
})();