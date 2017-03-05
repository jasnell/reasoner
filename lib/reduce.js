'use strict';

function reduce(reasoner, types) {
  types = types || [];
  if (!Array.isArray(types)) types = [types];
  const set = new Set();

  for (var n = 0; n < types.length; n++) {
    const type = types[n];
    const node = reasoner.node(type);
    const subclasses = node.subClasses;
    if (!subclasses || subclasses.length === 0) {
      set.add(type);
    } else {
      var add = true;
      for (var i = 0; i < types.length; i++) {
        if (subclasses.has(reasoner.node(types[i]))) {
          add = false;
          break;
        }
      }
      if (add)
        set.add(type);
    }
  }
  return Array.from(set);
}

module.exports = reduce;
