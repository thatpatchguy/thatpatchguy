
// Select dropdown
var drop = d3.select("#selDataset");

// Add potential options to dropdown list
d3.json("samples.json").then((data)=>{
    data.names.forEach(testid=>{
        drop.append("option").text(testid)
    })
    // Initializes page to first subject until they select another
    optionChanged(data.names[0])
});

// Function to print out the metadata for selected test subject
function demographicData(id){
    d3.json("samples.json").then((data)=>{
        //Error Checking
        if (id == undefined) {
            exit; 
        }
        
        // Gets the metadata for the selected id
        var idIndex = data.names.indexOf(id);
        var metadata = data.metadata[idIndex];

        // Grab the div to portray the metadate
        var metadataDiv = d3.select("#sample-metadata")
        //Clear HTML
        metadataDiv.html('');
        // Simply prints the key value pair
        Object.entries(metadata).forEach(([key, value]) =>{
            metadataDiv.append("p").text(`${key}: ${value}`);
        });
    })
}

//Function to build all of the plotly graphs
function buildGraphs(id){
    // First grab the bar div from html
    var barDiv = d3.select("#bar");
    // Clear it
    barDiv.html("");

    // Lets get the data
    d3.json("samples.json").then((data)=>{
        // Get the sample data for the select patient id
        var idIndex = data.names.indexOf(id);
        var samples = data.samples[idIndex];

        // Split data into seperate variables
        var otuIds = samples.otu_ids;
        var otuLabels = samples.otu_labels;
        var sampleValues = samples.sample_values;

        // Grabbing the data from only the top 10 for the bar graph
        var otuIds10 = otuIds.slice(0,10);
        var otuLabels10 = otuLabels.slice(0,10);
        var sampleValues10 = sampleValues.slice(0,10);

        // Bar graph trace
        var trace1 = {
            x: otuIds10,
            y: sampleValues10,
            type: "bar",
            hovertext: otuLabels10,
            marker: {
                color: otuIds
            }
        }
        // Same thing but make it *DATA*
        var trace1Data = [trace1];

        //Creating layout for bar graph
        var layout1 = {
            title: `Top 10 OTUs for test subject ${id}`,
            bargap: 5,
            xaxis: { 
                type: 'category',
                title: 'Otu ID'
            },
            yaxis: {
                title: "Concentration of OTU"
            }
        }

        //Graph it to my bar div!
        Plotly.newPlot("bar", trace1Data, layout1);

        // Creating trace for bubble graph
        var trace2 = {
            x: otuIds,
            y: sampleValues,
            mode: 'markers',
            marker: {
                color: otuIds,
                size: sampleValues
            },
            text: otuLabels
        }
        //DATAFY IT
        var trace2Data = [trace2];

        // Layout for bubble graph
        var layout2 = {
            title: `OTU levels for test subject ${id}`,
            xaxis: {title: "OTU ID"},
            yaxis: {title: "OTU Level"}
        }
        //Plot it!
        Plotly.newPlot("bubble", trace2Data, layout2);

        //Now time to get the metadata for selected patient id
        var metadata = data.metadata[idIndex];
        var washFreq = metadata.wfreq;

        // Trace for the gauge graph
        var trace3 = {
            domain: { x: [0, 1], y: [0, 1] },
            value: washFreq,
            type: "indicator",
            mode: "gauge+number",
            gauge: {
                axis:{range:[null,9]},
                bar: {color: "white"},
                steps:[
                    {range: [0,3], color: "red"},
                    {range: [3,6], color: "yellow"},
                    {range: [6,9], color: "green"}
                ]
            }
        };
        // Gauge trace, but this time its data
        var trace3Data = [trace3];
        // Quite a simple layout dontcha think?
        var layout3 = {
            title: "Belly button washing frequency"
        };

        // Plot that to that gauge div!
        Plotly.newPlot("gauge", trace3Data, layout3);

    })
}

// Now this function is exciting because it gets called from the html onchange
function optionChanged(name){
    demographicData(name);
    buildGraphs(name);
}