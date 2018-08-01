function buildMetadata(sample) {
   // sample metadata panel
   d3.json("/metadata/" + sample, function(error, response){
    if (error) return console.warn(error);

    // get list of keys from response
    var responseKeys = Object.keys(response);

    // identify correct div
    var $sampleInfoPanel = document.querySelector("#sample-metadata");
   
    // reset HTML to be nothing
    $sampleInfoPanel.innerHTML = null;

    // loop through response keys and create a P element for each including
    // response key and value
    for (var i=0; i<responseKeys.length; i++){
        var $dataPoint = document.createElement('p');
        $dataPoint.innerHTML = responseKeys[i] + ": " + response[responseKeys[i]];
        $sampleInfoPanel.appendChild($dataPoint)
    };

  });

}

function buildCharts(sample) {

    // pie chart
    //  get response for default sample
  d3.json("/samples/" + sample, function(error, sampleResponse){

    if (error) return console.warn(error);
    console.log(sampleResponse)
      
      // parse repsonse data and take sice of first ten
      // data returnes sorted from schalchemy/flask
    resLabels = sampleResponse[0]["otu_ids"].slice(0,10)
    resValues = sampleResponse[1]["sample_values"].slice(0,10)

    for (var i=0; i<10; i++){
      if (resLabels[i] == 0){
        resLabels = resLabels.slice(0,i)
        }
      if (resValues[i] == 0){
          resValues[i] = resValues.slice(0,i)
          }
      }
      // console.log(resLabels)
      // console.log(resValues)

      // get matching decriptions for the top ten bacteria and create a list
      d3.json("/otu_descriptions", function(error, response){
        if (error) return console.warn(error);

        console.log(response)
        var bacteriaNamesPie = []
        for (var i=0; i< resLabels.length; i++){
          bacteriaNamesPie.push(response[resLabels[i]])
          }
          // console.log(bacteriaNames)
          
          //  list of names for Bubble Chart
        var bacteriaNamesBub = []
        for (var i =0; i<sampleResponse[0]["otu_ids"].length; i++){
          bacteriaNamesBub.push(response[sampleResponse[0]["otu_ids"][i]])
          }
        console.log(bacteriaNamesBub)

          // set up data for pie chart
        var data = [{
        values: resValues,
        labels: resLabels,
        hovertext: bacteriaNamesPie,
        hoverinfo: {bordercolor: 'black'},
        type: 'pie'
        }];

      //   set up layout for plot

      var layout = {
                  // width: 675,
                  margin: 
                  {
                      top: 10,
                      bottom: 10,
                      right: 10,
                      left: 10
                  },
                  height: 500,
                  title: "Top Sample Counts for " + sample
                };
      // plot default value
      Plotly.newPlot('piePlot', data, layout);

    console.log(sampleResponse);
      //    bubble plot       
    var trace1 = {
          x: sampleResponse[0]["otu_ids"],
          y: sampleResponse[1]["sample_values"],
          mode: 'markers',
          marker: {
              colorscale: 'Earth',
              color: sampleResponse[0]["otu_ids"],
              size: sampleResponse[1]["sample_values"]
          },
          text: bacteriaNamesBub,
          type: "scatter"
        };
        
    var bubData = [trace1];
        
    var bubLayout = {
          title: 'Sample Values for ' + sample,
          hovermode: 'closest',
          showlegend: false,
          height: 600,
          // width: 1200
          margin: 
              {
                  top: 10,
                  bottom: 10,
                  right: 10,
                  left: 10
              }
  
        };
        
    Plotly.newPlot('bubblePlot', bubData, bubLayout);
      });
  
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
    
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);

}

// Initialize the dashboard
init();
