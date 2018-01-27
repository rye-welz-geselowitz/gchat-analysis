const LineType = {
  total: {},
  me: {},
  them: {}
}

function toId(lineType){
  if(lineType === LineType.total){
    return "total-line";
  }
  if(lineType === LineType.me){
    return "me-line"
  }
  if(lineType === LineType.them){
    return "them-line"
  }
}

module.exports = {
  LineType: LineType,
  toId: toId
}
