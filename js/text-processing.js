//TODO: description
function splitTextByKey(re, str, process, acc){
  const indices = compileMatchIndices(re, str);
  for(var i=0; i<indices.length;i++){
    const nextIndex = indices[i+1]? indices[i+1].start : str.length;
    const key = str.substring(indices[i].start, indices[i].end);
    const value = str.substring(indices[i].end, nextIndex)
    acc = process(key, value, acc)
  }
  return acc;
}

//TODO: description
function compileMatchIndices(re, str){
  var myArray;
  const indices = [];
  while ((myArray = re.exec(str)) !== null) {
    indices.push({start: myArray.index, end: re.lastIndex})
  }
  return indices;
}

//TODO: description
function processByDateAndName(nameRe, match, textChunk, acc){
	const date = new Date(match);
  const newTexts = splitTextByKey(nameRe, textChunk, (match, followingText, acc)=>{
    acc.push({sender: match, text: followingText, date: date})
    return acc;
  }, []);
  return acc.concat(newTexts);
}

//TODO: description
function isolateMatches(str, searchValue){
  const re = new RegExp(searchValue, "gi");
  const parsed = [];
  const indices = compileMatchIndices(re, str);
  if(!indices.length){
    return [];
  }
  parsed.push(str.substring(0, indices[0].start))
  for(var i=0; i<indices.length;i++){
    const nextIndex = indices[i+1]? indices[i+1].start : str.length;
    parsed.push(str.substring(indices[i].start, indices[i].end))
    parsed.push(str.substring(indices[i].end, nextIndex))
  }
  return parsed;
}


//TODO: description
function parse(chats, name1, name2){
  const timeStamp = /\w+,\s\w+\s\d{1,2},\s\d{4}\s\d{1,2}:\d{2}\s(?:AM|PM)/gi
  const nameRe = new RegExp(name1+"|"+name2, "g");
  const split = splitTextByKey(timeStamp, chats, processByDateAndName.bind(this, nameRe), []);
  split.sort( (a,b) => a.date > b.date? 1 : -1 )
  return split.map((d, i) => Object.assign({}, d, {id: i}))
}

module.exports = {
  parse: parse,
  isolateMatches: isolateMatches
}
