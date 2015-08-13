/**
 * app.module.js
 *
 * Define dependencies for the app
 */
(function(){
    angular
        .module('habpops.core', [
            'habpops.layout',
            'habpops.webservice',
            'habpops.data'
        ]);
})();
