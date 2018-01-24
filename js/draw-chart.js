const d3 = require('d3');

function drawChart(data, parentSelector, chartId){
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


  console.log(data)
  x.domain(d3.extent(data, (d) => d.date));
  y.domain([0, d3.max(data, (d) => {
    const count = Object.values(d.counts).reduce((a,b) => a+b, 0);
    return count;
   })]);

 const valueLine = d3.line()
     .x((d) => { return x(d.date); })
     .y((d) =>{
       const count = Object.values(d.counts).reduce((a,b) => a+b, 0);
       return y(count);
     });

  // Add the X Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add the Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));


    svg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", valueLine);
}

module.exports = {
  drawChart: drawChart
}
