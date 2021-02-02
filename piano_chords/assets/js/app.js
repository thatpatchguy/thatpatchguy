/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
    var openDropdown = dropdowns[i];
    if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
    }
    }
}
}

var drop1 = document.getElementById("drop1");
var drop2 = document.getElementById("drop2");
var drop3 = document.getElementById("drop3");
var drop4 = document.getElementById("drop4");


var svgWidth = 1050;
var svgHeight = 350;

//Making margin
var margin = {
    top: 20,
    right: 20,
    bottom: 80,
    left: 100
  };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#piano")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var pianoGroup = svg.append("g");

d3.csv("/assets/data/chords.csv").then(function(data, err) {
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
    for (var i = 0; i < chord_names.length; i++){
        var opt = document.createElement("option");
        opt.textContent = chord_names[i];
        opt.value = chord_names[i];
        drop4.appendChild(opt);
    }
});




function makeChords(selection){
    d3.csv("/assets/data/chords.csv").then(function(data, err) {
        if (err) throw err;


        var keys = [];
        

        data.forEach(function(data){
            if (data.chord_name == selection){
                keys.push(data.key1);
                keys.push(data.key2);
                keys.push(data.key3);
                if (data.key4){
                    keys.push(data.key4);
                }
            }
        })
        console.log(keys);
        locationArray = [];

        d3.csv("assets/data/locations.csv").then(function(ldata,err) {
            ldata.forEach(function(ldata){
                if (ldata.note == keys[0] || ldata.note == keys[1] ||ldata.note == keys[2] ||ldata.note == keys[3]) {
                    var coor = {x: ldata.x, y: ldata.y};
                    locationArray.push(coor);
                }
            })

            console.log(locationArray);
            pianoGroup.selectAll("*").remove();
            var circlesGroup = pianoGroup.selectAll("circle")
                .data(locationArray)
                .enter()
                .append("circle")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 20)
                .attr("color", "black")
                .attr("fill", '#E44134');
        })


    })
}

makeChords("C");

function play_chords(){
    var chord1 = document.getElementById("drop1").value;
    var chord2 = document.getElementById("drop2").value;
    var chord3 = document.getElementById("drop3").value;
    var chord4 = document.getElementById("drop4").value;
    if (chord1 && chord2 && chord3 && chord4){
        button.innerHTML = ("Pause");
        makeChords(chord1);
        num.innerHTML = '1';
        setTimeout(function(){
            makeChords(chord2);
            num.innerHTML = '2';
        }, 1500);
        setTimeout(function(){
            makeChords(chord3);
            num.innerHTML = '3';
        }, 3000);
        setTimeout(function(){
            makeChords(chord4);
            num.innerHTML = '4';
        }, 4500);
        setTimeout(function(){
            if (button.innerHTML == "Pause"){play_chords();}
        }, 6000);
    }
    else{
    }
}

function play_or_pause(){
    if (button.innerHTML == "Play"){
        play_chords();
    }
    else {
        button.innerHTML = "Play";
        return;
    }
}

var button = document.createElement("button");
button.innerHTML = "Play";

var num = document.createElement("div");
num.setAttribute("class", "loop_num")

var play_pause = document.getElementById("play_pause");
play_pause.appendChild(button);
play_pause.appendChild(num);

button.addEventListener("click", play_or_pause);

function drop1Changed(){
    var selection = document.getElementById("drop1").value;
    makeChords(selection);
}
function drop2Changed(){
    var selection = document.getElementById("drop2").value;
    makeChords(selection);
}
function drop3Changed(){
    var selection = document.getElementById("drop3").value;
    makeChords(selection);
}
function drop4Changed(){
    var selection = document.getElementById("drop4").value;
    makeChords(selection);
}

d3.json('http://127.0.0.1:5000/get_songs').then(function(scrape_data){
    song_drop = document.getElementById("song_drop");

    scrape_data.forEach(song => {
        var opt = document.createElement("option");
        opt.textContent = `${song[0].title} - ${song[0].artist}`;
        var valURL = `/scrape/${song[0].title}/${song[0].artist}`
        valURL.toLowerCase();
        valURL = valURL.replaceAll(" ", "-");
        valURL = valURL.replace(".", "");
        valURL = valURL.replace("(", "");
        valURL = valURL.replace(")", "");
        valURL = valURL.replace(",", "");
        opt.value = valURL;
        song_drop.appendChild(opt);
    });
});

function song_selected(){
    var selected_song = document.getElementById("song_drop").value;
    d3.json(`http://127.0.0.1:5000${selected_song}`).then(function(chord_data){
        var intro = document.getElementById("song_intro_info");
        var allChords = document.getElementById("song_chords_info");
        var intro_html = `<h2>Intro Chords</h2> <br><h4>`;
        var html_stuff = `<h2>All chords in song</h2><br>`+
                                `<table style="width:100%">`+
                                    `<tr><th>Chord</th><th>Occurences</th></tr>`;
        the_chords = chord_data[1][0];
        for (const property in the_chords){
            html_stuff += `<tr><td>${property}</td><td>${the_chords[property]}</td></tr>`;
        }
        html_stuff += `</table>`;
        allChords.innerHTML = html_stuff;
        for (var i = 0; i<chord_data[0][0].intro_chords.length;i++){

            var data = chord_data[0][0].intro_chords[i]
            intro_html += `${data} `
            fill_drop = document.getElementById(`drop${i+1}`)
            var opts = fill_drop.options.length;
            for (var j=0; j<opts; j++){
                if(fill_drop.options[j].value == data){
                    fill_drop.options[j].selected = true;
                    break;
                }else{
                    fill_drop.options[0].selected = true;
                }
            }
        }
        intro.innerHTML = intro_html;
    })
}