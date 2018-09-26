
// load Map, MapView, FeatureLayer, Legend, and Home modules
require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend",
  "esri/widgets/Home",
  "dojo/domReady!"
], function (Map, MapView, FeatureLayer, Legend, Home) {

  // create layer renderer
  var renderer = {
    type: "simple", // autocasts as new SimpleRenderer
    symbol: {
      type: "simple-marker",  //autocasts as new SimpleMarkerSymbol
      color: "#ffff80",
      style: "circle"
    },
    visualVariables: [{
      type: "size",
      field: "ENPLANEMEN",
      legendOptions: {
        title: "Passenger Boardings"
      },
      stops: [
        {
          value: 1000000,
          size: "2.5px",
          label: "≤ 1 million"
        },
        {
          value: 10000000,
          size: "25px",
          label: "10 million"
        },
        {
          value: 40000000,
          size: "100px",
          label: "≥ 40 million"
        }]
    }]
  };

  // create PopupTemplate 
  var popUp = { // autocasts as new PopupTemplate
    title: "<h3>{NAME} ({FAA_ID})</h3>",
    content: [{
      type: "text",
      text: "<p style='font-size:11pt'><b>Location: </b>&nbsp;{CITY}, {STATE}</br>" +
        "<b>Owner Type: </b>&nbsp;{OWNER}</br>" +
        "<b>Number of Boardings: </b>&nbsp;{ENPLANEMEN}</br></br></p>"
    },
    {
      type: "media",
      mediaInfos: [{
        title: "<b>Number of flights</b>",
        type: "pie-chart",
        value: {
          theme: "WatersEdge",
          fields: ["ARRIVALS", "DEPARTURES"]
        }
      }]
    }],
    fieldInfos: [{
      fieldName: "ENPLANEMEN",
      format: {
        digitSeparator: true,
        places: 0
      }
    },
    {
      fieldName: "ARRIVALS",
      format: {
        digitSeparator: true,
        places: 0
      },
    },
    {
      fieldName: "DEPARTURES",
      format: {
        digitSeparator: true,
        places: 0
      }
    }]
  };

  // create FeatureLayer instance
  var airportLayer = new FeatureLayer({
    url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Airports_by_scale/FeatureServer/1",
    renderer: renderer,
    outFields: ["FAA_ID", "NAME", "CITY", "STATE", "OWNER", "ARRIVALS", "DEPARTURES", "ENPLANEMEN"],
    popupTemplate: popUp
  });

  // create Map instance
  var myMap = new Map({
    basemap: "dark-gray",
    layers: [airportLayer]
  });

  // create MapView instance
  var myView = new MapView({
    container: "viewDiv",
    map: myMap,
    zoom: 4,
    center: [-110, 39],
    popup: {
      autoCloseEnabled: true,
      dockEnabled: true,
      dockOptions: {
        buttonEnabled: true,
        position: "top-right",
      }
    }
  });

  // create Legend instance and add to View
  var legend = new Legend({
    view: myView,
    layerInfos: [{
      layer: airportLayer,
      title: "Annual Airport Traffic (2014)"
    }]
  });
  myView.ui.add(legend, "bottom-left");

  // create Home widget instance and add to View
  var homeWidget = new Home({
    view: myView
  });
  myView.ui.add(homeWidget, "top-left");

}); 
