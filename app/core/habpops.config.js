(function(){
    angular
        .module('habpops.core')
        .config(configure);

    configure.$inject = ['$logProvider', '$compileProvider'];

    function configure($logProvider, $compileProvider){
        $logProvider.debugEnabled(false);
        $compileProvider.debugInfoEnabled(true);
    }

})();