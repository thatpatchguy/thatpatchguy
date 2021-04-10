$(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })

function predict_those_chords(){
    var chord1 = document.getElementById("drop1").value;
    var chord2 = document.getElementById("drop2").value;
    var chord3 = document.getElementById("drop3").value;
    if(chord1 && chord2 && chord3){
        d3.json(`https://basement-producers-toolkit.azurewebsites.net/predict/${chord1}/${chord2}/${chord3}`).then(function(chord_data){
            var prediction_info = document.getElementById("prediction_box");
            prediction_info.hidden = false;
            var html_stuff = `<h2>Final Chord Predictions</h2><br>` +
                                `<table style="width:100%" id="predictChord">` +
                                `<tr><th>Chord</th><th>Confidence</th></tr>`;
            for(i in chord_data){
                for(var key in chord_data[i][0]){
                    html_stuff += `<tr><td>${key}</td><td>${chord_data[i][0][key]}</td></tr>`;
                    console.log(key)
                    console.log(chord_data[i][0][key])
                }
            }
            prediction_info.innerHTML = html_stuff;

        });
    }
    else{
        alert("Please select 3 chords so we have something to predict on!")
    }
}

var drop1 = document.getElementById("drop1");
var drop2 = document.getElementById("drop2");
var drop3 = document.getElementById("drop3");

d3.csv("/thatpatchguy/assets/data/chords.csv").then(function(data, err) {
    //Create array to hold data
    var chord_names = [];
    data.forEach(function(data){
        chord_names.push(data.chord_name);
    });

    //I need to fix this but it won't all work for any reason I can find in one for statement
    for (var i = 0; i < chord_names.length; i++){
        var opt = document.createElement("option");
        opt.textContent = chord_names[i];
        opt.value = chord_names[i];
        drop1.appendChild(opt);
    }
    for (var i = 0; i < chord_names.length; i++){
        var opt = document.createElement("option");
        opt.textContent = chord_names[i];
        opt.value = chord_names[i];
        drop2.appendChild(opt);
    }
    for (var i = 0; i < chord_names.length; i++){
        var opt = document.createElement("option");
        opt.textContent = chord_names[i];
        opt.value = chord_names[i];
        drop3.appendChild(opt);
    }
});