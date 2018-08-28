 require([
      "esri/Map",
      "esri/views/SceneView",
      "dojo/domReady!"
    ], function(Map, SceneView) {

      var map = new Map({
        basemap: "streets",
        ground: "world-elevation"
      });

      var view = new SceneView({
        container: "viewDiv",
        map: map,
        scale: 30000000,
        center: [-90, 45]
      });

    });
