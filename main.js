const d3 = require('d3');
const textProcessing = require('./js/text-processing');
const dataProcessing = require('./js/data-processing');
const draw = require('./js/draw-chart');
const sampleData = require('./js/sample-data');
const scaleEnum = require('./js/scale')

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
    d3.select(".error").classed("error", false)
    const chats =
      d3.select("#chats-input").node().value;
    const yourName =
      d3.select("#your-name-input").node().value;
    const theirName =
      d3.select("#their-name-input").node().value;
    const searchValue =
      d3.select("#search-input").node().value;
    const data = textProcessing.parse(chats, yourName, theirName);
    if(chats && yourName && theirName && searchValue && data.length){
      renderDataDisplay(data, yourName, theirName, searchValue)
    }
    else if (chats && yourName && theirName && searchValue){
      console.log('Could not parse data') //TODO: display validation message
    }
    else{
      if(!chats){
        d3.select("#chats-input").attr('class', 'error')
      }
      if(!yourName){
        d3.select("#your-name-input").attr('class', 'error')
      }
      if(!theirName){
        d3.select("#their-name-input").attr('class', 'error')
      }
      if(!searchValue){
        d3.select("#search-input").attr('class', 'error')
      }
    }

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
  return Object.values(d.counts).reduce((acc,b) => acc+b.count, 0);
}

d3.select("#back-btn")
.on('click', ()=>{
  d3.select("#"+chartId)
    .remove();
  d3.select("#matches-content").remove();
  setActiveView("welcome-view");
})


function renderDataDisplay(data, yourName, theirName, searchValue){
  const scale = dataProcessing.determineScale(data);
  const freqData = dataProcessing.getWordFrequency(data, scale, searchValue)
  const totalCounts = freqData.map( (d) => Object.assign({}, d, {count: totalCount(d)}))
  draw.drawChart(totalCounts, "#chart-container", chartId);
  setActiveView("chart-view");
  d3.select("#word-span").text(()=> searchValue )
  d3.select("#scale-span").text( ()=> scaleEnum.toLabel(scale) )
  const meData = freqData.map ( (d) => {
    return Object.assign({}, d, {count: d.counts[yourName].count})
  })
  const themData = freqData.map ( (d) => {
    return Object.assign({}, d, {count: d.counts[theirName].count})
  })

  freqData.forEach( (d,i) => {
    d3.select("#total-line-"+i)
    .on("click", ()=> {
      const ids = Object.values(d.counts).reduce( (acc, obj) => {
        return acc.concat(obj.ids);
      }, [])
      const textMessages = ids.map( (id) => {
        return data.find( (d) => d.id == id)
      })
      d3.select("#matches-content").remove();

      const newContent = d3.select("#matches")
        .append("div")
        .attr("id", "matches-content")

      if(textMessages.length){
        newContent.selectAll("div")
          .data(textMessages)
          .enter()
          .append("div") //TODO: how to do without nesting???
          .attr("class", "sender")
          .text( (d) => d.sender )
          .append("div")
          .attr("class", "date")
          .text( (d) => d.date ) //TODO: format
          .append("div")
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
  })

  d3.select("#total-checkbox")
    .property('checked',true)
    .on('click', () => {
      toggleLine('total-line', totalCounts, totalCounts);
    })

  d3.select("#me-checkbox")
    .property('checked',false)
    .on('click', () => {
      toggleLine('me-line', meData, totalCounts);
    })

  d3.select("#them-checkbox")
    .property('checked',false)
    .on('click', () => {
      toggleLine('them-line', themData, totalCounts);
    })

  //TODO: form validation/ error handling
}


//HELPERS
function setActiveView(activeId){
  const viewIds = ["welcome-view", "chart-view"];
  viewIds.forEach( (id) =>{
    d3.select("#"+id)
      .classed("hidden", activeId !== id);
  })
}

const chartId = 'chart';
