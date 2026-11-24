// Turns the ?filter= query string into a MongoDB filter object.
function parseFilter(filterText) {
  if (!filterText) return {};
  return JSON.parse(filterText);
}

module.exports = { parseFilter };