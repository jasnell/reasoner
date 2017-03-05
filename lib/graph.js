'use strict';

const N3 = require('n3');
const is_iterable = require('./isiterable');
const _store = Symbol('store');
const _graph = Symbol('graph');
const _items = Symbol('items');

class GraphIterator {
  constructor(graph, items) {
    this[_graph] = graph;
    this[_items] = items;
  }
  *[Symbol.iterator]() {
    for (let item of this[_items]) {
      item.graph = this[_graph];
      yield item;
    }
  }
  get length() {
    return this[_items].length;
  }
}

class Graph {
  constructor() {
    this[_store] = N3.Store();
  }

  get size() {
    return this[_store].size;
  }

  add(triple) {
    const store = this[_store];
    if (is_iterable(triple.object)) {
      for (let item of triple.object) {
        store.addTriple({
          subject: triple.subject,
          predicate: triple.predicate,
          object: item
        });
      }
    } else {
      store.addTriple(triple);
    }
    return this;
  }

  merge(graph) {
    for (let item of graph.find({})) {
      this.add({
        subject: item.subject,
        predicate: item.predicate,
        object: item.object
      });
    }
    return this;
  }

  find(triple) {
    triple = triple || {};
    return new GraphIterator(
      this,
      this[_store].findByIRI(
        triple.subject,
        triple.predicate,
        triple.object
      )
    );
  }

  count(triple) {
    return this.find(triple).length;
  }
}

Graph.StreamLoader = function(stream, callback) {
  setImmediate(() => {
    const graph = new Graph();
    const parser = N3.StreamParser();
    parser.on('data', (triple) => graph.add(triple))
          .on('end', () => callback(null,graph))
          .on('error', (err) => callback(err))
          .on('prefix', (prefix, iri) => {
            graph[_store].addPrefix(prefix, iri);
          });
    stream.pipe(parser);
  });
};

Graph.N3StoreLoader = function(store, callback) {
  const graph = new Graph();
  graph[_store] = store;
  callback(null, graph);
};

Object.defineProperty(Graph, '_storeSymbol', {
  enumerable: false,
  configurable: false,
  value: _store
});

module.exports = Graph;
