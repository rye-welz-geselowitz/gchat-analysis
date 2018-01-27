const d3 = require('d3');
const textProcessing = require('./js/text-processing');
const dataProcessing = require('./js/data-processing');
const draw = require('./js/draw-chart');
const sampleData = require('./js/sample-data');
const scaleEnum = require('./js/scale')


const chartId = 'chart';

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

function toggleLine(lineId, data, scaleData, getIds, rawData){
  const line = d3.selectAll('#'+lineId)
  if(line.empty()){
    draw.addLine(data, chartId, lineId, scaleData)
    data.forEach( (d,i) => {
      setDisplayMatchesOnClick(d, i, lineId, rawData, getIds)
    })
  }
  else{
    line.remove();
  }

}

function totalCount(d){
  return Object.values(d.counts).reduce((acc,b) => acc+b.count, 0);
}

d3.select("#back-btn")
.on('click', ()=>{
  d3.select("#"+chartId)
    .remove();
  d3.select("#matches-content").remove();
  setActiveView("welcome-view");
})


function renderDataDisplay(data, myName, theirName, searchValue){
  const scale = dataProcessing.determineScale(data);
  const freqData = dataProcessing.getWordFrequency(data, scale, searchValue)
  const totalCounts = freqData.map( (d) => Object.assign({}, d, {count: totalCount(d)}))
  draw.drawChart(totalCounts, "#chart-container", chartId);
  setActiveView("chart-view");
  d3.select("#word-span").text(()=> searchValue )
  d3.select("#scale-span").text( ()=> scaleEnum.toLabel(scale) )
  d3.select("#matches")
    .append('div')
    .attr('id', "matches-content")
    .text( () => "Click a dot to see matches.")
  const meData = freqData.map ( (d) => {
    return Object.assign({}, d, {count: d.counts[myName].count})
  })
  const themData = freqData.map ( (d) => {
    return Object.assign({}, d, {count: d.counts[theirName].count})
  })
  const getIdsForTotalData = (d) => {
    return Object.values(d.counts).reduce( (acc, obj) => {
        return acc.concat(obj.ids);
      }, [])
    }

  toggleLine('total-line', totalCounts, totalCounts, getIdsForTotalData, data);
  initiateCheckboxes(totalCounts,data,meData,themData,myName,theirName, getIdsForTotalData)

}

function initiateCheckboxes(totalCounts,data,meData,themData,myName,theirName, getIdsForTotalData){
  d3.select("#total-checkbox")
    .property('checked',true)
    .on('click', () => {
      toggleLine('total-line', totalCounts, totalCounts, getIdsForTotalData, data);
    })

  d3.select("#me-checkbox")
    .property('checked',false)
    .on('click', () => {
      toggleLine('me-line', meData, totalCounts, (d) => d.counts[myName].ids, data);
    })

  d3.select("#them-checkbox")
    .property('checked',false)
    .on('click', () => {
      toggleLine('them-line', themData, totalCounts, (d) => d.counts[theirName].ids, data);
    })
}


function setDisplayMatchesOnClick(d, i, lineId, data, getIds){
  const ids = getIds(d)
  d3.select("#"+lineId+"-"+i)
  .on("click", ()=> {
    const textMessages = ids.map( (id) => {
      return data.find( (d) => d.id == id)
    })
    textMessages.sort( (a,b) => new Date(a.date) < new Date(b.date)? 1 : -1 )
    d3.select("#matches-content").remove();

    const newContent = d3.select("#matches")
      .append("div")
      .attr("id", "matches-content")

    if(textMessages.length){
      var divs = newContent.selectAll('p').data(textMessages).enter().append('div');
      divs.append("p")
        .attr("class", "sender")
        .text( (d) => d.sender )
      divs.append("p")
        .attr("class", "date")
        .text( (d) => d.date )
      divs.append("p")
        .attr("class", "text")
        .text( (d) => d.text )
    }
    else{
      newContent
        .selectAll('p')
        .data([1])
        .enter()
        .append("p")
        .text( () => "No matches")
    }
  })

}

function setActiveView(activeId){
  const viewIds = ["welcome-view", "chart-view"];
  viewIds.forEach( (id) =>{
    d3.select("#"+id)
      .classed("hidden", activeId !== id);
  })
}
