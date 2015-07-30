/**
 * habpopmap.factory.js
 *
 * Initialize the map for the habpop tool
 * Includes all map settings an configuration
 *
 */
(function(){
    angular
        .module('app')
        .factory('HabpopMap', HabpopMap)
    ;

    HabpopMap.$inject = ['OpenLayers'];

    function HabpopMap(OpenLayers){

        var geoserverUrl = 'http://geo.pointblue.org';

        //Notes on the code style for this factory:
        //https://github.com/johnpapa/angular-styleguide#factories

        var siteMarker,
            size,
            iconOffset,
            icon,
            styleMap,
            pointLayer,
            pointDrawFeatureOptions,
            pointControl,
            navOptions,
            navControl,
            projSrc,
            projDisplay,
            navigationControl,
            layerSwitcher,
            mapOptions,
            map,
            mapPanel,
            format,
            pointDroppedHandler = function(){};

        var factory = {
            'initialize':initialize,
            'setPointDroppedHandler':setPointDroppedHandler,
            'selectLayerBySpecies':birdInfoClickLayerSwitcher
        };

        return factory;

        function setPointDroppedHandler(callback){
            if(typeof callback !== 'function'){
                throw "Error: point dropped handler must be of type 'function'";
            }
            pointDroppedHandler = callback;
        }

        function drawFeature(){
            if(pointLayer.features.length > 0){
                pointLayer.removeAllFeatures();
            }
        }

        function createRequestUrl(bounds) {
            var path = '';
            var res = this.map.getResolution();
            var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
            var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
            var z = this.map.getZoom();
            var url = this.url;
            if (url instanceof Array) {
                url = this.selectUrl(null, url);
            }
            if (this.type === 'esri') {
                path = url + z + "/" + y + "/" + x;
            } else {
                path = url + z + "/" + x + "/" + y + "." + this.type;
            }

            return path;
        }

        // define the  handler functions for the point done drawing
        function pointDoneHandler(point) {
            siteMarker.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(point.x,point.y),icon));
            var geom = point.transform(projSrc, projDisplay).toString();
            map.removeLayer(siteMarker);
            map.addLayer(siteMarker);
            pointDroppedHandler(geom);            // API call with point geom
        }

        function initialize(){
            // Map Objects
            siteMarker = new OpenLayers.Layer.Markers( "Site", {displayInLayerSwitcher: false} );
            size = new OpenLayers.Size(21,25);
            iconOffset = new OpenLayers.Pixel(-(size.w/2), -size.h);  // locate center bottom
            icon = new OpenLayers.Icon('icons/marker.png',size,iconOffset);

            styleMap = new OpenLayers.StyleMap({
                strokeColor: '#000000',
                strokeOpacity: 0.7,
                strokeWidth: 2,
                pointerEvents: 'visiblePainted',
                fillOpacity: 0.0
            });

            pointLayer = new OpenLayers.Layer.Vector(
                'Point Layer', {
                    'styleMap': styleMap,
                    displayInLayerSwitcher: false
                }
            );


            // define the pointDrawFeatureOptions functions to handle the vector drawing
            pointDrawFeatureOptions = {
                'drawFeature': drawFeature,
                'displayClass': 'olControlDrawFeaturePoint',
                'callbacks' : {
                    'done': pointDoneHandler
                }
            };

            pointControl = new OpenLayers.Control.DrawFeature(
                pointLayer,
                OpenLayers.Handler.Point,
                pointDrawFeatureOptions
            );


            navOptions = {
                saveState: true,
                defaultControl: pointControl, // navControl,
                zoomWheelEnabled: false
            };

            navControl = new OpenLayers.Control.Navigation(navOptions);
            projSrc = new OpenLayers.Projection("EPSG:900913");
            projDisplay = new OpenLayers.Projection("EPSG:4326");

            OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },

                initialize: function (options) {
                    this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
                    OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                    );
                    this.handler = new OpenLayers.Handler.Click(
                        this, {
                            'click': this.onClick,
                            'dblclick': this.onDblclick
                        }, this.handlerOptions
                    );
                }

            });


            navigationControl = new OpenLayers.Control.Navigation({zoomWheelEnabled: false});
            layerSwitcher = new OpenLayers.Control.LayerSwitcher({'ascending': false});

            mapOptions = {
                controls: [
                    navigationControl,
                    new OpenLayers.Control.PanZoomBar(),
                    new OpenLayers.Control.ScaleLine(),
                    new OpenLayers.Control.Navigation(),
                    layerSwitcher
                ],
                projection: projSrc,
                displayProjection: projDisplay,
                units: "m",
                numZoomLevels: 18,
                maxResolution: 156543.0339,
                maxExtent: new OpenLayers.Bounds(-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892)
            };

            format = 'image/png';

            Ext.onReady(extOnReady);

        }

        function extOnReady() {

            map = new OpenLayers.Map("gxmap", mapOptions);

            //
            // base layers
            //
            var baseLayers = [];

            baseLayers.push(new OpenLayers.Layer.TMS("World Imagery",
                "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/",
                {'type': 'esri', 'getURL': createRequestUrl, isBaseLayer: true, opacity: 1}
            ));

            //
            // vector layers
            //
            var vectorLayers = [];


            vectorLayers.push(new OpenLayers.Layer.WMS(
                "States", geoserverUrl + "/geoserver/spatial2/wms",
                {
                    LAYERS: 'spatial2:iwjv_states_3857',
                    STYLES: 'whiteline',
                    format: format,
                    tiled: true,
                    transparent: true,
                    tilesOrigin: map.maxExtent.left + ',' + map.maxExtent.bottom
                },
                {
                    buffer: 0,
                    displayOutsideMaxExtent: true,
                    isBaseLayer: false,
                    visibility: false,
                    opacity: 0.7
                }
            ));


            vectorLayers.push(new OpenLayers.Layer.WMS(
                "IWJV Region", geoserverUrl + "/geoserver/spatial2/wms",
                {
                    LAYERS: 'spatial2:iwjv_boundary_3857',
                    STYLES: '',
                    format: format,
                    tiled: true,
                    transparent: true,
                    tilesOrigin: map.maxExtent.left + ',' + map.maxExtent.bottom
                },
                {
                    buffer: 0,
                    displayOutsideMaxExtent: true,
                    isBaseLayer: false,
                    visibility: true,
                    opacity: 0.6
                }
            ));

            vectorLayers.push(new OpenLayers.Layer.WMS(
                "BCR 9", geoserverUrl + "/geoserver/spatial2/wms",
                {
                    LAYERS: 'spatial2:bcr_9_3857',
                    STYLES: 'iwjv_bcr',
                    format: format,
                    tiled: true,
                    transparent: true,
                    tilesOrigin: map.maxExtent.left + ',' + map.maxExtent.bottom
                },
                {
                    buffer: 0,
                    displayOutsideMaxExtent: true,
                    isBaseLayer: false,
                    visibility: false,
                    opacity: 0.6
                }
            ));

            vectorLayers.push(new OpenLayers.Layer.WMS(
                "BCR 10", geoserverUrl + "/geoserver/spatial2/wms",
                {
                    LAYERS: 'spatial2:bcr_10_3857',
                    STYLES: '',
                    format: format,
                    tiled: true,
                    transparent: true,
                    tilesOrigin: map.maxExtent.left + ',' + map.maxExtent.bottom
                },
                {
                    buffer: 0,
                    displayOutsideMaxExtent: true,
                    isBaseLayer: false,
                    visibility: false,
                    opacity: 0.5
                }
            ));

            vectorLayers.push(new OpenLayers.Layer.WMS(
                "BCR 16", geoserverUrl + "/geoserver/spatial2/wms",
                {
                    LAYERS: 'spatial2:bcr_16_3857',
                    STYLES: '',
                    format: format,
                    tiled: true,
                    transparent: true,
                    tilesOrigin: map.maxExtent.left + ',' + map.maxExtent.bottom
                },
                {
                    buffer: 0,
                    displayOutsideMaxExtent: true,
                    isBaseLayer: false,
                    visibility: false,
                    opacity: 0.5
                }
            ));

            vectorLayers.push(new OpenLayers.Layer.WMS(
                "Brewer Sparrow Range", geoserverUrl + "/geoserver/spatial2/wms",
                {
                    LAYERS: 'spatial2:brsp_breeding_3857',
                    STYLES: '',
                    format: format,
                    tiled: true,
                    transparent: true,
                    tilesOrigin: map.maxExtent.left + ',' + map.maxExtent.bottom
                },
                {
                    buffer: 0,
                    displayOutsideMaxExtent: true,
                    isBaseLayer: false,
                    visibility: false,
                    opacity: 0.5
                }
            ));

            vectorLayers.push(new OpenLayers.Layer.WMS(
                "Grasshopper Sparrow Range", geoserverUrl + "/geoserver/spatial2/wms",
                {
                    LAYERS: 'spatial2:grsp_breeding_3857',
                    STYLES: '',
                    format: format,
                    tiled: true,
                    transparent: true,
                    tilesOrigin: map.maxExtent.left + ',' + map.maxExtent.bottom
                },
                {
                    buffer: 0,
                    displayOutsideMaxExtent: true,
                    isBaseLayer: false,
                    visibility: false,
                    opacity: 0.5
                }
            ));

            vectorLayers.push(new OpenLayers.Layer.WMS(
                "Long-billed Curlew Range", geoserverUrl + "/geoserver/spatial2/wms",
                {
                    LAYERS: 'spatial2:lbcu_breeding_3857',
                    STYLES: '',
                    format: format,
                    tiled: true,
                    transparent: true,
                    tilesOrigin: map.maxExtent.left + ',' + map.maxExtent.bottom
                },
                {
                    buffer: 0,
                    displayOutsideMaxExtent: true,
                    isBaseLayer: false,
                    visibility: false,
                    opacity: 0.5
                }
            ));

            vectorLayers.push(new OpenLayers.Layer.WMS(
                "Sage Thrasher Range", geoserverUrl + "/geoserver/spatial2/wms",
                {
                    LAYERS: 'spatial2:sath_breeding_3857',
                    STYLES: '',
                    format: format,
                    tiled: true,
                    transparent: true,
                    tilesOrigin: map.maxExtent.left + ',' + map.maxExtent.bottom
                },
                {
                    buffer: 0,
                    displayOutsideMaxExtent: true,
                    isBaseLayer: false,
                    visibility: false,
                    opacity: 0.5
                }
            ));

            vectorLayers.push(new OpenLayers.Layer.WMS(
                "Sage Sparrow Range", geoserverUrl + "/geoserver/spatial2/wms",
                {
                    LAYERS: 'spatial2:sgsp_breeding_3857',
                    STYLES: '',
                    format: format,
                    tiled: true,
                    transparent: true,
                    tilesOrigin: map.maxExtent.left + ',' + map.maxExtent.bottom
                },
                {
                    buffer: 0,
                    displayOutsideMaxExtent: true,
                    isBaseLayer: false,
                    visibility: false,
                    opacity: 0.5
                }
            ));

            // add layers to the map
            map.addLayers(baseLayers);
            map.addLayers(vectorLayers);
            map.addLayer(siteMarker);

            var panelControls = [
                navControl,
                pointControl
            ];
            var toolbar = new OpenLayers.Control.Panel({
                displayClass: 'olControlEditingToolbar',
                defaultControl: panelControls[1]
            });
            toolbar.addControls(panelControls);
            map.addControl(toolbar);

            layerSwitcher.maximizeControl();  // open layerswitcher by default

            mapPanel = new GeoExt.MapPanel({
                title: "InterMountain West Joint Venture Exploration Tool",
                renderTo: "gxmap",
                //   stateId: "mappanel",
                height: 500,
                width: 750,
                map: map,
                center: [-12098270.216376, 4883288.4348961],
                zoom: 5
            });

            birdInfoClickLayerSwitcher("Nothing");

        }

        function birdInfoClickLayerSwitcher(spp) {
            //turn off all birdInfo and photoCredit div contents?
            var layerToTurnOn = "Nothing";
            if (spp === 'brsp') layerToTurnOn = "Brewer Sparrow Range";
            if (spp === 'grsp') layerToTurnOn = "Grasshopper Sparrow Range";
            if (spp === 'lbcu') layerToTurnOn = "Long-billed Curlew Range";
            if (spp === 'sasp') layerToTurnOn = "Sage Sparrow Range";
            if (spp === 'sath') layerToTurnOn = "Sage Thrasher Range";

            var larray = map.getLayersByName(/\sRange/);   // all bird layers in map
            for (var i = 0; i < larray.length; i++)
            {
                larray[i].setVisibility(false);
                if (larray[i].name.toString() === layerToTurnOn)
                {
                    larray[i].setVisibility(true);
                }
            }
        }


    }       //end Habpop



})();