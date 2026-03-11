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

var tour_pins_layer = new L.LayerGroup();
var tour_lines_layer = new L.LayerGroup();

var overlayMaps = {
    "Tour stops (pins)": tour_pins_layer,
    "Tour route (lines)": tour_lines_layer
};

L.control.layers(baseMaps, overlayMaps).addTo(myMap);
tour_pins_layer.addTo(myMap);
tour_lines_layer.addTo(myMap);
//Legend creation
var legend = L.control({
    position: "bottomright"
  });

legend.onAdd = function() {
    var newDiv = L.DomUtil.create("div", "info legend");
    newDiv.innerHTML = "";
    newDiv.innerHTML += "<select name='tour_select' id='tour_select'></select>";

    // Ensure dropdown works on mobile:
    L.DomEvent.disableClickPropagation(newDiv);
    L.DomEvent.disableScrollPropagation(newDiv);
    
    return newDiv;
}

legend.addTo(myMap);

// Attach event listener after control is added
setTimeout(function() {
    var select = document.getElementById('tour_select');
    if (select && !select.dataset.listener) {
        select.addEventListener('change', function() {
            dropdownChanged();
        });
        select.dataset.listener = 'true';
    }
}, 0);

// Populate dropdown options after ensuring element exists
setTimeout(function() {
    var drop = document.getElementById("tour_select");
    if (drop) {
        d3.csv("Resources/tour_stops.csv", function(tour){
            // console.log(tour)
            tours = [];
            for (var i=0; i< tour.length; i++){
                if (tours.includes(tour[i].Cast)){}
                else {tours.push(tour[i].Cast);}
            }
            for (var i = 0; i<tours.length; i++){
                var opt = document.createElement("option");
                opt.textContent = tours[i]
                opt.value = tours[i]
                drop.appendChild(opt);
            }
        });
    }
}, 100);

// Pin image is 745×1216 — keep aspect ratio to avoid squishing (width 40 → height ~65)
var myIcon = L.icon({
    iconUrl: 'Resources/uwp.png',
    iconSize: [40, 65],
    iconAnchor: [20, 65],
    popupAnchor: [0, -65]
});

// Line options: straight for same-country, curved for international
var lineStyleDomestic = { color: '#031f3f', weight: 3, opacity: 0.8 };
var lineStyleInternational = { color: '#fe5001', weight: 3, opacity: 0.8 };

// Quadratic Bezier point at t in [0,1]: (1-t)²·A + 2(1-t)t·C + t²·B
function bezierPoint(a, c, b, t) {
    var u = 1 - t;
    return [
        u * u * a[0] + 2 * u * t * c[0] + t * t * b[0],
        u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]
    ];
}

// Build a slight arc between two lat/lng points (for international legs).
// Uses normalized perpendicular offset so the curve stays horizontal (e.g. Atlantic, not over the pole).
function getArcPoints(lat1, lng1, lat2, lng2, numPoints) {
    numPoints = numPoints || 15;
    var a = [parseFloat(lat1), parseFloat(lng1)];
    var b = [parseFloat(lat2), parseFloat(lng2)];

    // Prefer the shorter longitude path (e.g. -100 to +10 via Atlantic, not via Pacific)
    var lngDiff = b[1] - a[1];
    if (lngDiff > 180) { b = [b[0], b[1] - 360]; }
    else if (lngDiff < -180) { b = [b[0], b[1] + 360]; }

    var midLat = (a[0] + b[0]) / 2;
    var midLng = (a[1] + b[1]) / 2;
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    // Perpendicular to chord (in lat/lng), normalized so we move a fixed amount
    var perpLat = dy;
    var perpLng = -dx;
    var perpLen = Math.sqrt(perpLat * perpLat + perpLng * perpLng) || 1;
    var bulge = 1.5; // degrees of offset for a slight curve
    var c = [
        midLat + bulge * (perpLat / perpLen),
        midLng + bulge * (perpLng / perpLen)
    ];
    var points = [];
    for (var i = 0; i <= numPoints; i++) {
        var t = i / numPoints;
        var pt = bezierPoint(a, c, b, t);
        pt[1] = pt[1] < -180 ? pt[1] + 360 : pt[1] > 180 ? pt[1] - 360 : pt[1];
        points.push(pt);
    }
    return points;
}

function dropdownChanged(){
    var selection = document.getElementById("tour_select").value;
    tour_pins_layer.clearLayers();
    tour_lines_layer.clearLayers();
    d3.csv("Resources/tour_stops.csv", function(tour){
        var stops = [];
        for (var i = 0; i < tour.length; i++) {
            if (tour[i].Cast === selection) {
                var row = tour[i];
                stops.push({
                    Lat: parseFloat(row.Lat),
                    Long: parseFloat(row.Long),
                    Country: (row.Country || '').trim(),
                    row: row
                });
            }
        }

        for (var j = 0; j < stops.length; j++) {
            var stop = stops[j];
            var newMarker = L.marker([stop.Lat, stop.Long], { icon: myIcon });
            newMarker.addTo(tour_pins_layer);
            newMarker.bindPopup(stop.row.Tour + "<br>" + stop.row.City + " " + stop.row.State + " " + stop.row.Country);
        }

        for (var k = 0; k < stops.length - 1; k++) {
            var from = stops[k];
            var to = stops[k + 1];
            var sameCountry = from.Country && to.Country && from.Country === to.Country;
            if (sameCountry) {
                L.polyline([[from.Lat, from.Long], [to.Lat, to.Long]], lineStyleDomestic).addTo(tour_lines_layer);
            } else {
                var arcPoints = getArcPoints(from.Lat, from.Long, to.Lat, to.Long);
                L.polyline(arcPoints, lineStyleInternational).addTo(tour_lines_layer);
            }
        }
    });
}

// var explain = L.control({
//     position: "bottomleft"
//   });

// explain.onAdd = function() {
//     var titleDiv = L.DomUtil.create("div", "info legend");

//     titleDiv.innerHTML = `<h3>Please select a tour to see where UWP went during a given tour</h3>`;

//     return titleDiv;
// };

// explain.addTo(myMap);