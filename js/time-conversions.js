function msToDays(ms){
  return ms / (1000*60*60*24);
}

function msToWeeks(ms){
  return msToDays(ms) / 7;
}

module.exports = {
  msToDays: msToDays,
  msToWeeks: msToWeeks
}
