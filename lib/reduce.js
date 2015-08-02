'use strict';

var async = require('async');
var Collector = require('./collector');

function reduceSync(reasoner, types) {
  types = types || [];
  if (!Array.isArray(types)) types = [types];
  var ret = types.reduce(function(current, next) {
    // add only if next is not a superclass of anything else in types
    var node = reasoner.node(next);
    var subclasses = node.subClasses();
    if (!subclasses || subclasses.length === 0) {
      current.collect(next);
    } else {
      if (types.every(function(type) {
        return subclasses.indexOf(reasoner.node(type)) === -1;
      })) {
        current.collect(next);
      }
    }
    return current;
  }, new Collector()).items;
  return ret;
}

function reduceAsync(reasoner, types, callback) {
  types = types || [];
  if (!Array.isArray(types)) types = [types];
  async.reduce(types, new Collector(), function(current, next, done) {
    reasoner.node(next).subClasses(function(err,subclasses) {
      if (err) {
        done(err);
        return;
      }
      if (!subclasses || subclasses.length === 0) {
        current.collect(next);
        done(null,current);
      } else {
        async.every(types, function(type, done) {
          done(subclasses.indexOf(reasoner.node(type)) === -1);
        }, function(res) {
          if (res) current.collector(next);
          done(null, current);
        });
      }
    });
  }, function(err, res) {
    if (err) {
      callback(err);
      return;
    }
    callback(null,res.items);
  });
}

function reduce(reasoner, types, callback) {
  if (typeof callback === 'function')
    reduceAsync(reasoner, types, callback);
  else
    return reduceSync(reasoner, types);
}

module.exports = reduce;
