// Declare variables
var url = 'data/all_week.geojson';

// Store our API endpoint as queryUrl.
// Selection based on all earthquakes for the last 30 days
var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';

// Change the color based on the feature's earthquake depth
var cats = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];
var colors = ['GreenYellow', 'Cyan', 'Tan', 'Salmon', 'Orange', 'Red'];

// Function to get color based on depth
function getColor(d) {
  // The list index starts with 0
  return d > 90 ? colors[5] :
         d > 70 ? colors[4] :
         d > 50 ? colors[3] :
         d > 30 ? colors[2] :
         d > 10 ? colors[1] :
         colors[0];
}

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array
  // Give each feature a popup that describes the place and time of the earthquake
  function doOnEachFeature(feature, layer) {
    // Each point has a tooltip with the magnitude, location, and depth
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><ul><li>Earthquake Magnitude: ${feature.properties.mag}</li><li>Earthquake Depth: ${feature.geometry.coordinates[2]}</li></ul>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
      return new L.CircleMarker(latlng, {
        // Data points scale with magnitude level
        radius: feature.properties.mag * 3,
        // Data points colors change with depth level
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: 'black',
        weight: 0.2,
        opacity: 0.8,
        fillOpacity: 0.8
      });
    },
    onEachFeature: doOnEachFeature
  });

  // Send our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Create the base layers
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  var dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  });

  // Create a baseMaps object
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "Dark Map": dark
  };

  // Create an overlay object to hold our overlay
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var map = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [street, earthquakes]
  });

  // Create a legend to add to the map
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend');
    for (var i = 0; i < cats.length; i++) {
      var item = `<li style='background: ${colors[i]}'></li> ${cats[i]}<br>`;
      div.innerHTML += item;
    }
    return div;
  };

  legend.addTo(map);

  // Create a layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);
}
