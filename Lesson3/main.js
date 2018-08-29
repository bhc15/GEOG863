var coords = [34.852619, -82.394012];

require([
      "esri/Map",
      "esri/views/MapView",
      "esri/geometry/Point",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/Graphic",
      "dojo/domReady!"
    ], function(Map, MapView, Point, SimpleMarkerSymbol, Graphic) {

      var myMap = new Map({
        basemap: "streets"
      });

      var myView = new MapView({
        container: "viewDiv",
        map: myMap,
        zoom: 4,
        center: [coords[1], coords[0] // longitude, latitude
      });
      
      var pt = new Point({
            latitude: coords[0],
            longitude: coords[1] 
      });
      
      var sym = new SimpleMarkerSymbol({
            color: "blue",
            style: "square",
            size: 12
      });
      
      var ptGraphic = new Graphic({
            geometry: pt,
            symbol: sym
      });
      
      myView.graphics.add(ptGraphic);
    });
