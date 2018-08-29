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
        center: [-90, 40] // longitude, latitude
      });
      
      var pt = new Point({
            latitude: 40.792,
            longitude: -77.871 
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
