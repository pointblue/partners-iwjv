(function () {
    angular
        .module('app')
        .factory('conservationPlans', conservationPlans);

    function conservationPlans() {
        return {
            'http://iwjv.org/sites/default/files/az_coordimpplan.pdf': 'Coordinated Implementation Plan For Bird Convervation in Nothern Arizona',
            'http://iwjv.org/sites/default/files/ca_coordimpplan.pdf': 'Coordinated Implementation Plan For Bird Convervation in California',
            'http://iwjv.org/sites/default/files/co_coordimpplan.pdf': 'Coordinated Implementation Plan For Bird Convervation in Western Colorado',
            'http://iwjv.org/sites/default/files/id_coordimpplan.pdf': 'Coordinated Implementation Plan For Bird Convervation in Idaho',
            'http://iwjv.org/sites/default/files/mt_coordimpplan.pdf': 'Coordinated Implementation Plan For Bird Convervation in Western Montana',
            'http://iwjv.org/sites/default/files/nm_coordimpplan_0.pdf': 'Coordinated Implementation Plan For Bird Convervation in Western New Mexico',
            'http://iwjv.org/sites/default/files/nevada_coordimpplan.pdf': 'Coordinated Implementation Plan For Bird Convervation in Nevada',
            'http://iwjv.org/sites/default/files/easternoregoncip.pdf': 'Coordinated Implementation Plan For Bird Convervation in Eastern Oregon',
            'http://iwjv.org/sites/default/files/ut_statecoordimpplan.pdf': 'Coordinated Implementation Plan For Bird Convervation in Utah',
            'http://iwjv.org/sites/default/files/plan_eastwa_scp.pdf': 'Coordinated Implementation Plan For Bird Convervation in Eastern Washington',
            'http://iwjv.org/sites/default/files/wy_coord_imp_plan.pdf': 'Coordinated Implementation Plan For Bird Convervation in Central and Western Wyoming'
        }
    }

})();