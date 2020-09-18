(function(){
    angular
        .module('habpops.webservice')
        .factory('EstimatesRequest', EstimatesRequest);

    EstimatesRequest.$inject = ['$http', '$log', '$interpolate'];

    function EstimatesRequest($http, $log, $interpolate){
        var estimatesApiUrl = 'http://50.0.115.215/api/v1/habpop/estimates/';

        return {
            'get':getEstimate
        };

        function getEstimate(beforeAndAfterData){
            $log.debug('getEstimate has been called with the following before and after data', beforeAndAfterData);
            var templateUrl = '{{url}}?callback=JSON_CALLBACK&data={{data}}';
            var templateOptions = {
                'url':estimatesApiUrl,
                'data':JSON.stringify(beforeAndAfterData)
            };

            return $http.jsonp(  $interpolate(templateUrl)(templateOptions)  )
                .then(getEstimateComplete)
                .catch(getEstimateFailed);

            function getEstimateComplete(response){
                $log.debug('estimate request complete successfully.', response);

                return response['data']['estimate'][0];
            }

            function getEstimateFailed(response){
                $log.error(response);
            }
        }

    }
})();