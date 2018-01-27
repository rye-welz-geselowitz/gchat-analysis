const d3 = require('d3');

const margin = {top: 20, right: 20, bottom: 50, left: 50},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

function drawChart(data, parentSelector, chartId, scaleLabel){
  //Sort data
  data.sort( (a,b) => {
    return a.date.getTime() > b.date.getTime()? 1: -1;
  })
  //Set domain & range
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);
  x.domain(d3.extent(data, (d) => d.date));
  y.domain([0, d3.max(data, (d) => d.count)]);

  //Draw chart
  const svg = d3.select(parentSelector).append("svg")
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
              "translate(" + (width/2) + " ," +
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
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Count by "+scaleLabel);

}

function addLine(data, chartId, lineId, scaleData, rawData, getIds, myName, theirName, searchValue){
  const drawTime = 3000;
  //Sort
  data.sort( (a,b) => {
    return a.date.getTime() > b.date.getTime()? 1: -1;
  })
  //Set domain & range
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);
  x.domain(d3.extent(scaleData, (d) => d.date));
  y.domain([0, d3.max(scaleData, (d) => d.count)]); //TODO: extract this

  //Draw line
  const valueLine = d3.line()
      .x((d) => x(d.date))
      .y((d) => y(d.count))

  const svg = d3.select('#'+chartId).select('g');
  const lineGroup = svg.append("g").attr("id", lineId)
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

  //Add dots
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

   //Add onclick properties to data points
   data.forEach( (d,i) => {
     setDisplayMatchesOnClick(d, i, lineId, rawData, getIds, myName, theirName, searchValue)
   })

}

function setDisplayMatchesOnClick(d, i, lineId, data, getIds, myName, theirName, searchValue){
  const ids = getIds(d)
  d3.select("#"+lineId+"-"+i)
  .on("click", ()=> {
    d3.selectAll(".clicked").classed("clicked", false)
    d3.select("#"+lineId+"-"+i).attr('class', 'clicked')
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
        .classed("me", (d) => d.sender == myName)
        .classed("them", (d) => d.sender == theirName)
        .text( (d) => d.sender )
      divs.append("p")
        .attr("class", "date")
        .text( (d) => d.date )

      const textDiv = divs.append("p")
        .attr("class", "text")

      textDiv.selectAll('span')
        .data( (d) => {
          return textProcessing.isolateMatches(d.text, searchValue)
          })
        .enter()
        .append('span')
        .text( (d) => d )
        .classed("highlighted", (d) => d === searchValue)

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

module.exports = {
  drawChart: drawChart,
  addLine: addLine
}
