(function(){
    angular
        .module('app')
        .factory('HabpopMap', HabpopMap)
    ;

    HabpopMap.$inject = ['OpenLayers'];

    function HabpopMap(OpenLayers){


        // Map Objects
        var siteMarker = new OpenLayers.Layer.Markers( "Site", {displayInLayerSwitcher: false} );
        var size = new OpenLayers.Size(21,25);
        var iconOffset = new OpenLayers.Pixel(-(size.w/2), -size.h);  // locate center bottom
        var icon = new OpenLayers.Icon('icons/marker.png',size,iconOffset);

        var style_black = new OpenLayers.StyleMap({
            strokeColor: '#000000',
            strokeOpacity: 0.7,
            strokeWidth: 2,
            pointerEvents: 'visiblePainted',
            fillOpacity: 0.0
        });

        var pointLayer = new OpenLayers.Layer.Vector('Point Layer', {
            styleMap: style_black,
            displayInLayerSwitcher: false
        });

        // define the pointDrawFeatureOptions functions to handle the vector drawing
        var pointDrawFeatureOptions = {
            drawFeature: function() {
                if(pointLayer.features.length > 0){
                    pointLayer.removeAllFeatures();
                }
            },
            'displayClass': 'olControlDrawFeaturePoint',
            callbacks : {
                'done': pointDoneHandler
            }
        };

        var drawControls = {
            point: new OpenLayers.Control.DrawFeature(
                pointLayer,
                OpenLayers.Handler.Point,pointDrawFeatureOptions
            )
        };

        function query_map(evt) {
            var output = document.getElementById(this.key + "Output");
            var lonlat = map.getLonLatFromPixel(evt.xy).transform(projSrc, projDisplay);
            alert("You clicked near " + lonlat.lat + " lat, " + lonlat.lon + " lon");
        }

        // define the  handler functions for the point done drawing
        function pointDoneHandler(point) {
            if(__DEBUG) console.log( point.toString() );
            //appController.resetWorksheetData();
            siteMarker.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(point.x,point.y),icon));
            var geom = point.transform(projSrc, projDisplay);
            geom = (geom.toString());
            //remove previous sitemarker
            map.removeLayer(siteMarker);
            // add new site marker
            map.addLayer(siteMarker);
            // API call with point geom
            console.log(geom);
            //appModel.loadAppData(geom);
            //deactivate point control and activate navigation
            // pointControl.deactivate();
            // navControl.activate();
        }

        function get_my_url(bounds) {
            var res = this.map.getResolution();
            var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
            var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
            var z = this.map.getZoom();
            var url = this.url;
            if (url instanceof Array) {
                url = this.selectUrl(path, url);
            }
            var path = '';
            if (this.type === 'esri') {
                path = url + z + "/" + y + "/" + x;
            } else {
                path = url + z + "/" + x + "/" + y + "." + this.type;
            }

            return path;
        }

        var pointControl = new OpenLayers.Control.DrawFeature(pointLayer, OpenLayers.Handler.Point, pointDrawFeatureOptions);
        var navOptions = {
            saveState: true,
            defaultControl: pointControl, // navControl,
            zoomWheelEnabled: false
        };
        var navControl = new OpenLayers.Control.Navigation(navOptions);
        var projSrc = new OpenLayers.Projection("EPSG:900913");
        var projDisplay = new OpenLayers.Projection("EPSG:4326");
// --------
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
//-------------------------------------------
        var bounds = new OpenLayers.Bounds(-14451888.510683998, 5260795.5676214, -12534236.348121, 3913057.8822958, -11448219.050396, 5219213.8214511, -12974513.630982, 6217175.6626035);
        var navigationControl = new OpenLayers.Control.Navigation({zoomWheelEnabled: false});
        var ls = new OpenLayers.Control.LayerSwitcher({'ascending': false});

        var mapOptions = {
            controls: [
                navigationControl,
                new OpenLayers.Control.PanZoomBar(),
                new OpenLayers.Control.ScaleLine(),
                new OpenLayers.Control.Navigation(),
                // new OpenLayers.Control.MousePosition(),
                // new OpenLayers.Control.KeyboardDefaults(),  take care of map moving with arrow keys
            ],
            projection: projSrc,
            displayProjection: projDisplay,
            units: "m",
            numZoomLevels: 18,
            maxResolution: 156543.0339,
            maxExtent: new OpenLayers.Bounds(-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892)
            //restrictedExtent: bounds
        };


//  need to define controls variable to activate the overrided  default click handler
        var map, controls;
        var mapPanel;
        var format = 'image/png';


        Ext.onReady(function () {

            map = new OpenLayers.Map("gxmap", mapOptions);

            //
            // base layers
            //
            var baseLayers = [];

            /*
             baseLayers.push(new OpenLayers.Layer.WMS(
             "Global Imagery",
             "http://maps.opengeo.org/geowebcache/service/wms",
             // {layers: "bluemarble"}
             {layers: "openstreetmap", format: "image/png"}
             ));
             */

            baseLayers.push(new OpenLayers.Layer.TMS("World Imagery",
                "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/",
                {'type': 'esri', 'getURL': get_my_url, isBaseLayer: true, opacity: 1}
            ));

            /*
             baseLayers.push(new OpenLayers.Layer.Google(
             "Google Hybrid",
             {type: G_HYBRID_MAP, 'sphericalMercator': true, isBaseLayer: true, opacity: 1}
             ));
             */

            //
            // vector layers
            //
            var vectorLayers = [];


            vectorLayers.push(new OpenLayers.Layer.WMS(
                "States", GEO_FULL_URL + "/geoserver/spatial2/wms",
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
                "IWJV Region", GEO_FULL_URL + "/geoserver/spatial2/wms",
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
                "BCR 9", GEO_FULL_URL + "/geoserver/spatial2/wms",
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
                "BCR 10", GEO_FULL_URL + "/geoserver/spatial2/wms",
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
                "BCR 16", GEO_FULL_URL + "/geoserver/spatial2/wms",
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
                "Brewer Sparrow Range", GEO_FULL_URL + "/geoserver/spatial2/wms",
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
                "Grasshopper Sparrow Range", GEO_FULL_URL + "/geoserver/spatial2/wms",
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
                "Long-billed Curlew Range", GEO_FULL_URL + "/geoserver/spatial2/wms",
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
                "Sage Thrasher Range", GEO_FULL_URL + "/geoserver/spatial2/wms",
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
                "Sage Sparrow Range", GEO_FULL_URL + "/geoserver/spatial2/wms",
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
                defaultControl: panelControls[1]  // 0
            });
            toolbar.addControls(panelControls);
            map.addControl(toolbar);

            ls.maximizeControl();  // open layerswitcher by default

            mapPanel = new GeoExt.MapPanel({
                title: "InterMountain West Joint Venture Exploration Tool",
                renderTo: "gxmap",
                //   stateId: "mappanel",
                height: 500,
                width: 750,
                map: map,
                center: [-12098270.216376, 4883288.4348961],      //  [-12698270.216376, 5183288.4348961],
                zoom: 5
            });

            birdInfoClickLayerSwitcher("Nothing");

        });

        // -- Supplemental js for Openlayers Map  --

        function birdInfoClick(spp) {
            birdInfoClickLayerSwitcher(spp);
            //create sppInfo HTML Element
            $("#birdImgInfo")
                .attr('class', 'birdInfo')
                .addClass('birdInfoBackground-'+spp);

            var birdTextUrl = "uploads/html/" + spp + "InfoText.php";
            $.get(birdTextUrl, function(data) {
                $("#birdImgInfo").html(data);
            }).fail(function(){
                $("#birdImgInfo").html("");
            });

            var photoCreditUrl = "uploads/html/" + spp + "PhotoCredit.txt";
            $.get(photoCreditUrl, function(data) {
                $("#photoCredit").text(data);
            }).fail(function(){
                $("#photoCredit").text("");
            });

            $('#mapInstructionContainer').hide();
            $("#birdInfoContainer").show();
            $("#instructionsButtonContainer").show();

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

        function _setPointDropHandler(_pointDropHandler){
            if(typeof  _pointDropHandler !== 'function'){
                throw "Error: point drop handler must be of type function";
            }
            pointDoneHandler = _pointDropHandler;
        }


        return {
            setPointDropHandler:_setPointDropHandler
        };


    }


})();