const moment = require('moment');

function compileMatchIndices(re, str) {
  var myArray;
  const indices = [];
  while ((myArray = re.exec(str)) !== null) {
    indices.push({
      start: myArray.index,
      end: re.lastIndex
    })
  }
  return indices;
}

function isolateMatches(str, searchValue) {
  const re = new RegExp(searchValue, "gi");
  const parsed = [];
  const indices = compileMatchIndices(re, str);
  if (!indices.length) {
    return [];
  }
  parsed.push(str.substring(0, indices[0].start))
  for (var i = 0; i < indices.length; i++) {
    const nextIndex = indices[i + 1] ? indices[i + 1].start : str.length;
    parsed.push(str.substring(indices[i].start, indices[i].end))
    parsed.push(str.substring(indices[i].end, nextIndex))
  }
  return parsed;
}


function parse(text, name1, name2){
    const re = new RegExp('(?<date>\\d{1,2}\\/\\d{1,2}\\/\\d\\d\,\\s\\d{1,2})\:\\d{1,2}\\s(AM|PM)\\s\\-\\s' + '(?<sender>' + name1 + '|' + name2 + ')\:(?<text>.*)' , 'g')

    const matches = [...text.matchAll(re)]
    const x = matches.map((m)=>{
        return {
                sender: m.groups.sender,
                text: m.groups.text,
                date: moment(m.groups.date, "M/D/YY").toDate() //TODO: parse time!!!!
        }
    })
    console.log(x)
    return x;
}

module.exports = {
  parse: parse,
  isolateMatches: isolateMatches
}
