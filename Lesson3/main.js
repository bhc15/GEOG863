var coords = [-82.394012, 34.852619]; // coordinates of my hometown

// load Map, MapView, Point, SimpleMarkerSymbol, and Graphic modules
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/geometry/Point",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/Graphic",
    "dojo/domReady!"
], function (Map, MapView, Point, SimpleMarkerSymbol, Graphic) {

    // create Map instance
    var myMap = new Map({
        basemap: "streets"
    });
    // create Point instance  
    var pt = new Point({
        latitude: coords[1],
        longitude: coords[0]
    });
    // create MapView instance
    var myView = new MapView({
        container: "viewDiv",
        map: myMap,
        zoom: 5,
        center: pt
    });
    // create SimpleMarkerSymbol instance  
    var sym = new SimpleMarkerSymbol({
        color: "blue",
        style: "square",
        size: 12
    });
    // create Graphic instance  
    var ptGraphic = new Graphic({
        geometry: pt,
        symbol: sym
    });
    // add Graphic object to MapView  
    myView.graphics.add(ptGraphic);
});