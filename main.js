const d3 = require('d3');
const textProcessing = require('./js/text-processing');
const dataProcessing = require('./js/data-processing');
const draw = require('./js/draw-chart');
const sampleData = require('./js/sample-data');
const scaleEnum = require('./js/enum/scale');
const lineTypeEnum = require('./js/enum/line-type');

const chartId = 'chart';

//Welcome view buttons
d3.select('#load-sample-data-btn')
  .on('click', () => {
    d3.select("#chats-input")
    .property('value', sampleData.month.text);
    d3.select("#my-name-input")
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
    d3.select("#my-name-input")
    .property('value', '');
    d3.select("#their-name-input")
    .property('value', '');
    d3.select("#search-input")
    .property('value', '');
  })

d3.select("#submit-btn")
  .on('click', ()=> {
    d3.selectAll(".error").classed("error", false)
    d3.select("#error-msg").classed("hidden", true)
    const chats =
      d3.select("#chats-input").node().value;
    const myName =
      d3.select("#my-name-input").node().value;
    const theirName =
      d3.select("#their-name-input").node().value;
    const searchValue =
      d3.select("#search-input").node().value;
    const data = textProcessing.parse(chats, myName, theirName);
    if(chats && myName && theirName && searchValue && data.length){
      renderDataDisplay(data, myName, theirName, searchValue)
    }
    else if (chats && myName && theirName && searchValue){
      d3.select("#error-msg").classed("hidden", false)
    }
    else{
      if(!chats){
        d3.select("#chats-input").attr('class', 'error')
      }
      if(!myName){
        d3.select("#my-name-input").attr('class', 'error')
      }
      if(!theirName){
        d3.select("#their-name-input").attr('class', 'error')
      }
      if(!searchValue){
        d3.select("#search-input").attr('class', 'error')
      }
    }

  })

//Data view buttons
d3.select("#back-btn")
.on('click', ()=>{
  d3.select("#"+chartId)
    .remove();
  d3.select("#matches-content").remove();
  setActiveView("welcome-view");
})


//Helpers
function totalCount(d){
  return Object.values(d.counts).reduce((acc,b) => acc+b.count, 0);
}

function toggleLine(lineType, data, scaleData, getIds, rawData, myName, theirName, searchValue){
  const lineId = lineTypeEnum.toId(lineType)
  const line = d3.selectAll('#'+lineId)
  if(line.empty()){
    draw.addLine(data, chartId, lineId, scaleData, rawData, getIds, myName, theirName, searchValue)
  }
  else{
    line.remove();
  }
}

function renderDataDisplay(data, myName, theirName, searchValue){
  const scale = dataProcessing.determineScale(data);
  const freqData = dataProcessing.getWordFrequency(data, scale, searchValue)
  const totalCounts = freqData.map( (d) => Object.assign({}, d, {count: totalCount(d)}))
  draw.drawChart(totalCounts, "#chart-container", chartId, scaleEnum.toLabel(scale));
  setActiveView("chart-view");
  d3.select("#word-span").text(()=> searchValue )
  d3.select("#matches")
    .append('div')
    .attr('id', "matches-content")
    .text( () => "Click a dot to see matches.")
  const meData = freqData.map ( (d) => {
    return Object.assign({}, d,
      {count: d.counts[myName] && d.counts[myName].count? d.counts[myName].count: 0})
  })
  const themData = freqData.map ( (d) => {
    return Object.assign({}, d,
      {count: d.counts[theirName] && d.counts[theirName].count? d.counts[myName].count: 0})
  })
  const getIdsForTotalData = (d) => {
    return Object.values(d.counts).reduce( (acc, obj) => {
        return acc.concat(obj.ids);
      }, [])
    }

  toggleLine(lineTypeEnum.LineType.total, totalCounts, totalCounts, getIdsForTotalData, data, myName, theirName, searchValue);
  initiateCheckboxes(totalCounts,data,meData,themData,myName,theirName, getIdsForTotalData, searchValue)

}

function initiateCheckboxes(totalCounts,data,meData,themData,myName,theirName, getIdsForTotalData, searchValue){
  d3.select("#total-checkbox")
    .property('checked',true)
    .on('click', () => {
      toggleLine(lineTypeEnum.LineType.total, totalCounts, totalCounts, getIdsForTotalData, data, myName, theirName, searchValue);
    })

  d3.select("#me-checkbox")
    .property('checked',false)
    .on('click', () => {
      toggleLine(lineTypeEnum.LineType.me, meData, totalCounts, (d) => d.counts[myName].ids, data, myName, theirName, searchValue);
    })

  d3.select("#them-checkbox")
    .property('checked',false)
    .on('click', () => {
      toggleLine(lineTypeEnum.LineType.them, themData, totalCounts, (d) => d.counts[theirName].ids, data, myName, theirName, searchValue);
    })
}


function setActiveView(activeId){
  const viewIds = ["welcome-view", "chart-view"];
  viewIds.forEach( (id) =>{
    d3.select("#"+id)
      .classed("hidden", activeId !== id);
  })
}
