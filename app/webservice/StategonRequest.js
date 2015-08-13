(function() {
    angular
        .module('habpops.webservice')
        .factory('StategonRequest', StategonRequest)
    ;
    StategonRequest.$inject = ['$http', '$log', '$interpolate', '_', 'conditionNames'];

    function StategonRequest($http, $log, $interpolate, _, conditionNames) {
        var stategonApiUrl = 'http://data.prbo.org/api/v1/habpop/stategons/';

        return {
            'get':getStategon
        };

        function getStategon(geom){
            $log.debug('getStategon has been called with the geom object: ' + geom.toString());
            var templateUrl = '{{url}}?callback=JSON_CALLBACK&geom={{geom}}';
            var templateOptions = {
                'url':stategonApiUrl,
                'geom':geom.toString()
            };

            return $http.jsonp(  $interpolate(templateUrl)(templateOptions)  )
                .then(getStategonComplete)
                .catch(getStategonFailed);

            function getStategonComplete(response){
                $log.debug('stategon request complete successfully.', response);

                return washStategonData(  response['data']['stategon']  );
            }

            function getStategonFailed(response){
                $log.error(response);
            }
        }

        //Clean up the data and organize it so that it's more useful for rendering
        function washStategonData(stategon){
            delete stategon['0'];

            //organize habitats by their set of conditions
            stategon['habitats']['byconditionset'] = [];
            var conditionSets = _.uniq(  _.pluck(stategon['habitats']['data'], 'CONDITIONS')  );    //uniq sets of conditions. example: ['1,2,3', '4,5']
            for(var i=0;i<conditionSets.length;i++){
                var habitatsForThisConditionSet = _.where(stategon['habitats']['data'], {'CONDITIONS':conditionSets[i]});
                var conditionSetsAsArray = conditionSets[i].split(',');
                var setConditions = [];
                var setConditionsBefore = [];
                var setConditionsAfter = [];
                for(var j=0;j<conditionSetsAsArray.length;j++){
                    var thisCondtionName = conditionNames[ parseInt(conditionSetsAsArray[j])-1 ];
                    setConditions.push(thisCondtionName);
                }
                for(j=0;j<setConditions.length;j++){
                    setConditionsBefore.push({'value':'before' + setConditions[j]});
                    setConditionsAfter.push({'value':'after' + setConditions[j]});
                }
                //used to track changes in the dom for before and after input controls
                for(j=0;j<habitatsForThisConditionSet.length;j++){
                    habitatsForThisConditionSet[j].setConditionsBefore = setConditionsBefore;
                    habitatsForThisConditionSet[j].setConditionsAfter = setConditionsAfter;
                }

                stategon['habitats']['byconditionset'].push({
                    'setData':habitatsForThisConditionSet,
                    'setConditions':setConditions
                });

            }
            return stategon;
        }
    }

})();