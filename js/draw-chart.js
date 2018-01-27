const d3 = require('d3');

const margin = {top: 20, right: 20, bottom: 50, left: 50},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

function drawChart(data, parentSelector, chartId, scaleLabel){

  data.sort( (a,b) => {
    return a.date.getTime() > b.date.getTime()? 1: -1;
  })

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

  // Add the X Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg.append("text")
        .attr("transform",
              "translate(" + (width/2) + " ," +
                             (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Date");
  // Add the Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Count by "+scaleLabel);

}

function addLine(data, chartId, lineId, scaleData){
  const drawTime = 3000;
  data.sort( (a,b) => {
    return a.date.getTime() > b.date.getTime()? 1: -1;
  })

  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);
  x.domain(d3.extent(scaleData, (d) => d.date));
  y.domain([0, d3.max(scaleData, (d) => d.count)]); //TODO: extract this

  const valueLine = d3.line()
      .x((d) => x(d.date))
      .y((d) => y(d.count))


  const svg = d3.select('#'+chartId).select('g');
  const lineGroup = svg.append("g").attr("id", lineId)
  const path = lineGroup.append("path")
    .datum(data)
    .attr("id", lineId)
    .attr("d", valueLine)

  lineGroup.selectAll("dot")
     .data(data)
   .enter().append("circle")
     .attr("r", 7)
     .attr("cx", function(d) { return x(d.date); })
     .attr("cy", function(d) { return y(d.count); })
     .attr("fill", "white")
     .attr("id", (d,i) => lineId+'-'+i)
     .style('opacity', 0)
     .transition()
     .duration(drawTime)
     .style('opacity', 1)




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
