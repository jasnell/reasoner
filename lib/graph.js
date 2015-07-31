'use strict';

var Symbol = require('es6-symbol');
var N3 = require('n3');
var stream = require('stream');
var Collector = require('./collector');
var async = require('async');
var _store = Symbol('store');

function copyInto(src,dest,callback) {
  src.find({}, function(err,triples) {
    if (err) {
      callback(err);
      return;
    }
    async.parallel(
      triples.map(function(triple) {
        return function(done) {
          dest.add({
            subject: triple.subject,
            predicate: triple.predicate,
            object: triple.object
          });
          done();
        };
      }),
      function() {
        callback(null);
      });
  });
}

function Graph() {
  if (!(this instanceof Graph))
    return new Graph();
  this[_store] = N3.Store();
}
Graph.prototype = {
  get size() {
    return this[_store].size;
  },
  add: function(triple) {
    this[_store].addTriple(triple);
    return this;
  },
  merge: function(graph, callback) {
    var self = this;
    if (typeof callback === 'function') {
      setImmediate(function() {
        async.waterfall([
          copyInto.bind(null,graph,self)
        ], function(err) {
          if (err) {
            callback(err);
            return;
          }
          callback(null,self);
        });
      });
    } else {
      graph.find({}).forEach(function(item) {
        self.add({
          subject:item.subject,
          predicate:item.predicate,
          object:item.object
        });
      });
      return this;
    }
  },
  find: function(triple, callback) {
    triple = triple || {};
    var graph = this;
    var store = graph[_store];
    function dofind() {
      return store.findByIRI(
        triple.subject,
        triple.predicate,
        triple.object
      ).map(function(item) {
        item.graph = graph;
        return item;
      });
    }
    if (typeof callback === 'function') {
      setImmediate(function() {
        try {
          callback(null,dofind(triple));
        } catch (err) {
          callback(err);
        }
      });
    } else {
      return dofind();
    }
  },
  count: function(triple, callback) {
    if (typeof callback === 'function') {
      this.find(triple, function(err,res) {
        if (err) {
          callback(err);
          return null;
        }
        callback(null, res.length);
      });
    } else {
      return this.find(triple).length;
    }
  }
};

Graph.StreamLoader = function(stream, callback) {
  process.nextTick(function() {
    var graph = new Graph();
    var parser = N3.StreamParser();
    parser.on('data', function(triple) {
      graph.add(triple);
    }).on('end', function() {
      callback(null,graph);
    }).on('error', function(err) {
      callback(err);
    }).on('prefix',function(prefix,iri) {
      graph[_store].addPrefix(prefix,iri);
    });
    stream.pipe(parser);
  });
};

Graph.N3StoreLoader = function(store, callback) {
  var graph = new Graph();
  graph[_store] = store;
  callback(null, graph);
};

module.exports = Graph;
