/**
 * habpop.controller.js
 */
(function(){
    angular
        .module('app')
        .controller('Habpop', Habpop)
    ;

    Habpop.$inject = ['HabpopMap', 'StategonRequest', '$log'];

    function Habpop(HabpopMap, StategonRequest, $log){
        var vm = this;
        vm.helloworld = 'hello world';

        HabpopMap.setPointDroppedHandler(handlePointDropped);

        HabpopMap.initialize();


        function handlePointDropped(geom){
            //reset the worksheet form
            console.log('point dropped handler called from habpop controller');
            StategonRequest.get(geom)
                .then(loadStategon);
        }

        function loadStategon(stategon){
            $log.debug('loading stategon:', stategon);
            vm.stategon = stategon;
        }

    }



})();