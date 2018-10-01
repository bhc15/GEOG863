// load Map, MapView, UniqueValueRenderer, FeatureLayer, Legend, Search, Home, BasemapToggle, and ScaleBar modules
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/renderers/UniqueValueRenderer",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/widgets/Search",
    "esri/widgets/Home",
    "esri/widgets/BasemapToggle",
    "esri/widgets/ScaleBar",
    "dojo/domReady!"
],
    function (Map, MapView, UniqueValueRenderer, FeatureLayer, Legend, Search, Home, BasemapToggle, ScaleBar) {

        var stateSelect = document.getElementById("state-select")
        var typeSelect = document.getElementById("type-select");
        var panel = document.getElementById("paneDiv");
        var stationResults = document.getElementById("results-summary");
        var sideBar = document.getElementById("sideBar");

        // create Unique Value renderer
        var fuelRenderer = new UniqueValueRenderer({
            field: "Fuel_Type_Code",
            legendOptions: { title: "Fuel Station Type" }
        });

        // declare function for adding unique values to renderer
        var addClass = function (val, col, lbl, renderer) {
            var sym = {
                type: "simple-marker",
                color: col,
                size: "8px"
            }
            renderer.addUniqueValueInfo({
                value: val,
                symbol: sym,
                label: lbl
            });
        }

        // call function for each station type
        addClass("ELEC", "#ffff33", "Electric", fuelRenderer);
        addClass("E85", "#4daf4a", "E85 Ethanol", fuelRenderer);
        addClass("BD", "#a65628", "Biodiesel", fuelRenderer);
        addClass("LPG", "#377eb8", "Liquid Propane Gas", fuelRenderer);
        addClass("LNG", "#e41a1c", "Liquid Natural Gas", fuelRenderer);
        addClass("CNG", "#ff7f00", "Compressed Natural Gas", fuelRenderer);
        addClass("HY", "#984ea3", "Hydrogen", fuelRenderer);

        // create FeatureLayer instance from feature service
        var fuelStations = new FeatureLayer({
            url: "https://services3.arcgis.com/EvmgEO8WtpouUbyD/arcgis/rest/services/alt_fuel_stations_(May_15_2017)/FeatureServer/0",
            outFields: ["Station_Name", "Fuel_Type_Code", "Street_Address", "City", "State", "ZIP", "Station_Phone", "Access_Days_Time"],
            renderer: fuelRenderer,
            visible: false
        });

        // create Map instance
        var myMap = new Map({
            basemap: "streets",
            layers: [fuelStations]
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

        // populate state dropdown list by querying all features in layer
        myView.when(function () {
            return fuelStations.when(function () {
                return fuelStations.queryFeatures();
            });
        })
            .then(getValues)
            .then(getUniqueValues)
            .then(addToSelect)

        // return array of all states in layer
        function getValues(response) {
            var features = response.features;
            var values = features.map(function (feature) {
                return feature.attributes.State;
            });
            return values;
        }

        // return array of unique state values
        function getUniqueValues(values) {
            var uniqueValues = [];

            values.forEach(function (item) {
                if ((uniqueValues.length < 1 || uniqueValues.indexOf(item) === -1) &&
                    (item !== "")) {
                    uniqueValues.push(item);
                }
            });
            return uniqueValues;
        }

        // add unique values to state select element
        function addToSelect(values) {
            values.sort();
            values.forEach(function (value) {
                var option = document.createElement("option");
                option.text = value;
                stateSelect.add(option)
            });
        }

        // add event listener for when dropdown lists are changed & execute query when state or station type change
        stateSelect.addEventListener("change", function () {
            queryStations();
        })
        typeSelect.addEventListener("change", function () {
            queryStations();
        })

        var graphics = [];

        addWidgets();

        // filter stations based on criteria
        function queryStations() {
            myView.ui.empty("top-right");
            sideBar.innerHTML = "";

            var whereClause = "STATE = '" + stateSelect.value + "' AND " + typeSelect.value;
            fuelStations.definitionExpression = whereClause;

            fuelStations.queryFeatureCount().then(function (numFeatures) {
                stationResults.innerHTML = "There are " + numFeatures + " alternative fuel stations in " + stateSelect.value +
                    " that match the selected station type.";
                panel.style.display = "initial";
                fuelStations.visible = true;

                var header = document.createElement("h4");
                header.textContent = "Fuel Stations (" + numFeatures + ")";
                sideBar.appendChild(header);
                sideBar.style.visibility = "visible";

                // create results table
                fuelStations.queryFeatures().then(function (results) {

                    // sort results alphabetically by station name
                    results.features.sort(function (a, b) {
                        if (a.attributes.Station_Name < b.attributes.Station_Name) {
                            return -1;
                        }
                        if (a.attributes.Station_Name > b.attributes.Station_Name) {
                            return 1;
                        }
                        return 0;
                    });

                    // create table element & clear graphics array
                    var table = document.createElement("table");
                    graphics = [];

                    // create table row and cell for each station name
                    results.features.forEach(function (result, index) {
                        graphics.push(result);
                        var tr = document.createElement("tr");
                        var td = document.createElement("td");
                        td.className = "cell";
                        td.tabIndex = 0;
                        td.setAttribute("data-result-id", index);
                        var text = document.createTextNode(result.attributes.Station_Name);
                        td.appendChild(text);
                        tr.appendChild(td);
                        table.appendChild(tr);
                    });
                    sideBar.appendChild(table);
                    stationResults.addMany(graphics);
                });
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
                        label: "Phone Number",
                    },
                    {
                        fieldName: "Access_Days_Time",
                        label: "Accessibility"
                    }]
                }]
            };

            fuelStations.popupTemplate = popUp;

            // change View to center and zoom in on state specified by user
            fuelStations.queryExtent().then(function (results) {
                myView.goTo({
                    target: results.extent,
                    zoom: 6
                })
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
                    placeholder: "Enter a station search term (e.g., name, city, zipcode)",
                }]
            });
            myView.ui.add(searchWidget, "top-right");
        }

        function addWidgets() {
            // create Legend widget instance and add to View
            var legend = new Legend({
                view: myView,
                layerInfos: [{
                    layer: fuelStations,
                    title: false
                }]
            });
            myView.ui.add(legend, "bottom-left");

            // create BasemapToggle widget instance and add to View
            var toggle = new BasemapToggle({
                view: myView,
                nextBasemap: "gray"
            });
            myView.ui.add(toggle, "bottom-right", 0);

            // create ScaleBar widget instance and add to View
            var scaleBar = new ScaleBar({
                view: myView,
                style: "line",
                unit: "non-metric"
            });
            myView.ui.add(scaleBar, "bottom-right");

            // create Home widget instance and add to View
            var homeWidget = new Home({
                view: myView
            });
            myView.ui.add(homeWidget, "top-left");
        }

        // add event listener to open popup for station selected from results table 
        sideBar.addEventListener("click", function () {
            var target = event.target;
            var resultId = target.getAttribute("data-result-id");

            var result = resultId && graphics && graphics[parseInt(resultId, 10)];

            if (result) {
                myView.popup.open({
                    features: [result],
                    location: result.geometry
                });
            }
        });
    });

