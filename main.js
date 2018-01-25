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
    const totalCounts = freqData.map( (d) => Object.assign({}, d, {count: totalCount(d)}))
    draw.drawChart(totalCounts, "#chart-container", chartId);
    setActiveView("chart-view");
    d3.select("#word-span").text(()=> searchValue )

    const meData = freqData.map ( (d) => {
      return Object.assign({}, d, {count: d.counts[yourName]})
    })
    const themData = freqData.map ( (d) => {
      return Object.assign({}, d, {count: d.counts[theirName]})
    })

    d3.select("#total-checkbox")
      .on('click', () => {
        toggleLine('total-line', totalCounts, totalCounts);
      })

    d3.select("#me-checkbox")
      .on('click', () => {
        toggleLine('me-line', meData, totalCounts);
      })
    d3.select("#them-checkbox")
      .on('click', () => {
        toggleLine('them-line', themData, totalCounts);
      })
    //TODO: form validation/ error handling
  })

function toggleLine(lineId, data, scaleData){
  const line = d3.selectAll('#'+lineId)
  if(line.empty()){
    draw.addLine(data, chartId, lineId, scaleData)
  }
  else{
    line.remove();
  }

}

function totalCount(d){
  return Object.values(d.counts).reduce((a,b) => a+b, 0);
}

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
