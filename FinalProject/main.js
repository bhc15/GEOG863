// load Map, MapView, FeatureLayer, colorRendererCreator, Legend, Home, ScaleBar, and Standby modules
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/renderers/smartMapping/creators/color",
    "esri/widgets/Legend",
    "esri/widgets/Home",
    "esri/widgets/ScaleBar",
    "dojox/widget/Standby",
    "dojo/domReady!"
],
    function (Map, MapView, FeatureLayer, colorRendererCreator, Legend, Home, ScaleBar, Standby) {
        var sidePane = document.getElementById("sidePane");
        var chart = document.getElementById("chart");
        var ageSelect = document.getElementById("age-group");
        var button = document.getElementById("button");

        // create FeatureLayer instance from feature service
        var voterTurnout = new FeatureLayer({
            url: "https://services1.arcgis.com/VA8qSG2eGMxXGKnw/arcgis/rest/services/US_voter_turnout_2016/FeatureServer/0",
            visible: true
        });

        // create Map instance
        var myMap = new Map({
            basemap: "gray",
            layers: [voterTurnout]
        });

        // create MapView instance
        var myView = new MapView({
            container: "viewDiv",
            map: myMap,
            center: [-110, 47],
            zoom: 4,
            popup: {
                autoCloseEnabled: true
            }
        });

        // create Standby widget instance
        var standby = new Standby({
            target: "viewDiv",
            color: null
        });
        document.body.appendChild(standby.domNode);
        standby.startup();

        // when view loads, generate renderer and add widgets
        myView.when(function () {
            generateRenderer();
            addWidgets();
        });

        // add event listeners for when user changes age group, clicks show chart button, hovers over chart
        ageSelect.addEventListener("change", generateRenderer);
        button.addEventListener("click", showChart);
        chart.addEventListener("mouseover", onChartHover);
        chart.addEventListener("mouseout", function () {
            myView.popup.close();
        });

        function generateRenderer() {
            standby.show();
            fieldLabel = ageSelect.options[ageSelect.selectedIndex].text;
            fieldName = ageSelect.value;

            // parameters for color renderer creator
            var params = {
                layer: voterTurnout,
                field: fieldName,
                classificationMethod: "natural-breaks",
                basemap: "gray",
                theme: "high-to-low",
                defaultSymbolEnabled: false,
                legendOptions: {
                    title: "% Voter Turnout Among Ages " + fieldLabel
                }
            };

            colorRendererCreator.createClassBreaksRenderer(params)
                .then(function (response) {
                    voterTurnout.renderer = response.renderer;
                });

            definePopup(fieldName);
            createChart(fieldLabel, fieldName);
        }

        function definePopup(fieldName) {
            fieldName = fieldName.toUpperCase();

            // object of field names associated with each age group
            var fields = {
                PER_VOTED: ["{TOT_VOTED}", "{TOT_POP}", "18+"],
                PER_VOTED_18_24: ["{TOT_VOTED_18_24}", "{TOT_POP_18_24}", "18-24"],
                PER_VOTED_25_34: ["{TOT_VOTED_25_34}", "{TOT_POP_25_34}", "25-34"],
                PER_VOTED_35_44: ["{TOT_VOTED_35_44}", "{TOT_POP_35_44}", "35-44"],
                PER_VOTED_45_64: ["{TOT_VOTED_45_64}", "{TOT_POP_45_64}", "45-64"],
                PER_VOTED_65: ["{TOT_VOTED_65}", "{TOT_POP_65}", "65+"]
            };

            // create PopupTemplate 
            var popUp = {
                title: "<h3>{NAME}</h3>",
                content: "<p>In the 2016 election, voter turnout by the " + fields[fieldName][2] + " age group was <b>{" + fieldName + "} percent.</b><br/><br/>" +
                    "Approximately <b>" + fields[fieldName][0] + ",000</b> votes were cast by people in this age group.<br/><br/>" +
                    "An estimated <b>" + fields[fieldName][1] + ",000</b> citizens in this age group were eligible to vote.</p>"
            };
            voterTurnout.popupTemplate = popUp;
        }

        function createChart(fieldLabel, fieldName) {
            var title = document.getElementById("title");
            chart.innerHTML = "";
            title.innerHTML = "<h4>Age Group: " + fieldLabel + "</h4>";

            // create definition object for chart 
            var definition = {
                type: "bar-horizontal",
                datasets: [
                    {
                        url: "https://services1.arcgis.com/VA8qSG2eGMxXGKnw/arcgis/rest/services/US_voter_turnout_2016/FeatureServer/0",
                        query: {
                            orderByFields: fieldName + " DESC"
                        }
                    }
                ],
                series: [
                    {
                        category: { field: "Name" },
                        value: { field: fieldName, label: "Percent Voted" }
                    }
                ]
            };

            var cedarChart = new cedar.Chart("chart", definition);
            cedarChart.show();
            standby.hide();
        }

        function showChart() {
            var span = document.getElementById("span");

            // if chart is hidden, show chart and change button text
            if (sidePane.style.visibility == "hidden" | sidePane.style.visibility == "") {
                sidePane.style.visibility = "initial";
                sidePane.style.opacity = 1;
                span.innerHTML = "Hide Chart";
            }

            // if chart is shown, hide chart and reset button text
            else {
                sidePane.style.visibility = "hidden";
                sidePane.style.opacity = 0;
                span.innerHTML = "Show Chart";
            }
        }

        function onChartHover(e) {
            // if chart is visible, get state name from mouse location
            if (sidePane.style.visibility == "initial") {
                var text = e.target.innerHTML;

                if (text == text.toUpperCase() && text != "") {
                    var state = text;
                    var query = voterTurnout.createQuery();
                    query.where = "NAME = '" + state + "'";

                    // query features based on state name
                    voterTurnout.queryFeatures(query).then(function (result) {
                        // open popup for state
                        myView.popup.open({
                            features: result.features,
                            location: {
                                type: "point",
                                longitude: result.features[0].geometry.centroid.x,
                                latitude: result.features[0].geometry.centroid.y
                            }
                        });
                    });
                }
            }
        }

        function addWidgets() {
            // create Legend widget instance and add to View
            var legend = new Legend({
                view: myView,
                layerInfos: [{
                    layer: voterTurnout,
                    title: false
                }]
            });
            myView.ui.add(legend, "bottom-left");

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
    });

