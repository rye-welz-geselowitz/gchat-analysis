const scaleEnum = require('./enum/scale.js');

// EXPOSED
//Given an array of items [{date: ""}] representing text messages,
//determined the scale for the chart
function determineScale(data) {
  const times = data.map((d) => d.date.getTime());
  const diffMs = Math.max(...times) - Math.min(...times);
  const diffDays = msToDays(diffMs);
  if (diffDays < 60) {
    return scaleEnum.Scale.day;
  }
  if (diffDays < 150) {
    return scaleEnum.Scale.week;
  }
  if (diffDays < 900) {
    return scaleEnum.Scale.month;
  }
  return scaleEnum.Scale.year;
}

function WordFrequencyConfig(config){
  const {myName, theirName, scale, searchValue} = config;
  if(myName && theirName && scale && searchValue){
    this.myName = myName;
    this.theirName = theirName;
    this.scale = scale;
    this.searchValue = searchValue;
  }
  else{
    throw "Insufficient data"
  }
}

function getWordFrequency(data, config){
  const {scale} = config;
  const keyToDatumDict =
    data.reduce( (keyToDatum,d) => {
      const date = new Date(d.date);
      let key;
      if (scale == scaleEnum.Scale.day) { //TODO: extract to scale enum
        key = new Date(date.getFullYear(), date.getMonth(), date.getDay())
      } else if (scale == scaleEnum.Scale.week) {
        key = new Date(date.getFullYear(), date.getMonth(), date.getDay())
      } else if (scale == scaleEnum.Scale.month) {
        key = new Date(date.getFullYear(), date.getMonth(), 1)
      } else if (scale == scaleEnum.Scale.year) {
        key = new Date(date.getFullYear(), 0, 1)
      }
      const datum = keyToDatum[key]? keyToDatum[key] : new FrequencyDatum(key, config);
      datum.processTextChunk(d);
      return keyToDatum;
    }, {})
  return Object.values(keyToDatumDict);
}

function FrequencyDatum(date, config){
  this.date = date;
  this.myTextsCount = 0;
  this.theirTextsCount = 0;
  this.myTextIds = [];
  this.theirTextIds = [];
  this.scale = config.scale;
  this.totalCount() => {
    return this.myTextsCount + this.theirTextsCount;
  }
  this.totalTextIds() => {
    return this.myTextIds.concat(this,theirTextIds);
  }
  this.processTextChunk = (textMessage) => {
    const re = new RegExp(config.searchValue, "gi");
    const matchCount = countMatches(re, textMessage.text);
    if(config.myName == textMessage.sender){
      this.myTextsCount+=matchCount;
      this.myTextIds += textMessage.id;
    }
    else if(config.theirName == textMessage.sender){
      this.theirTextsCount+=matchCount;
      this.theirTextIds += textMessage.id;
    }
    else{
      throw "Inappropriate sender"
    }
  }
}

//Given an array of  items representing text messages
//[{date: "", text: "", sender: ""}],
//a scale, and a search value,
//aggregates frequencies of the search value by the scale. Returns an array
//with items representing date and frequency
// [{date: "", counts: {"": {count: 0, ids: []}}}]
function getWordFrequency_OLD(data, config) {
  const re = new RegExp(config.searchValue, "gi");
  const dateToFrequency =
    data.reduce((acc, d) => {
      const date = new Date(d.date);
      let key;
      if (scale == scaleEnum.Scale.day) {
        key = new Date(date.getFullYear(), date.getMonth(), date.getDay())
      } else if (scale == scaleEnum.Scale.week) {
        key = new Date(date.getFullYear(), date.getMonth(), date.getDay())
      } else if (scale == scaleEnum.Scale.month) {
        key = new Date(date.getFullYear(), date.getMonth(), 1)
      } else if (scale == scaleEnum.Scale.year) {
        key = new Date(date.getFullYear(), 0, 1)
      }
      if (!acc[key]) {
        acc[key] = {};
      }
      if (!acc[key][d.sender]) {
        acc[key][d.sender] = {
          count: 0,
          ids: []
        };
      }
      const matchCount = countMatches(re, d.text);
      acc[key][d.sender].count += matchCount;
      if (matchCount) {
        acc[key][d.sender].ids.push(d.id)
      }
      return acc;
    }, {})
  return Object.keys(dateToFrequency).reduce((acc, key) => {
    acc.push({
      date: new Date(key),
      counts: dateToFrequency[key]
    })
    return acc;
  }, [])
}

//HELPERS
function msToDays(ms) {
  return ms / (1000 * 60 * 60 * 24);
}


function countMatches(re, str) {
  let myArray;
  let count = 0;
  while ((myArray = re.exec(str)) !== null) {
    count++;
  }
  return count;
}

module.exports = {
  getWordFrequency: getWordFrequency,
  determineScale: determineScale,
  WordFrequencyConfig: WordFrequencyConfig
}
