   function get_my_url (bounds) {
            var res = this.map.getResolution();
            var x = Math.round ((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
            var y = Math.round ((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
            var z = this.map.getZoom();
            var url = this.url;
            if (url instanceof Array) {
                    url = this.selectUrl(path, url);
            }
            var path;
            if(this.type === 'esri') path = url+z+"/"+y+"/"+x;
            else path = url + z + "/" + x + "/" + y + "." + this.type;

            return path;
    }  
            
    Proj4js.defs["EPSG:3310"]  = "+proj=aea +lat_1=34 +lat_2=40.5 +lat_0=0 +lon_0=-120 +x_0=0 +y_0=-4000000 +ellps=GRS80 +datum=NAD83 +units=m +no_defs";      
    Proj4js.defs["EPSG:4326"] = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

    var projSrc = new OpenLayers.Projection("EPSG:900913");
    var projDisplay = new OpenLayers.Projection("EPSG:4326");

    var navOptions = 
    {
         saveState: true,
         defaultControl : navControl, 
         zoomWheelEnabled: false
    };

    var navControl =  new OpenLayers.Control.Navigation(navOptions);     
    var pointControl =  new OpenLayers.Control.DrawFeature(pointLayer,OpenLayers.Handler.Point, pointDrawFeatureOptions);


    // --------
    OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
                    defaultHandlerOptions: {
                        'single': true,
                        'double': false,
                        'pixelTolerance': 0,
                        'stopSingle': false,
                        'stopDouble': false
                    },

                    initialize: function(options) {
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
        var bounds = new OpenLayers.Bounds(-14451888.510683998, 5260795.5676214,   -12534236.348121, 3913057.8822958, -11448219.050396, 5219213.8214511, -12974513.630982, 6217175.6626035 );
        var navigationControl= new OpenLayers.Control.Navigation({zoomWheelEnabled: false});
        var ls = new OpenLayers.Control.LayerSwitcher({'ascending':false});

        var options = {
            controls: [
                            navigationControl,
                            new OpenLayers.Control.PanZoomBar(),
                            new OpenLayers.Control.ScaleLine(),
                            new OpenLayers.Control.MousePosition(),
                            new OpenLayers.Control.KeyboardDefaults(),
                            ls
                       ],
            projection: projSrc,
            displayProjection: projDisplay,
            units: "m",
            numZoomLevels: 18,
            maxResolution: 156543.0339,
            maxExtent: new OpenLayers.Bounds(-20037508.3427892,-20037508.3427892,20037508.3427892,20037508.3427892) 
            //restrictedExtent: bounds
         };


    //  need to define controls variable to activate the overrided  default click handler
    var map, controls;
    var mapPanel;
    var format = 'image/png';



    Ext.onReady(function() {         

         map = new OpenLayers.Map("gxmap",options);
     // base layers

         var street = new OpenLayers.Layer.WMS(
                "Global Imagery",
                "http://maps.opengeo.org/geowebcache/service/wms",
               // {layers: "bluemarble"}
                {layers: "openstreetmap", format: "image/png"}
            );
         var sat = new OpenLayers.Layer.TMS("World Imagery",
               "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/",
               { 'type':'esri', 'getURL':get_my_url, isBaseLayer:true, opacity: 1}
               );
         var ghyb = new OpenLayers.Layer.Google(
                    "Google Hybrid",
                    {type: G_HYBRID_MAP,'sphericalMercator': true, isBaseLayer:true, opacity:1}
                );

         map.addLayers([ghyb,sat]);

         states = new OpenLayers.Layer.WMS(
                        "States", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                        {
                            LAYERS: 'spatial2:iwjv_states_3857',
                            STYLES: '',
                            format: format,
                            tiled: true,
                            transparent: true,
                            tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                        },
                        {
                            buffer: 0,
                            displayOutsideMaxExtent: true,
                            isBaseLayer: false,
                            visibility: false,
                            opacity: 0.4
                        }
                    );

          stategons = new OpenLayers.Layer.WMS(
                        "IWJV Region", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                        {
                            LAYERS: 'spatial2:iwjv_boundary_3857',
                            STYLES: '',
                            format: format,
                            tiled: true,
                            transparent: true,
                            tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                        },
                        {
                            buffer: 0,
                            displayOutsideMaxExtent: true,
                            isBaseLayer: false,
                            visibility: true,
                            opacity: 0.6
                        }
                    );	                
          BCR_9 = new OpenLayers.Layer.WMS(
                        "BCR 9", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                        {
                            LAYERS: 'spatial2:bcr_9_3857',
                            STYLES: 'iwjv_bcr',
                            format: format,
                            tiled: true,
                            transparent: true,
                            tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                        },
                        {
                            buffer: 0,
                            displayOutsideMaxExtent: true,
                            isBaseLayer: false,
                            visibility: false,
                            opacity: 0.6
                        }
                    );	

          BCR_10 = new OpenLayers.Layer.WMS(
                        "BCR 10", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                        {
                            LAYERS: 'spatial2:bcr_10_3857',
                            STYLES: '',
                            format: format,
                            tiled: true,
                            transparent: true,
                            tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                        },
                        {
                            buffer: 0,
                            displayOutsideMaxExtent: true,
                            isBaseLayer: false,
                            visibility: false,
                            opacity: 0.5
                        }
                    );	

          BCR_16 = new OpenLayers.Layer.WMS(
                        "BCR 16", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                        {
                            LAYERS: 'spatial2:bcr_16_3857',
                            STYLES: '',
                            format: format,
                            tiled: true,
                            transparent: true,
                            tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                        },
                        {
                            buffer: 0,
                            displayOutsideMaxExtent: true,
                            isBaseLayer: false,
                            visibility: false,
                            opacity: 0.5
                        }
                    );				

                    map.addLayers([stategons,BCR_9,BCR_10,BCR_16]);

       // bird layers
          brsp = new OpenLayers.Layer.WMS(
                        "Brewer Sparrow Range", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                        {
                            LAYERS: 'spatial2:brsp_breeding_3857',
                            STYLES: '',
                            format: format,
                            tiled: true,
                            transparent: true,
                            tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                        },
                        {
                            buffer: 0,
                            displayOutsideMaxExtent: true,
                            isBaseLayer: false,
                            visibility: false,
                            opacity: 0.5
                        }
                    );

           grsp = new OpenLayers.Layer.WMS(
                        "Grasshopper Sparrow Range", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                        {
                            LAYERS: 'spatial2:grsp_breeding_3857',
                            STYLES: '',
                            format: format,
                            tiled: true,
                            transparent: true,
                            tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                        },
                        {
                            buffer: 0,
                            displayOutsideMaxExtent: true,
                            isBaseLayer: false,
                            visibility: false,
                            opacity: 0.5
                        }
                    );
           lbcu = new OpenLayers.Layer.WMS(
                        "Long-billed Curlew Range", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                        {
                            LAYERS: 'spatial2:lbcu_breeding_3857',
                            STYLES: '',
                            format: format,
                            tiled: true,
                            transparent: true,
                            tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                        },
                        {
                            buffer: 0,
                            displayOutsideMaxExtent: true,
                            isBaseLayer: false,
                            visibility: false,
                            opacity: 0.5
                        }
                    );

           sath = new OpenLayers.Layer.WMS(
                        "Sage Thrasher Range", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                        {
                            LAYERS: 'spatial2:sath_breeding_3857',
                            STYLES: '',
                            format: format,
                            tiled: true,
                            transparent: true,
                            tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                        },
                        {
                            buffer: 0,
                            displayOutsideMaxExtent: true,
                            isBaseLayer: false,
                            visibility: false,
                            opacity: 0.5
                        }
                    );
             sgsp = new OpenLayers.Layer.WMS(
                        "Sage Sparrow Range", "http://data.calcommons.org:8080/geoserver/spatial2/wms",
                        {
                            LAYERS: 'spatial2:sgsp_breeding_3857',
                            STYLES: '',
                            format: format,
                            tiled: true,
                            transparent: true,
                            tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                        },
                        {
                            buffer: 0,
                            displayOutsideMaxExtent: true,
                            isBaseLayer: false,
                            visibility: false,
                            opacity: 0.5
                        }
                    );
        //add the bird layers       
           map.addLayers([grsp, lbcu, brsp, sath,  sgsp]);        
         //add the sitemarker layer       
           map.addLayer(siteMarker);

        var panelControls = [
           navControl,
           pointControl
        ];
        var toolbar = new OpenLayers.Control.Panel({
           displayClass: 'olControlEditingToolbar',
           defaultControl: panelControls[0]
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
            center:   [-12098270.216376, 4883288.4348961],      //  [-12698270.216376, 5183288.4348961],
            zoom: 5
       }); 
       
       birdInfoClickLayerSwitcher("Nothing");
       
      });