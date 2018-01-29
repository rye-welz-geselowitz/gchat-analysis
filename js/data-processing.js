const scaleEnum = require('./enum/scale.js');
const lineTypeEnum = require('./enum/line-type.js');
const textProcessing = require('./text-processing.js')
const ownerEnum = require('./enum/owner.js');
// EXPOSED

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

function WordFrequencyConfig(config) {
  const {
    myName,
    theirName,
    scale,
    searchValue
  } = config;
  if (myName && theirName && scale && searchValue) {
    this.myName = myName;
    this.theirName = theirName;
    this.scale = scale;
    this.searchValue = searchValue;
  } else {
    throw "Insufficient data"
  }
}

function getWordFrequency(data, config) {
  const {
    scale
  } = config;
  const keyToDatumDict =
    data.reduce((keyToDatum, d) => {
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
      if (!keyToDatum[key]) {
        keyToDatum[key] = new FrequencyDatum(key, config);
      }
      keyToDatum[key].processTextMessage(d);
      return keyToDatum;
    }, {})
  return Object.values(keyToDatumDict);
}


function FrequencyDatum(date, config) {
  this.date = date;
  this.myTextsCount = 0;
  this.theirTextsCount = 0;
  this.textMessages = [];
  this.scale = config.scale;
  this.searchValue = config.searchValue;
  this.getCount = getCountByLineType.bind(this)
  this.getTextMessages = getTextMessagesByLineType.bind(this)
  this.processTextMessage = processTextMessage.bind(this, config);
}

//HELPERS
function processTextMessage(config, textMessage) {
  const re = new RegExp(config.searchValue, "gi");
  const matchCount = countMatches(re, textMessage.text);
  let textMessageWithOwner;
  if (config.myName == textMessage.sender) {
    this.myTextsCount += matchCount;
    textMessageWithOwner = Object.assign({}, textMessage, {
      owner: ownerEnum.Owner.me
    })
  } else if (config.theirName == textMessage.sender) {
    this.theirTextsCount += matchCount;
    textMessageWithOwner = Object.assign({}, textMessage, {
      owner: ownerEnum.Owner.them
    })
  } else {
    throw "Inappropriate sender"
  }
  matchCount && this.textMessages.push(textMessageWithOwner);
}

function getCountByLineType(lineType) {
  if (lineType == lineTypeEnum.LineType.me) {
    return this.myTextsCount;
  }
  if (lineType == lineTypeEnum.LineType.them) {
    return this.theirTextsCount;
  }
  if (lineType == lineTypeEnum.LineType.total) {
    return this.theirTextsCount + this.myTextsCount;
  } else {
    throw "Invalid line type"
  }
}

function getTextMessagesByLineType(lineType) {
  let messages;
  if (lineType == lineTypeEnum.LineType.me) {
    messages = this.textMessages.filter((m) => m.owner == ownerEnum.Owner.me);
  } else if (lineType == lineTypeEnum.LineType.them) {
    messages = this.textMessages.filter((m) => m.owner == ownerEnum.Owner.them);
  } else if (lineType == lineTypeEnum.LineType.total) {
    messages = this.textMessages;
  } else {
    throw "Invalid line type"
  }
  return messages.map((message) => {
      const split = textProcessing.isolateMatches(message.text, this.searchValue);
      return Object.assign({}, message, {
        split: split
      });
    })
    .sort((a, b) => new Date(a.date) < new Date(b.date) ? 1 : -1)
}

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
