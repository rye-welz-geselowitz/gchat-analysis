const data = freq;
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the line
var valueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y((d) =>{
      const count = Object.values(d.counts).reduce((a,b) => a+b, 0);
      return y(count);
    }

    );


var valueline2 = d3.line()
    .x(function(d) { return x(d.date); })
    .y((d) =>{
      const count = d.counts['E. Bogdan'];
      return y(count);
    }

    );

var valueline3 = d3.line()
    .x(function(d) { return x(d.date); })
    .y((d) =>{
      const count = d.counts['Sarah Geselowitz']
      return y(count);
    }

    );

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#chart-view").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Get the data

  // format the data
data.forEach(function(d) {
  const date = new Date(d.date);
  d.date = date;
  // d.date = parseTime(d.date);
});

// Scale the range of the data
x.domain(d3.extent(data, function(d) { return d.date; }));
y.domain([0, d3.max(data, (d) => {
  const count = Object.values(d.counts).reduce((a,b) => a+b, 0);
  return count;
 })]);


// Add the valueline path.
svg.append("path")
  .data([data])
  .attr("class", "line")
  .attr("d", valueline);


svg.append("path")
  .data([data])
  .attr("class", "ebb-line")
  .attr("d", valueline2);


svg.append("path")
  .data([data])
  .attr("class", "swg-line")
  .attr("d", valueline3);

// Add the X Axis
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// Add the Y Axis
svg.append("g")
  .call(d3.axisLeft(y));
