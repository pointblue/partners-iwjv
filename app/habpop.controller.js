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
        vm.worksheets = [];

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
            //create the worksheet model for the stategon
            vm.worksheetModelSets = createWorksheetModel(stategon);
            vm.stategon = stategon;
            vm.$log = $log;
        }

        function createWorksheetModel(stategon){
            var habitatSets = stategon['habitats']['byconditionset'].slice(0);
            var worksheetSets = [];
            for(var i=0;i<habitatSets.length;i++){
                worksheetSets.push( [] );
                for(var j=0;j<habitatSets[i].setData.length;j++){
                    var conditions = habitatSets[i].setData[j]['CONDITIONS'].split(',');
                    var habitatModels = [];
                    for(var k=0;k<conditions.length;k++){
                        habitatModels.push({
                            'mastercode':habitatSets[i].setData[j]['MASTERCODE'],
                            'condition':k+1,
                            'acres':''
                        });
                    }
                    worksheetSets[i].push({
                        'before':habitatModels.slice(0),
                        'after':habitatModels.slice(0)
                    });

                }
            }
            $log.debug('worksheet created: ', worksheetSets);
            return worksheetSets;
        }

    }



})();