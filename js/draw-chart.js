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
  y.domain([0, d3.max(data, (d) => d.count)]);

 const valueLine = d3.line()
     .x((d) =>  {
       return x(d.date)})
     .y((d) => y(d.count))

  // Add the X Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));

  addLine(data, chartId, "total-line", data)

  // const lineGroup = svg.append("g").attr("id", "total-line-g")
  //
  // lineGroup.selectAll("dot")
  //    .data(data)
  //  .enter().append("circle")
  //    .attr("r", 3.5)
  //    .attr("cx", function(d) { return x(d.date); })
  //    .attr("cy", function(d) { return y(d.count); });
  //
  // //Draw the line
  // const path = lineGroup.append("path")
  //   .datum(data)
  //   .attr("d", valueLine);

}

function addLine(data, chartId, lineId, scaleData){
  const drawTime = 3000;
  data.sort( (a,b) => {
    return a.date.getTime() > b.date.getTime()? 1: -1;
  })
  const margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);
  x.domain(d3.extent(scaleData, (d) => d.date));
  y.domain([0, d3.max(scaleData, (d) => d.count)]); //TODO: extract this

  const valueLine = d3.line()
      .x((d) => x(d.date))
      .y((d) => y(d.count))


  const svg = d3.select('#'+chartId).select('g');
  const lineGroup = svg.append("g").attr("id", lineId)

  lineGroup.selectAll("dot")
     .data(data)
   .enter().append("circle")
     .attr("r", 5)
     .attr("cx", function(d) { return x(d.date); })
     .attr("cy", function(d) { return y(d.count); })
     .style('opacity', 0)
     .transition()
     .duration(drawTime)
     .style('opacity', 1)


  const path = lineGroup.append("path")
    .datum(data)
    .attr("id", lineId)
    .attr("d", valueLine)

    const totalLength = path.node().getTotalLength();
      path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(drawTime)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)


}

module.exports = {
  drawChart: drawChart,
  addLine: addLine
}
