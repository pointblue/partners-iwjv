  // variables
        var siteMarker = new OpenLayers.Layer.Markers( "Site", {displayInLayerSwitcher: false} );
 	var size = new OpenLayers.Size(40,40);
        var icon = new OpenLayers.Icon('icons/orange-pin.png',size);
                
        var style_black = new OpenLayers.StyleMap(
        {
            strokeColor: "#000000",
            strokeOpacity: 0.7,
            strokeWidth: 2,
            pointerEvents: "visiblePainted",
	    fillOpacity: 0.0
        });
                       
        var pointLayer = new OpenLayers.Layer.Vector("Point Layer", {
		    styleMap: style_black,
		    displayInLayerSwitcher: false

		});               

              // define the pointDrawFeatureOptions functions to handle the vector drawing
        var pointDrawFeatureOptions = 
            {
          //     defaultClick: function(event) { siteMarker.destroy(); },
          //    destroyPersistedFeature: function(evt) {siteMarker.destroy();},
              drawFeature: function() {    
                  if(pointLayer.features.length > 0){ pointLayer.removeAllFeatures();}
              
              },
               'displayClass': 'olControlDrawFeaturePoint',
               callbacks : {"done": PointDoneHandler}
            };


        drawControls = {
            point: new OpenLayers.Control.DrawFeature(pointLayer,
            OpenLayers.Handler.Point,pointDrawFeatureOptions )
        };
  		
    function query_map(evt) {
         var output = document.getElementById(this.key + "Output");
         var lonlat = map.getLonLatFromPixel(evt.xy).transform(projSrc, projDisplay);
         alert("You clicked near " + lonlat.lat + " lat, " + lonlat.lon + " lon");
    }  


// define the  handler functions for the point done drawing
    function PointDoneHandler(point) 
    {
           console.log(point.toString());
           //     alert(point);      
                siteMarker.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(point.x,point.y),icon));		
		var geom = point.transform(projSrc, projDisplay); 
		//geom = encodeURIComponent(geom.toString()); 
                geom = (geom.toString()); 
       //remove previous sitemarker
              map.removeLayer(siteMarker);
       // add new site marker	
              map.addLayer(siteMarker);         
            // API call with point geom
                appModel.loadAppData(geom); 
              // var api_call = 'http://localhost/api/v1/habpop/stategons/?geom='+geom+'&callback=?'; 
            //deactivate point control and activate navigation
                pointControl.deactivate();
                navControl.activate();
    };   

    function birdInfoClick(spp)
    {
       var sppInfo = '';
       sppInfo += '<div class="birdinfoPopup"><table><tr>';
      // sppInfo += '  <td> <img src="" width="100px" /></td>';
       sppInfo += '<td>';
       sppInfo += '   <h3>InterMountain West Joint Venture</h3>';
       sppInfo += '</td></tr></table>';
       sppInfo += '<br />';
       sppInfo += '<table>';
       sppInfo += '  <tr><td><img src="http://'+__BASEHOST+'/partners/iwjv/uploads/img/'+spp+'Info.png"  style="vertical-align:middle"/></td></tr>';
       sppInfo += '</table>';
       sppInfo += '<div />';
    
        myWindow=window.open('','','location=no, width=950,height=800');
        myWindow.document.write(sppInfo);
        myWindow.focus();
     /*  
      birdPopup = new GeoExt.Popup({
                title: 'IWJV Species Info',
                anchored: false,
                width:500,
                height: 420,
                map: gxmap,
                html: sppInfo,
                bodyCssClass: 'mapPopup',
                maximizable: true,
                draggable: true,
                collapsible: true,
                unpinnable: false,
                closeAction: 'hide'
        }); 
      */  
    }