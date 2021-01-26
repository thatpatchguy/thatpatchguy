//Creating mapbox map layers

var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
});

var satmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-streets-v11",
    accessToken: API_KEY
});

//Creating map centered on US with majority of data
var myMap = L.map("map", {
    center: [
    37.09, -95.71
    ],
    zoom: 4,
    layers: [streetmap, satmap]
});

var baseMaps = {
    Satellite: satmap,
    Street: streetmap
};

var earthquakes = new L.LayerGroup();
var tectonic = new L.LayerGroup();

var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tectonic
};

//Create layer control
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

//Finding date 10 days ago for query
var date = new Date();
var tenDaysPrior = date.getDate() - 10;
date.setDate(tenDaysPrior);
var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
//Creating query url
var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?" +
    "format=geojson&starttime="+ dateString +
    "&minmagnitude=2.5";


var geoJSON;
//Legend creation
var legend = L.control({
  position: "bottomright"
});

legend.onAdd = function() {
  var newDiv = L.DomUtil.create("div", "info legend");

  var mags = ["<1","1-2","2-3","3-4","4-5","5-6",">6"];
  var colors = ["#2C8000", "#6EAA00","#C4D504","#FFD20B","#FF9B46","#FF8F88","#FF4F48"];
  newDiv.innerHTML = "";
  for (var i = 0; i < mags.length; i++){
    newDiv.innerHTML += `<div style="background-color:${colors[i]}">${mags[i]}</div>`;
  }

  return newDiv;
}

legend.addTo(myMap);

var title = L.control({
  position: "bottomleft"
});

title.onAdd = function() {
  var titleDiv = L.DomUtil.create("div", "info legend");

  titleDiv.innerHTML = `<h1>Earthquake activity since ${dateString}</h1>`;

  return titleDiv;
};

title.addTo(myMap);


//Functions to decide on circle size and color
function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "black",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  };

//Makes the fill different colors based upon the magnitude
function getColor(magnitude) {
  switch (true) {
    case magnitude > 6:
      return "#FF4F48";
    case magnitude > 5:
      return "#FF8F88";
    case magnitude > 4:
      return "#FF9B46";
    case magnitude > 3:
      return "#FFD20B";
    case magnitude > 2:
      return "#C4D504";
    case magnitude > 1:
      return "#6EAA00";
    default:
      return "#2C8000";
  }
};


// Makes circle bigger based on magnitude

function getRadius(magnitude) {
  if (magnitude === 0) {
    return 1;
  }

    return magnitude * 3.5;
};


//Function called in earthquake query to create each circle
function createFeatures(earthquakeData) {
    L.geoJSON((earthquakeData), {
        pointToLayer: function(feature, latlng){
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: function(feature,layer){
            var d = new Date(0);
            d.setUTCMilliseconds(feature.properties.time);
            layer.bindPopup(feature.properties.place + "<hr>" + d + "<hr>Magnitude: " + feature.properties.mag);
        }
    }).addTo(earthquakes);

    earthquakes.addTo(myMap);

}
d3.json(queryUrl, function(data) {
    createFeatures(data.features);
})


//Creates tectonic lines on the map
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
  function(tecData){

    L.geoJSON(tecData, {
      color: "blue",
      weight: 1.5
    }).addTo(tectonic);

    tectonic.addTo(myMap);
  });
