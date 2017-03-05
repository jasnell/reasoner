'use strict'

const N3 = require('n3')
const kStore = Symbol('store')

class Graph {
  constructor () {
    this[kStore] = N3.Store()
  }

  get size () {
    return this[kStore].size
  }

  add (triple) {
    const store = this[kStore]
    if (Array.isArray(triple.object)) {
      const subject = triple.subject
      const predicate = triple.predicate
      for (let n = 0; n < triple.object.length; n++) {
        store.addTriple({ subject, predicate, object: triple.object[n] })
      }
    } else {
      store.addTriple(triple)
    }
    return this
  }

  merge (graph) {
    const items = graph.find()
    for (let n = 0; n < items.length; n++) {
      const item = items[n]
      const subject = item.subject
      const predicate = item.predicate
      const object = item.object
      this.add({ subject, predicate, object })
    }
    return this
  }

  find (triple) {
    triple = triple || {}
    return this[kStore].getTriplesByIRI(
      triple.subject,
      triple.predicate,
      triple.object
    )
  }

  count (triple) {
    return this.find(triple).length
  }
}

Graph.StreamLoader = function (stream, callback) {
  const graph = new Graph()
  const parser = N3.StreamParser()
  parser.on('data', (triple) => graph.add(triple))
        .on('end', () => callback(null, graph))
        .on('error', (err) => callback(err))
        .on('prefix', (prefix, iri) => {
          graph[kStore].addPrefix(prefix, iri)
        })
  stream.pipe(parser)
}

Graph.N3StoreLoader = function (store, callback) {
  const graph = new Graph()
  graph[kStore] = store
  callback(null, graph)
}

Object.defineProperty(Graph, 'kStoreSymbol', {
  enumerable: false,
  configurable: false,
  value: kStore
})

module.exports = Graph
