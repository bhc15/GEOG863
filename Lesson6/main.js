// prompt user for state
var state = prompt("Please enter a state postal abbreviation (e.g., PA):").toUpperCase();

if (state != "") {

    // load Map, MapView, FeatureLayer, SimpleMarkerSymbol, GraphicsLayer, Query, Search, and Home modules
    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/layers/GraphicsLayer",
        "esri/tasks/support/Query",
        "esri/widgets/Search",
        "esri/widgets/Home",
        "dojo/domReady!"
    ], function (Map, MapView, FeatureLayer, SimpleMarkerSymbol, GraphicsLayer, Query, Search, Home) {

        // declare variable for state where clause
        var whereClause = "STATE = '" + state + "'";

        // create Map instance
        var myMap = new Map({
            basemap: "streets"
        });

        // create MapView instance
        var myView = new MapView({
            container: "viewDiv",
            map: myMap,
            center: [-100, 40],
            zoom: 4,
            popup: {
                autoCloseEnabled: true,
                dockEnabled: true,
            }
        });

        // create PopupTemplate 
        var popUp = { // autocasts as new PopupTemplate
            title: "<h3>{Station_Name}</h3>",
            content: [{
                type: "fields",
                fieldInfos: [{
                    fieldName: "Fuel_Type_Code",
                    label: "Fuel Type"
                },
                {
                    fieldName: "Street_Address",
                    label: "Street Address"
                },
                {
                    fieldName: "City"
                },
                {
                    fieldName: "State"
                },
                {
                    fieldName: "ZIP"
                },
                {
                    fieldName: "Station_Phone",
                    label: "Phone Number"
                },
                {
                    fieldName: "Access_Days_Time",
                    label: "Accessibility"
                }]
            }]
        };

        // create FeatureLayer instance from feature service
        var fuelStations = new FeatureLayer({
            url: "https://services3.arcgis.com/EvmgEO8WtpouUbyD/arcgis/rest/services/alt_fuel_stations_(May_15_2017)/FeatureServer/0",
            visible: false,
            popupTemplate: popUp
        });

        // create empty GraphicsLayer instance
        var resultsLayer = new GraphicsLayer({
        });

        myMap.addMany([fuelStations, resultsLayer]);

        // create Query instance
        var stateQuery = new Query({
            where: whereClause,
            returnGeometry: true,
            outFields: ["Station_Name", "Fuel_Type_Code", "Street_Address", "City", "State", "ZIP", "Station_Phone", "Access_Days_Time"]
        });

        // query features and then display results
        fuelStations.when(function () {
            return fuelStations.queryFeatures(stateQuery);
        }).then(displayResults);

        function displayResults(results) {

            if (results.features[0] != null) {

                var stationFeatures = results.features.map(function (graphic) {
                    graphic.symbol = new SimpleMarkerSymbol({
                        type: "simple-marker",
                        size: "12px"
                    });

                    switch (graphic.attributes["Fuel_Type_Code"]) {
                        case "ELEC":
                            graphic.symbol.color = "#ffff33";
                            break;
                        case "E85":
                            graphic.symbol.color = "#4daf4a";
                            break;
                        case "BD":
                            graphic.symbol.color = "#a65628";
                            break;
                        case "LPG":
                            graphic.symbol.color = "#377eb8";
                            break;
                        case "LNG":
                            graphic.symbol.color = "#e41a1c";
                            break;
                        case "CNG":
                            graphic.symbol.color = "#ff7f00";
                            break;
                        case "HY":
                            graphic.symbol.color = "#984ea3";
                    }
                    return graphic;
                });
                resultsLayer.addMany(stationFeatures);

                // change View to center and zoom in on state specified by user
                fuelStations.queryExtent(stateQuery).then(function (results) {
                    myView.goTo({
                        target: results.extent,
                        zoom: 6
                    })
                });
                // show alert with number of stations for the state
                fuelStations.queryFeatureCount(stateQuery).then(function (count) {
                    setTimeout(function () {
                        alert("There are " + count + " alternative fuel stations in " + state + ".")
                    }, 500)
                });

                // create Search widget instance and add to View
                var searchWidget = new Search({
                    view: myView,
                    includeDefaultSources: false,
                    locationEnabled: false,
                    sources: [{
                        featureLayer: fuelStations,
                        searchFields: ["Station_Name", "City", "ZIP"],
                        displayField: "Station_Name",
                        filter: {
                            where: whereClause
                        },
                        exactMatch: false,
                        name: "Alternative Fuel Stations",
                        placeholder: "Enter a station search term (e.g., name, city, zipcode)",
                        resultSymbol: {
                            type: "simple-marker",
                            size: "24px",
                            style: "diamond",
                            color: "aqua"
                        },
                    }]
                });
                myView.ui.add(searchWidget, "top-right");
            }

            else {
                alert("There are no alternative fuel stations in the state you specified: " + state + ". Please make sure that is a valid state.");
                location.reload(true);
            }

        }

        // create Home widget instance and add to View
        var homeWidget = new Home({
            view: myView
        });
        myView.ui.add(homeWidget, "top-left");

    });
}

// if a state is not entered, show alert and reload page
else {
    alert("Please enter a state.");
    location.reload(true);
}