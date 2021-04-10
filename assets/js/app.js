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


//Creates variables for Chord dropdowns
var drop1 = document.getElementById("drop1");
var drop2 = document.getElementById("drop2");
var drop3 = document.getElementById("drop3");
var drop4 = document.getElementById("drop4");

//SVG Size
var svgWidth = 1050;
var svgHeight = 350;

//Making margin
var margin = {
    top: 20,
    right: 20,
    bottom: 80,
    left: 100
  };

//SVG size without margins
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Selects div element
var svg = d3.select("#piano")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//Adds group to the div
var pianoGroup = svg.append("g");

//Pulls in chord data
d3.csv("/assets/data/chords.csv").then(function(data, err) {
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
    for (var i = 0; i < chord_names.length; i++){
        var opt = document.createElement("option");
        opt.textContent = chord_names[i];
        opt.value = chord_names[i];
        drop4.appendChild(opt);
    }
});



// Draws the chord on piano
function makeChords(selection){
    d3.csv("/assets/data/chords.csv").then(function(data, err) {
        if (err) throw err;

        //To hold the keys we need to highlight
        var keys = [];
        
        //Find which chord is equal to the selection and assign the keys to keys array
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
        locationArray = [];
        //Now we are going to find the locations of the notes we want to play
        d3.csv("/assets/data/locations.csv").then(function(ldata,err) {
            ldata.forEach(function(ldata){
                //Checks if row is one of our keys
                if (ldata.note == keys[0] || ldata.note == keys[1] ||ldata.note == keys[2] ||ldata.note == keys[3]) {
                    //if so it adds the coordinates to the location array
                    var coor = {x: ldata.x, y: ldata.y};
                    locationArray.push(coor);
                }
            })

            //Clears piano
            pianoGroup.selectAll("*").remove();
            //Creates circles on given coordinates
            var circlesGroup = pianoGroup.selectAll("circle")
                .data(locationArray)
                .enter()
                .append("circle")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
                .attr("r", 20)
                .attr("color", "black")
                .attr("fill", '#D7BE82');
        })


    })
}

//Primes page with a good ol' classic C Chord
makeChords("C");

//When the play button gets clicked
function play_chords(){
    var chord1 = document.getElementById("drop1").value;
    var chord2 = document.getElementById("drop2").value;
    var chord3 = document.getElementById("drop3").value;
    var chord4 = document.getElementById("drop4").value;
    //Only works if all chords are selected
    if (chord1 && chord2 && chord3 && chord4){
        button.innerHTML = ("Pause");
        //Makes each chord then waits 1.5 seconds and goes again, calls itself unless pause has been clicked
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

//Routing for button click based on what needs to happen
function play_or_pause(){
    if (button.innerHTML == "Play"){
        play_chords();
    }
    else {
        button.innerHTML = "Play";
        return;
    }
}

//Creates play pause button
var button = document.createElement("button");
button.innerHTML = "Play";

//Creates box to show what chord is being played
var num = document.createElement("div");
num.setAttribute("class", "loop_num");

//Adds play button and num container to row
var play_pause = document.getElementById("play_pause");
play_pause.appendChild(button);
play_pause.appendChild(num);

//Calls play_or_pause function on click
button.addEventListener("click", play_or_pause);

//Updates notes displayed on dropdown page
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

//Gets songs using webscraping on python hosted on heroku
d3.json('https://basement-producers-toolkit.herokuapp.com/get_songs').then(function(scrape_data){
    song_drop = document.getElementById("song_drop");

    //For each song we are going to create an option in the dropdown list and assign a value of the url we need to append
    scrape_data.forEach(song => {
        var opt = document.createElement("option");
        opt.textContent = `${song[0].title} - ${song[0].artist}`;
        var valURL = `/scrape/${song[0].title}/${song[0].artist}`
        //Making song name and title URL friendly
        valURL.toLowerCase();
        valURL = valURL.replaceAll(" ", "-");
        valURL = valURL.replace(".", "");
        valURL = valURL.replace("(", "");
        valURL = valURL.replace(")", "");
        valURL = valURL.replace(",", "");
        opt.value = valURL;
        //Adds to dropdown
        song_drop.appendChild(opt);
    });
});

//Once they select a song it calls this function
function song_selected(){
    //Get selected value
    var selected_song = document.getElementById("song_drop").value;
    //Call heroku api I set up to scrape chords from website
    d3.json(`https://basement-producers-toolkit.herokuapp.com${selected_song}`).then(function(chord_data){
        var intro = document.getElementById("song_intro_info");
        var allChords = document.getElementById("song_chords_info");
        var intro_html = `<h2>Intro Chords</h2> <br><h4>`;
        var table_data = [];
        var html_stuff = `<h2>All chords in song</h2><br>`+
                                `<table style="width:100%" id="allChord" class="sortable">`+
                                    `<tr><th>Chord</th><th>Occurences</th></tr>`;
        the_chords = chord_data[1][0];
        //For each chord combination add a table row
        for (const property in the_chords.all_chords[0]){
            html_stuff += `<tr><td>${property}</td><td>${the_chords.all_chords[0][property]}</td></tr>`;
        }
        html_stuff += `</table>`;
        allChords.innerHTML = html_stuff;
        var chordTable = document.getElementById("allChord");
        sorttable.makeSortable(chordTable);
        //Fills the dropdowns with the 4 intro chords
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