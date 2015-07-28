(function(){
    angular
        .module('app')
        .config(configure);

    configure.$inject = ['$logProvider'];

    function configure($logProvider){
        $logProvider.debugEnabled(true);
    }

})();