const Scale = Object.freeze({
  day: {},
  week: {},
  month: {},
  year: {}
})

function toLabel(scale) {
  if(scale === Scale.day){
    return "day";
  }
  if(scale === Scale.week){
    return "week"
  }
  if(scale === Scale.month){
    return "month"
  }
  if(scale === Scale.year){
    return "year"
  }
}

module.exports = {
  Scale: Scale,
  toLabel: toLabel
}
