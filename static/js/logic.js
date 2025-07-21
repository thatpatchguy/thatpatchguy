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

// EMSC query URL (using same start date)
var emscUrl = "https://www.seismicportal.eu/fdsnws/event/1/query?format=geojson&starttime=" + dateString + "&minmag=2.5";


var geoJSON;
//Legend creation
var legend = L.control({
  position: "bottomright"
});

legend.onAdd = function() {
  var newDiv = L.DomUtil.create("div", "info legend");

  var mags = ["2.5–3.0", "3.0–3.5", "3.5–4.0", "4.0–4.5", "4.5–5.0", "5.0–5.5", "5.5–6.0", ">6.0"];
  var colors = ["#2C8000", "#6EAA00", "#C4D504", "#FFD20B", "#FF9B46", "#FF8F88", "#FF4F48", "#B20000"];
  newDiv.innerHTML = "";
  for (var i = 0; i < mags.length; i++){
    newDiv.innerHTML += `<div style="background-color:${colors[i]}">${mags[i]}</div>`;
  }

  return newDiv;
}

legend.addTo(myMap);

// Helper to get date string N days ago
function getDateString(daysAgo) {
    var date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
        .toISOString()
        .split("T")[0];
}

// Refactored function to fetch and display data
function fetchAndDisplayEarthquakes(daysAgo) {
    var dateString = getDateString(daysAgo);
    var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?" +
        "format=geojson&starttime="+ dateString +
        "&minmagnitude=2.5";
    var emscUrl = "https://www.seismicportal.eu/fdsnws/event/1/query?limit=100&start=" + dateString + "&minmag=2.5";

    // Clear previous earthquakes
    earthquakes.clearLayers();

    Promise.all([
        fetch(queryUrl).then(res => res.json()),
        fetch(emscUrl)
            .then(res => res.text())
            .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
    ]).then(function([usgsData, emscXml]) {
        var usgsFeatures = usgsData && usgsData.features ? usgsData.features : [];
        console.log('USGS Query URL:', queryUrl);
        console.log('USGS Raw Data:', usgsData);
        function emscXmlToGeoJson(xml) {
            var features = [];
            var events = xml.getElementsByTagName('event');
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var lat = parseFloat(event.getElementsByTagName('latitude')[0]?.getElementsByTagName('value')[0]?.textContent);
                var lon = parseFloat(event.getElementsByTagName('longitude')[0]?.getElementsByTagName('value')[0]?.textContent);
                var mag = parseFloat(event.getElementsByTagName('mag')[0]?.getElementsByTagName('value')[0]?.textContent);
                var place = event.getElementsByTagName('description')[0]?.getElementsByTagName('text')[0]?.textContent || "Unknown location";
                var timeStr = event.getElementsByTagName('time')[0]?.getElementsByTagName('value')[0]?.textContent;
                var time = timeStr ? new Date(timeStr).getTime() : null;
                if (!isNaN(lat) && !isNaN(lon) && !isNaN(mag) && time) {
                    features.push({
                        type: 'Feature',
                        properties: {
                            mag: mag,
                            place: place,
                            time: time
                        },
                        geometry: {
                            type: 'Point',
                            coordinates: [lon, lat]
                        }
                    });
                }
            }
            return features;
        }
        var emscFeatures = emscXml ? emscXmlToGeoJson(emscXml) : [];
        var allFeatures = usgsFeatures.concat(emscFeatures);
        console.log('EMSC features:', emscFeatures);
        console.log('All features:', allFeatures);
        createFeatures({ type: "FeatureCollection", features: allFeatures });
        // Update the title with the new date
        document.getElementById('eq-title').innerHTML = `<h1>Earthquake activity since ${dateString}</h1>`;
    }).catch(function(error) {
        console.error('Error fetching or parsing earthquake data:', error);
    });
}

// Add dropdown to titleDiv
var title = L.control({
  position: "bottomleft"
});

title.onAdd = function() {
  var titleDiv = L.DomUtil.create("div", "info legend");
  titleDiv.innerHTML = `
    <div id="eq-title"><h1>Earthquake activity since ${getDateString(10)}</h1></div>
    <label for="daysAgoSelect">Show earthquakes from the last </label>
    <select id="daysAgoSelect">
      <option value="1">1</option>
      <option value="3">3</option>
      <option value="5">5</option>
      <option value="7">7</option>
      <option value="10" selected>10</option>
      <option value="14">14</option>
      <option value="30">30</option>
    </select> days
  `;
  return titleDiv;
};

title.addTo(myMap);

// Initial fetch
fetchAndDisplayEarthquakes(10);

// Listen for dropdown changes
setTimeout(function() {
  var select = document.getElementById('daysAgoSelect');
  if (select) {
    select.addEventListener('change', function() {
      fetchAndDisplayEarthquakes(parseInt(this.value));
    });
  }
}, 0);


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
    case magnitude > 6.0:
      return "#B20000";
    case magnitude > 5.5:
      return "#FF4F48";
    case magnitude > 5.0:
      return "#FF8F88";
    case magnitude > 4.5:
      return "#FF9B46";
    case magnitude > 4.0:
      return "#FFD20B";
    case magnitude > 3.5:
      return "#C4D504";
    case magnitude > 3.0:
      return "#6EAA00";
    case magnitude >= 2.5:
      return "#2C8000";
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

// Creates tectonic lines on the map
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
  function(tecData){

    L.geoJSON(tecData, {
      color: "blue",
      weight: 1.5
    }).addTo(tectonic);

    tectonic.addTo(myMap);
  });
