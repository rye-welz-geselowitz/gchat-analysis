const d3 = require('d3');
const textProcessing = require('./text-processing');
const lineTypeEnum = require('./enum/line-type.js');
const ownerEnum = require('./enum/owner.js');
const moment = require('moment');

const margin = {
    top: 20,
    right: 20,
    bottom: 50,
    left: 50
  },
  width = 600 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;



function drawChart(data, parentId, chartId, scaleLabel, lineType) {
  //Sort data
  data.sort((a, b) => {
    return a.date.getTime() > b.date.getTime() ? 1 : -1;
  })
  //Set domain & range
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);
  x.domain(d3.extent(data, (d) => d.date));
  y.domain([0, d3.max(data, (d) => d.getCount(lineType))]);

  //Draw chart
  const svg = d3.select("#" + parentId).append("svg")
    .attr("id", chartId)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");
  //Add x axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
  //X axis label
  svg.append("text")
    .attr("transform",
      "translate(" + (width / 2) + " ," +
      (height + margin.top + 20) + ")")
    .style("text-anchor", "middle")
    .text("Date");
  //Y axis
  svg.append("g")
    .call(d3.axisLeft(y));

  //Y axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Count by " + scaleLabel);

}

function LineConfig(config) {
  const {
    lineType,
    chartId,
    textMessages,
    frequencies,
    drawTime,
    id,
    searchValue
  } = config;
  if (lineType && chartId && textMessages && frequencies && drawTime && id && searchValue) {
    Object.assign(this, config)
  } else {
    throw "Invalid config"
  }

}

function addLine(config) {
  const {
    lineType,
    chartId,
    textMessages,
    frequencies,
    drawTime,
    id
  } = config;

  //Sort
  frequencies.sort((a, b) => {
    return a.date.getTime() > b.date.getTime() ? 1 : -1;
  })
  //Set domain & range
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);
  x.domain(d3.extent(frequencies, (d) => d.date));
  y.domain([0, d3.max(frequencies, (d) => d.getCount(lineTypeEnum.LineType.total))]);

  //Draw line
  const valueLine = d3.line()
    .x((d) => x(d.date))
    .y((d) => y(d.getCount(lineType)))

  const svg = d3.select('#' + chartId).select('g');
  const lineGroup = svg.append("g").attr("id", id)
  const path = lineGroup.append("path")
    .datum(frequencies)
    .attr("id", id)
    .attr("d", valueLine)

  const totalLength = path.node().getTotalLength();
  path
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(drawTime)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0)

  //Add dots
  lineGroup.selectAll("dot")
    .data(frequencies)
    .enter().append("circle")
    .attr("r", 7)
    .attr("cx", function(d) {
      return x(d.date);
    })
    .attr("cy", function(d) {
      return y(d.getCount(lineType));
    })
    .attr("fill", "white")
    .attr("id", (d, i) => id + '-' + i)
    .style('opacity', 0)
    .transition()
    .duration(drawTime)
    .style('opacity', 1)

  //Add onclick properties to data points
  frequencies.forEach((d, i) => {
    setDisplayMatchesOnClick(d, i, config)
  })

}

function setDisplayMatchesOnClick(d, i, lineConfig) {
  const {
    lineType,
    id,
    searchValue
  } = lineConfig;
  const textMessages = d.getTextMessages(lineType);
  d3.select("#" + id + "-" + i)
    .on("click", () => {
      d3.selectAll(".clicked").classed("clicked", false)
      d3.select("#" + id + "-" + i).attr('class', 'clicked')
      d3.select("#matches-content").remove();

      const newContent = d3.select("#matches")
        .append("div")
        .attr("id", "matches-content")

      if (textMessages.length) {
        const divs = newContent.selectAll('p').data(textMessages).enter().append('div');
        divs.append("p")
          .attr("class", "sender")
          .classed("me", (d) => d.owner === ownerEnum.Owner.me)
          .classed("them", (d) => d.owner === ownerEnum.Owner.them)
          .text((d) => d.sender)
        divs.append("p")
          .attr("class", "date")
          .text((d) => moment(d.date).format('YYYY-MM-DD'))

        const textDiv = divs.append("p")
          .attr("class", "text")

        textDiv.selectAll('span')
          .data((d) => d.split)
          .enter()
          .append('span')
          .text((d) => d)
          .classed("highlighted", (d) => d === searchValue)

      } else {
        newContent.selectAll('p').data([1]).enter().append("p").text(() => "No matches")
      }


    })

}

module.exports = {
  drawChart: drawChart,
  addLine: addLine,
  LineConfig: LineConfig
}
