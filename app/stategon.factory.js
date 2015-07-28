(function() {
    angular
        .module('app')
        .factory('StategonRequest', StategonRequest)
    ;
    StategonRequest.$inject = ['$http', '$log', '$interpolate'];

    function StategonRequest($http, $log, $interpolate) {
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
                $log.debug('stategon request complete successfully. return value displayed on next console line');
                $log.debug(response);
                delete response['data']['stategon']['0'];
                return response['data']['stategon'];
            }

            function getStategonFailed(response){
                $log.error(response);
            }
        }
    }

})();