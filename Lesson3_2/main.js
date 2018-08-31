var coords = [34.852619, -82.394012]; // coordinates of my hometown

// load Map, MapView, Point, SimpleMarkerSymbol, and Graphic modules
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/geometry/Point",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/Graphic",
    "esri/PopupTemplate",
    "dojo/domReady!"
    ], function(Map, MapView, Point, SimpleMarkerSymbol, Graphic, PopupTemplate) {
	
	// create Map instance
    var myMap = new Map({
		basemap: "streets"
      });
	// create MapView instance
    var myView = new MapView({
        container: "viewDiv",
        map: myMap,
        zoom: 5,
        center: [coords[1], coords[0]] // longitude, latitude
      });
    // create Point instance  
    var pt = new Point({
            latitude: coords[0],
            longitude: coords[1] 
      });
    // create SimpleMarkerSymbol instance  
    var sym = new SimpleMarkerSymbol({
            color: "blue",
            style: "square",
            size: 12
      });
    // create PopupTemplate instance  
    var popUp = new PopupTemplate({
          title: "<h3>Greenville, South Carolina</h3><hr/>",
          content: "<p style='font-size:11pt'><strong>Incorporated:</strong> &nbsp;1831</br>" +
          "<strong>Population (2017):</strong> &nbsp;68,219</br>" +
          "<strong>Median Household Income (2016):</strong> &nbsp;$45,360</br>" +
          "<strong>Mayor:</strong> &nbsp;Knox H. White</br></br>" +
          "<figure><a href='https://www.greenvillesc.gov' target='_blank'>" + 
          "<img src='https://farm3.staticflickr.com/2923/14175742446_1b07f61d12_z_d.jpg' alt='Falls Park'></a>" + 
          "<figcaption>Falls Park in Downtown Greenville (credit: <a href='https://www.flickr.com/photos/mdleake/' target='_blank'>miknx</a>)" + 
          "</figcaption></figure></p>"  
      });
    // create Graphic instance  
    var ptGraphic = new Graphic({
            geometry: pt,
            symbol: sym,
            popupTemplate: popUp
      });
    // add Graphic object to MapView 
    myView.graphics.add(ptGraphic);
});