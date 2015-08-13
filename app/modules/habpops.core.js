/**
 * app.module.js
 *
 * Define dependencies for the app
 */
(function(){
    angular
        .module('habpops.core', [
            'habpops.view',
            'habpops.webservice',
            'habpops.data'
        ]);
})();
