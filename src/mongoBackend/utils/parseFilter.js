// Turns the ?filter= query string into a MongoDB filter object.
function parseFilter(filterText) {
  if (!filterText) return {};
  return eval("(" + filterText + ")");
}

module.exports = { parseFilter };