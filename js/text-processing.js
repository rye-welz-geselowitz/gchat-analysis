const re = require('./regular-expression.js');

function splitTextByKey(re, str, process, acc){
  var myArray;
  const indices = [];
  while ((myArray = re.exec(str)) !== null) {
    indices.push({start: myArray.index, end: re.lastIndex})
  }
  for(var i=0; i<indices.length;i++){
    const nextIndex = indices[i+1]? indices[i+1].start : str.length;
    const key = str.substring(indices[i].start, indices[i].end);
    const value = str.substring(indices[i].end, nextIndex)
    acc = process(key, value, acc)
  }
  return acc;
}

function processByDateAndName(nameRe, match, textChunk, acc){
	const date = new Date(match);
  const newTexts = splitTextByKey(nameRe, textChunk, (match, followingText, acc)=>{
    acc.push({sender: match, text: followingText, date: date})
    return acc;
  }, []);
  return acc.concat(newTexts);
}


function parse(chats, name1, name2){
  const nameRe = new RegExp(name1+"|"+name2, "g");
  const split = splitTextByKey(re.timeStamp, chats, processByDateAndName.bind(this, nameRe), []);
  split.sort( (a,b) => a.date > b.date? 1 : -1 )
  return split.map((d, i) => Object.assign({}, d, {id: i}))
}

module.exports = {
  parse: parse
}
