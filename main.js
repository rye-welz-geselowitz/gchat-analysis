const d3 = require('d3');
const textProcessing = require('./js/text-processing');
const dataProcessing = require('./js/data-processing');
const draw = require('./js/draw-chart');
const sampleData = require('./js/sample-data');

d3.select('#load-sample-data-btn')
  .on('click', () => {
    d3.select("#chats-input")
    .property('value', sampleData.month.text);
    d3.select("#your-name-input")
    .property('value', sampleData.month.name1);
    d3.select("#their-name-input")
    .property('value', sampleData.month.name2);
    d3.select("#search-input")
    .property('value', sampleData.month.searchValue);
  })

  d3.select('#clear-btn')
    .on('click', () => {
      d3.select("#chats-input")
      .property('value', '');
      d3.select("#your-name-input")
      .property('value', '');
      d3.select("#their-name-input")
      .property('value', '');
      d3.select("#search-input")
      .property('value', '');
    })

d3.select("#submit-btn")
  .on('click', ()=> {
    const chats =
      d3.select("#chats-input").node().value;
    const yourName =
      d3.select("#your-name-input").node().value;
    const theirName =
      d3.select("#their-name-input").node().value;
    const searchValue =
      d3.select("#search-input").node().value;
    const data =
      textProcessing.parse(chats, yourName, theirName);
    const scale = dataProcessing.determineScale(data);
    const freqData = dataProcessing.getWordFrequency(data, scale, searchValue)
    draw.drawChart(freqData, "#chart-view", chartId);
    setActiveView("chart-view");

    //TODO: form validation/ error handling
  })


d3.select("#back-btn")
.on('click', ()=>{
  d3.select("#"+chartId)
    .remove();
  setActiveView("welcome-view");
})



//HELPERS
function setActiveView(activeId){
  const viewIds = ["welcome-view", "chart-view"];
  viewIds.forEach( (id) =>{
    d3.select("#"+id)
      .classed("hidden", activeId !== id);
  })
}

const chartId = 'chart';
