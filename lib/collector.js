var Symbol = require('es6-symbol');
var _set = Symbol('set');

function Collector() {
  if (!(this instanceof Collector))
    return new Collector();
  this[_set] = {};
}
Collector.prototype = {
  collect : function(item) {
    this[_set][item] = item;
  },
  get size() {
    return Object.keys(this[_set]).length;
  },
  get items() {
    var self = this;
    return Object.keys(this[_set]).map(function(key) {
      return self[_set][key];
    });
  }
};

module.exports = Collector;
