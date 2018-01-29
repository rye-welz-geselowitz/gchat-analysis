const LineType = {
  total: {},
  me: {},
  them: {}
}

function toString(lineType) {
  if (lineType === LineType.total) {
    return "total";
  }
  if (lineType === LineType.me) {
    return "me";
  }
  if (lineType === LineType.them) {
    return "them";
  }
}

module.exports = {
  LineType: LineType,
  toString: toString
}
