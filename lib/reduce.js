'use strict';

function reduceSync(reasoner, types) {
  types = types || [];
  if (!Array.isArray(types)) types = [types];
  let ret = types.reduce((current, next)=>{
    let node = reasoner.node(next);
    let subclasses = node.subClasses();
    if (!subclasses || subclasses.length === 0) {
      current.add(next);
    } else {
      if (types.every((type)=> {
        return !subclasses.has(reasoner.node(type));
      })) {
        current.add(next);
      }
    }
    return current;
  }, new Set());
  return Array.from(ret);
}

function reduce(reasoner, types) {
  return reduceSync(reasoner, types);
}

module.exports = reduce;
