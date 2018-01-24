const d3 = require('d3');

function drawChart(data, parentSelector, chartId){
  data.sort( (a,b) => {
    return a.date.getTime() > b.date.getTime()? 1: -1;
  })

  const margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const svg = d3.select(parentSelector).append("svg")
      .attr("id", chartId)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  x.domain(d3.extent(data, (d) => d.date));
  y.domain([0, d3.max(data, (d) => totalCount(d))]);

 const valueLine = d3.line()
     .x((d) => {
       return x(d.date);
     })
     .y((d) =>{
       return y(totalCount(d))
     })

  // Add the X Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));

  //Draw the line
  svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", valueLine);
}

function totalCount(d){
  return Object.values(d.counts).reduce((a,b) => a+b, 0);
}
module.exports = {
  drawChart: drawChart
}
