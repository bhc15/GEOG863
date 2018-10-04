require([
    "esri/Map",
    "esri/views/SceneView",
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/tasks/Geoprocessor",
    "esri/tasks/support/FeatureSet",
    "dojo/domReady!"
],
    function (Map,
        SceneView,
        GraphicsLayer,
        Graphic,
        Point,
        Geoprocessor,
        FeatureSet) {

        var days = document.getElementById("num-days");
        var loading = document.getElementById("loading-message");

        var gpUrl =
            "https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_Currents_World/GPServer/MessageInABottle";

        var myMap = new Map({
            basemap: "satellite"
        });

        var myView = new SceneView({
            container: "viewDiv",
            map: myMap,
            center: [-40, 15],
            zoom: 3
        });

        var bottlePathLyr = new GraphicsLayer();
        myMap.add(bottlePathLyr);

        var ptSym = {
            type: "simple-marker",
            color: [255, 255, 255]
        };

        var pathSym = {
            type: "simple-line",
            color: [255, 255, 255],
            width: 2
        };

        var gp = new Geoprocessor(gpUrl);

        myView.on("click", findBottlePath);

        function findBottlePath(event) {
            loading.style.display = "initial";
            bottlePathLyr.removeAll();

            var pt = new Point({
                longitude: event.mapPoint.longitude,
                latitude: event.mapPoint.latitude
            });

            var ptGraphic = new Graphic({
                geometry: pt,
                symbol: ptSym
            });

            bottlePathLyr.add(ptGraphic);

            var features = [];
            features.push(ptGraphic);
            var featureSet = new FeatureSet();
            featureSet.features = features;

            var params = {
                "Input_Point": featureSet,
                "Days": days.value
            };
            gp.execute(params).then(drawPath);
        }

        function drawPath(gpResponse) {
            var bottlePath = gpResponse.results[0].value.features;

            var bottlePathGraphics = bottlePath.map(function (line) {
                line.symbol = pathSym;
                return line;
            });

            bottlePathLyr.addMany(bottlePathGraphics);

            view.goTo({
                target: bottlePathGraphics
            });

            loading.style.display = "none";

        }
    });