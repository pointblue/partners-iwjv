/**
 * habpop.controller.js
 */
(function(){
    angular
        .module('app')
        .controller('Habpop', Habpop)
    ;

    Habpop.$inject = ['HabpopMap'];

    function Habpop(){
        var vm = this;
        vm.helloworld = 'hello world';

    }
})();