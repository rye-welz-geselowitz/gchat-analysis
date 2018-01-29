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
  .on('click', () => {
    clearErrors();
    const [chats, myName, theirName, searchValue] = [document.getElementById("chats-input").value,
      document.getElementById("my-name-input").value,
      document.getElementById("their-name-input").value,
      document.getElementById("search-input").value
    ];
    if (chats && myName && theirName && searchValue) {
      const data = textProcessing.parse(chats, myName, theirName);
      if (data.length) {
        renderDataDisplay(data, myName, theirName, searchValue)
      } else {
        d3.select("#error-msg").classed("hidden", false)
      }
    } else {
      const validations = [
        [chats, "chats-input"],
        [myName, "my-name-input"],
        [theirName, "their-name-input"],
        [searchValue, "search-input"]
      ];
      validations.forEach(([entity, domId]) => {
        if (!entity) {
          showError(domId);
        }
      })

    }
  })

//Data view buttons
d3.select("#back-btn")
  .on('click', () => {
    d3.select("#" + chartId)
      .remove();
    d3.select("#matches-content").remove();
    setActiveView("welcome-view");
  })


//Helpers

function showError(id) {
  d3.select("#" + id).attr('class', 'error')
}

function clearErrors() {
  d3.selectAll(".error").classed("error", false)
  d3.select("#error-msg").classed("hidden", true)
}

function totalCount(d) {
  return Object.values(d.counts).reduce((acc, b) => acc + b.count, 0);
}

function toggleLine(config) {
  const line = d3.selectAll('#' + config.id)
  if (line.empty()) {
    draw.addLine(config)
  } else {
    line.remove();
  }
}

function renderDataDisplay(data, myName, theirName, searchValue) {
  const scale = dataProcessing.determineScale(data);
  const config = new dataProcessing.WordFrequencyConfig({
    myName: myName,
    theirName: theirName,
    scale: scale,
    searchValue: searchValue
  })
  const freqData = dataProcessing.getWordFrequency(data, config)
  draw.drawChart(freqData, "chart-container", chartId,
    scaleEnum.toLabel(scale), lineTypeEnum.LineType.total);
  setActiveView("chart-view");
  d3.select("#word-span").text(() => searchValue)
  d3.select("#matches")
    .append('div')
    .attr('id', "matches-content")
    .text(() => "Click a dot to see matches.")
  const totalLineConfig = getLineConfig(lineTypeEnum.LineType.total, freqData, data, searchValue);
  const meLineConfig = getLineConfig(lineTypeEnum.LineType.me, freqData, data, searchValue);
  const themLineConfig = getLineConfig(lineTypeEnum.LineType.them, freqData, data, searchValue);
  toggleLine(totalLineConfig);
  initiateCheckboxes(totalLineConfig, meLineConfig, themLineConfig)
}


function getFrequenciesBySender(frequencies, name) {
  return frequencies.map((d) => {
    return Object.assign({}, d, {
      count: d.counts[name] && d.counts[name].count ? d.counts[name].count : 0
    })
  })
}

function initiateCheckboxes(totalLineConfig, meLineConfig, themLineConfig) {
  d3.select("#total-checkbox")
    .property('checked', true)
    .on('click', () => {
      toggleLine(totalLineConfig);
    })

  d3.select("#me-checkbox")
    .property('checked', false)
    .on('click', () => {
      toggleLine(meLineConfig);
    })

  d3.select("#them-checkbox")
    .property('checked', false)
    .on('click', () => {
      toggleLine(themLineConfig);
    })
}


function setActiveView(activeId) {
  const viewIds = ["welcome-view", "chart-view"];
  viewIds.forEach((id) => {
    d3.select("#" + id)
      .classed("hidden", activeId !== id);
  })
}

function getLineConfig(lineType, frequencies, textMessages, searchValue){
  return new draw.LineConfig({
    lineType: lineType,
    chartId: chartId,
    textMessages: textMessages,
    frequencies: frequencies,
    drawTime: 3000,
    searchValue: searchValue,
    id: lineTypeEnum.toString(lineType) + '-line',
  })
}
