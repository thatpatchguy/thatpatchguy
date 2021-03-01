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

var tour_layer = new L.LayerGroup();

var overlayMaps = {
    Tour: tour_layer
};


L.control.layers(baseMaps, overlayMaps).addTo(myMap);
//Legend creation
var legend = L.control({
    position: "bottomright"
  });

legend.onAdd = function() {
    var newDiv = L.DomUtil.create("div", "info legend");
    newDiv.innerHTML = "";
    newDiv.innerHTML += "<select name='tour_select' id='tour_select' onchange='dropdownChanged()'></select>";

    return newDiv;
}

legend.addTo(myMap);

var drop = document.getElementById("tour_select");

d3.csv("Resources/tour_stops.csv", function(tour){
    // console.log(tour)
    tours = [];
    for (var i=0; i< tour.length; i++){
        if (tours.includes(tour[i].Tour)){}
        else {tours.push(tour[i].Tour);}
    }
    for (var i = 0; i<tours.length; i++){
        var opt = document.createElement("option");
        opt.textContent = tours[i]
        opt.value = tours[i]
        drop.appendChild(opt);
    }

})

var myIcon = L.icon({
    iconUrl: 'Resources/uwp.png',
    iconSize: [40, 50],
    iconAnchor: [18, 45],
    popupAnchor: [0, -45]
});

function dropdownChanged(){
    var selection = document.getElementById("tour_select").value;
    tour_layer.clearLayers();
    d3.csv("Resources/tour_stops.csv", function(tour){
        for (var i=0; i< tour.length; i++){
            if (tour[i].Tour == selection){
                var newMarker = L.marker([tour[i].Lat, tour[i].Long], {icon: myIcon});
                newMarker.addTo(tour_layer);
                newMarker.bindPopup(tour[i].Tour + "<br>" + tour[i].City + " " + tour[i].State + " " + tour[i].Country);
            }
        };

        tour_layer.addTo(myMap);
    });
}

var explain = L.control({
    position: "bottomleft"
  });

explain.onAdd = function() {
    var titleDiv = L.DomUtil.create("div", "info legend");

    titleDiv.innerHTML = `<h3>Please select a tour to see where UWP went during a given tour</h3>`;

    return titleDiv;
};

explain.addTo(myMap);