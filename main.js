const d3 = require('d3');
const parseText = require('./js/parse-text');

d3.select("#submit-btn")
.on('click', ()=>{
  // const chats =
  //   d3.select("#chats-input").node().value()
  // console.log(chats)
  d3.select("#welcome-view")
    .attr('hidden', true)
})
