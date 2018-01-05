// Store our API endpoint inside queryUrl

// not enough data in this one
// var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";
// too much data in this one
// var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);

});

function getColor(mag) {
  return mag >= 5  ? '#B10026' :
         mag >= 4  ? '#e31a1c' :
         mag >= 3  ? '#fc4e2a' :
         mag >= 2  ? '#fd8d3c' :
         mag >= 1  ? '#feb24c' :
                    '#fed976';
}
var austin = new L.layerGroup();

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
    // circle.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr>Magnitude: " + feature.properties.mag +
      "<p>" + new Date(feature.properties.time) + "</p>");
      // console.log("feature",feature);
      // console.log("layer",layer);
      // why can't i create markers here?
      // L.circle([earthquakeData[i].geometry.coordinates[1],earthquakeData[i].geometry.coordinates[0]], {
      //   stroke: false,
      //   fillOpacity: 0.75,
      //   color: getColor(earthquakeData[i].properties.mag),
      //   fillColor: getColor(earthquakeData[i].properties.mag),
      //   radius: Math.pow(earthquakeData[i].properties.mag,3) * 1000
      // }).bindPopup("<h3>" + earthquakeData[i].properties.place +
      // "</h3><hr>Magnitude: " + earthquakeData[i].properties.mag +
      // "<p>" + new Date(earthquakeData[i].properties.time) + "</p>")

  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });

  earthquakeMarkers = []
  // console.log("earthquakeData.length",earthquakeData.length);
  for (var i = 0; i < earthquakeData.length; i++) {
    // console.log(earthquakeData[i]);
    earthquakeMarkers.push(
      L.circle([earthquakeData[i].geometry.coordinates[1],earthquakeData[i].geometry.coordinates[0]], {
        stroke: false,
        fillOpacity: 0.75,
        color: getColor(earthquakeData[i].properties.mag),
        fillColor: getColor(earthquakeData[i].properties.mag),
        radius: Math.pow(earthquakeData[i].properties.mag,3) * 1000
      }).bindPopup("<h3>" + earthquakeData[i].properties.place +
      "</h3><hr>Magnitude: " + earthquakeData[i].properties.mag +
      "<p>" + new Date(earthquakeData[i].properties.time) + "</p>")
    );
  }


  // Sending our earthquakes layer to the createMap function
  // console.log("earthquakes",earthquakes);
  createMap(earthquakeMarkers);
}

function createMap(earthquakeMarkers) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2pnMzEwIiwiYSI6ImNpdGRjbWhxdjAwNG0yb3A5b21jOXluZTUifQ." +
    "T6YbdDixkOBWH_k9GbS8JQ");

  // Define a baseMaps object to hold our base layers
  // var baseMaps = {
  //   "Street Map": streetmap,
  //   "Dark Map": darkmap
  // };

  // Create overlay layer groups
  var significantEarthquakes = L.layerGroup(earthquakeMarkers);

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    //"PopupsEarthquakes": earthquakes,
    "Earthquakes": significantEarthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -120.105
    ],
    zoom: 4,
    // layers: [streetmap, earthquakes, significantEarthquakes]
    layers: [darkmap, significantEarthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  // L.control.layers(baseMaps, overlayMaps, {
  //   collapsed: false
  // }).addTo(myMap);

  var legend = L.control({position: 'bottomright'});
  
  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
      magnitudes = [0, 1, 2, 3, 4, 5],
      labels = [];
      div.innerHTML = "Magnitude<br>"
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < magnitudes.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(magnitudes[i]) + '"></i> ' +
              magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
  }
  
  return div;
  };
  
  legend.addTo(myMap);

// add a title
var title = L.control()

title.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    div.innerHTML = "Earthquakes which occurred in the last 7 Days"
    return div;
};

title.addTo(myMap);

}
