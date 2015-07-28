/**
 * habpop.controller.js
 */
(function(){
    angular
        .module('app')
        .controller('Habpop', Habpop)
    ;

    Habpop.$inject = ['HabpopMap'];

    function Habpop(HabpopMap){
        var vm = this;
        vm.helloworld = 'hello world';

        HabpopMap.initialize();

    }
})();