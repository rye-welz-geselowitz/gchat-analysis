function determineScale(data){
  const times1 = data.map( (d) => { d.date.getTime()});
  const times = data.map( (d) => d.date.getTime());
  const diffMs = Math.max(...times) - Math.min(...times);
  const diffDays = msToDays(diffMs);
  if(diffDays < 60){
    return Scale.day;
  }
  if(diffDays < 150){
    return Scale.week;
  }
  if(diffDays < 900){
    return Scale.month;
  }
  return Scale.year;
}

function getWordFrequency(data, scale, re){
  const dateToFrequency =
    data.reduce( (acc, d) => {
      const date = new Date(d.date);
      const time = date.getTime();
      let key;
      if(scale == Scale.day){
        key = Math.floor(msToDays(time)) //TODO: rethink
      }
      else if(scale == Scale.week){
        key = Math.floor(msToWeeks(time)) //TODO: rethink
      }
      else if(scale == Scale.month){
        key = new Date(date.getFullYear(), date.getMonth(), 1)
      }
      else if(scale == Scale.year){
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
    acc.push({date: key, scale: scale, counts: dateToFrequency[key]})
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
