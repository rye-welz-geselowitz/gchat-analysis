const Scale = Object.freeze({
  day: 1,
  week: 2,
  month: 3,
  year: 4
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
