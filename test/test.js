/* global it describe */
'use strict'

const assert = require('assert')
const Graph = require('../lib/graph')
const Reasoner = require('../lib/reasoner')
const rdf = require('vocabs-rdf')
const rdfs = require('vocabs-rdfs')

describe('It Works', () => {
  it('Should work', (done) => {
    const graph = new Graph()
    graph.add({
      subject: 'http://example.org/foo',
      predicate: 'http://example.org/bar',
      object: 'http://example.org/baz'
    })
    const reasoner = new Reasoner()
    reasoner.bind(graph)
    reasoner.bind(graph) // it's already been added
    assert.strictEqual(reasoner.size, 57)
    done()
  })

  it('Should merge', (done) => {
    const graph1 = new Graph()
    graph1.add({
      subject: 'http://example.org/foo',
      predicate: 'http://example.org/bar',
      object: 'http://example.org/baz'
    })
    const graph2 = new Graph()
    graph2.add({
      subject: 'http://example.org/foo1',
      predicate: 'http://example.org/bar1',
      object: 'http://example.org/baz1'
    })
    const graph3 = graph1.merge(graph2)
    assert.strictEqual(graph3.size, 2)
    done()
  })

  it('Should be reasonable...', (done) => {
    const graph = new Graph()
    graph.add({
      subject: 'http://example.org/words',
      predicate: rdfs.subPropertyOf,
      object: rdfs.ns + 'label'
    })
    graph.add({
      subject: 'http://example.org/foo',
      predicate: rdfs.ns + 'label',
      object: '"testing"'
    })
    graph.add({
      subject: 'http://example.org/foo',
      predicate: 'http://example.org/words',
      object: '"testing2"'
    })
    graph.add({
      subject: 'http://example.org/foo',
      predicate: rdf.type,
      object: 'http://example.org/bar'
    })
    graph.add({
      subject: 'http://example.org/foo',
      predicate: rdf.type,
      object: 'http://example.org/baz'
    })
    graph.add({
      subject: 'http://example.org/foo',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/boo'
    })
    graph.add({
      subject: 'http://example.org/boo',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/aaa'
    })
    graph.add({
      subject: 'http://example.org/aaa',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/ccc'
    })
    graph.add({
      subject: 'http://example.org/bar',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/aaa'
    })
    graph.add({
      subject: 'http://example.org/bbb',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/aaa'
    })
    var reasoner = new Reasoner(graph)
    const node = reasoner.node('http://example.org/foo')

    assert(node.is('http://example.org/bar'))
    assert(node.is('http://example.org/aaa'))
    assert(node.is('http://example.org/ccc'))
    assert(!node.is('http://example.org/bbb'))
    assert(node.is('http://example.org/bar'))

    {
      const set = new Set([
        'http://example.org/bar',
        'http://example.org/baz'
      ])
      const types = node.types
      assert.strictEqual(types.length, 2)
      for (var n = 0; n < types.length; n++) {
        assert(set.has(types[n].id))
      }
    }

    {
      const set = new Set([
        'http://example.org/boo',
        'http://example.org/aaa',
        'http://example.org/ccc'
      ])
      const types = node.superClasses
      assert.strictEqual(types.length, 3)
      for (let n = 0; n < types.length; n++) {
        assert(set.has(types[n].id))
      }
    }

    {
      const set = new Set([
        'http://example.org/bbb',
        'http://example.org/boo',
        'http://example.org/bar',
        'http://example.org/foo'
      ])
      const aaa = reasoner.node('http://example.org/aaa')
      const types = aaa.subClasses
      assert.strictEqual(types.length, 4)
      for (let n = 0; n < types.length; n++) {
        assert(set.has(types[n].id))
      }
    }

    {
      const set = new Set(['testing', 'testing2'])
      const labels = node.literal(`${rdfs.ns}label`)
      assert.strictEqual(labels.length, 3)
      for (let n = 0; n < labels.length; n++) {
        assert(set.has(`${labels[n]}`))
      }
    }

    done()
  })

  it('should load the graph from the stream', (done) => {
    const path = require('path')
    const file = path.resolve(__dirname, 'test.ttl')
    const fs = require('fs').createReadStream(file)
    Graph.StreamLoader(fs, (err, graph) => {
      assert(!err)
      assert.strictEqual(graph.size, 3)
      done()
    })
  })

  it('should reduce properly', (done) => {
    const graph = new Graph()
    graph.add({
      subject: 'http://example.org/foo',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/aaa'
    })
    graph.add({
      subject: 'http://example.org/bar',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/foo'
    })
    graph.add({
      subject: 'http://example.org/baz',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/aaa'
    })
    const reasoner = new Reasoner(graph)
    const types = [
      'http://example.org/foo',
      'http://example.org/bar',
      'http://example.org/baz',
      'http://example.org/baz',
      'http://example.org/aaa'
    ]
    const res = reasoner.reduce(types)
    assert.strictEqual(res.length, 2)
    assert.deepStrictEqual(res, [
      'http://example.org/bar',
      'http://example.org/baz'
    ])
    done()
  })
})
