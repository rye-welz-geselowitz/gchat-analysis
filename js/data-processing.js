const scaleEnum = require('./scale.js');

function determineScale(data){
  const times1 = data.map( (d) => { d.date.getTime()});
  const times = data.map( (d) => d.date.getTime());
  const diffMs = Math.max(...times) - Math.min(...times);
  const diffDays = msToDays(diffMs);
  if(diffDays < 60){
    return scaleEnum.Scale.day;
  }
  if(diffDays < 150){
    return scaleEnum.Scale.week;
  }
  if(diffDays < 900){
    return scaleEnum.Scale.month;
  }
  return scaleEnum.Scale.year;
}

function msToDays(ms){
  return ms / (1000*60*60*24);
}

function getWordFrequency(data, scale, searchValue){
  const re = new RegExp(searchValue, "gi");
  const dateToFrequency =
    data.reduce( (acc, d) => {
      const date = new Date(d.date);
      const time = date.getTime();
      let key;
      if(scale == scaleEnum.Scale.day){
        key = new Date(date.getFullYear(), date.getMonth(), date.getDay())
      }
      else if(scale == scaleEnum.Scale.week){
        key = new Date(date.getFullYear(), date.getMonth(), date.getDay()) //TODO: rethink
      }
      else if(scale == scaleEnum.Scale.month){
        key = new Date(date.getFullYear(), date.getMonth(), 1)
      }
      else if(scale == scaleEnum.Scale.year){
        key = new Date(date.getFullYear(), 0, 1) //TODO: rethink
      }
      if(!acc[key]){
        acc[key]= {};
      }
      if(!acc[key][d.sender]){
        acc[key][d.sender]=0;
      }
      acc[key][d.sender]+=(countMatches(re, d.text));
      return acc;
    }, {})
  return Object.keys(dateToFrequency).reduce( (acc, key)=>{
    acc.push({date: new Date(key), counts: dateToFrequency[key]})
    return acc;
  }, [])
}

function countMatches(re, str){
  let myArray;
  let count = 0;
  while ((myArray = re.exec(str)) !== null) {
    count++;
  }
  return count;
}


module.exports = {
  getWordFrequency: getWordFrequency,
  determineScale: determineScale
}
