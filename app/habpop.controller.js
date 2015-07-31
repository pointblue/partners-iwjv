/**
 * habpop.controller.js
 */
(function(){
    angular
        .module('app')
        .controller('Habpop', Habpop)
    ;

    Habpop.$inject = ['HabpopMap', 'StategonRequest', 'EstimatesRequest', 'conservationPlans', '$log'];

    function Habpop(HabpopMap, StategonRequest, EstimatesRequest, conservationPlans, $log){
        var vm = this;
        vm.$log = $log;
        vm.worksheetModels = {};
        vm.submitWorksheets = submitWorksheets;
        vm.estimate = {'before':{},'after':{}};
        vm.showBirdInfo = showBirdInfo;
        vm.selectedBirdInfoSpecies = null;
        vm.conservationPlans = conservationPlans;

        HabpopMap.setPointDroppedHandler(handlePointDropped);

        HabpopMap.initialize();

        function handlePointDropped(geom){
            //reset the worksheet form
            console.log('point dropped handler called from habpop controller');
            StategonRequest.get(geom)
                .then(loadStategon)
                .then(resetWorksheetModels)
                .then(resetEstimate);
        }

        function resetWorksheetModels(){
            vm.worksheetModels = {};
        }

        function resetEstimate(){
            vm.estimate = {'before':{},'after':{}};
        }

        function loadStategon(stategon){
            $log.debug('loading stategon:', stategon);
            vm.stategon = stategon;
        }

        function submitWorksheets(){
            $log.debug('submitting worksheets', vm.worksheetModels);
            EstimatesRequest.get(vm.worksheetModels)
                .then(loadEstimate);
        }

        function loadEstimate(estimate){
            $log.debug('loading estimate', estimate);
            vm.estimate = estimate;
        }

        function showBirdInfo(species){
            $log.debug('changing selected bird info species', species);
            vm.selectedBirdInfoSpecies = species;
            HabpopMap.selectLayerBySpecies(vm.selectedBirdInfoSpecies);
        }

    }

})();