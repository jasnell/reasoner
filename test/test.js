'use strict';

const assert = require('assert');
const async = require('async');
const Graph = require('../lib/graph');
const Reasoner = require('../lib/reasoner');
const rdf = require('vocabs-rdf');
const rdfs = require('vocabs-rdfs');

describe('It Works', () => {
  it('Should work', (done) => {
    const graph = new Graph();
    graph.add({
      subject: 'http://example.org/foo',
      predicate: 'http://example.org/bar',
      object: 'http://example.org/baz'
    });
    const reasoner = new Reasoner();
    reasoner.bind(graph);
    reasoner.bind(graph); // it's already been added
    assert.strictEqual(reasoner.size, 57);
    done();
  });

  it('Should merge', (done) => {
    const graph1 = new Graph();
    graph1.add({
      subject: 'http://example.org/foo',
      predicate: 'http://example.org/bar',
      object: 'http://example.org/baz'
    });
    const graph2 = new Graph();
    graph2.add({
      subject: 'http://example.org/foo1',
      predicate: 'http://example.org/bar1',
      object: 'http://example.org/baz1'
    });
    const graph3 = graph1.merge(graph2);
    assert.strictEqual(graph3.size, 2);
    done();
  });

  it('Should be reasonable...', (done) => {
    const graph = new Graph();
    graph.add({
      subject: 'http://example.org/words',
      predicate: rdfs.subPropertyOf,
      object: rdfs.ns + 'label'
    });
    graph.add({
      subject: 'http://example.org/foo',
      predicate: rdfs.ns + 'label',
      object: '"testing"'
    });
    graph.add({
      subject: 'http://example.org/foo',
      predicate: 'http://example.org/words',
      object: '"testing2"'
    });
    graph.add({
      subject: 'http://example.org/foo',
      predicate: rdf.type,
      object: 'http://example.org/bar'
    });
    graph.add({
      subject: 'http://example.org/foo',
      predicate: rdf.type,
      object: 'http://example.org/baz'
    });
    graph.add({
      subject: 'http://example.org/foo',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/boo'
    });
    graph.add({
      subject: 'http://example.org/boo',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/aaa'
    });
    graph.add({
      subject: 'http://example.org/aaa',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/ccc'
    });
    graph.add({
      subject: 'http://example.org/bar',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/aaa'
    });
    graph.add({
      subject: 'http://example.org/bbb',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/aaa'
    });
    var reasoner = new Reasoner(graph);
    const node = reasoner.node('http://example.org/foo');
    async.parallel([
      (done) => {
        const types = node.types;
        assert.strictEqual(types.length, 2);
        for (var n = 0; n < types.length; n++) {
          const id = types[n].id;
          assert(
            id === 'http://example.org/bar' ||
            id === 'http://example.org/baz'
          );
        }
        done();
      },
      (done) => {
        node.superClasses;
        done();
      },
      (done) => {
        const types = node.types;
        assert.strictEqual(types.length, 2);
        for (var n = 0; n < types.length; n++) {
          const id = types[n].id;
          assert(
            id === 'http://example.org/bar' ||
            id === 'http://example.org/baz'
          );
        }
        done();
      },
      (done) => {
        const types = node.superClasses;
        assert.strictEqual(types.size, 3);
        for (var n = 0; n < types.length; n++) {
          const id = types[n].id;
          assert(
            id === 'http://example.org/boo' ||
            id === 'http://example.org/aaa' ||
            id === 'http://example.org/ccc'
          );
        }
        done();
      },
      (done) => {
        assert(node.is('http://example.org/bar'));
        done();
      },
      (done) => {
        assert(node.is('http://example.org/aaa'));
        done();
      },
      (done) => {
        assert(node.is('http://example.org/ccc'));
        done();
      },
      (done) => {
        assert(!node.is('http://example.org/bbb'));
        done();
      },
      (done) => {
        assert(node.is('http://example.org/bar'));
        done();
      },
      (done) => {
        assert(node.is('http://example.org/bar'));
        done();
      },
      (done) => {
        assert(node.is('http://example.org/aaa'));
        done();
      },
      (done) => {
        assert(node.is('http://example.org/ccc'));
        done();
      },
      (done) => {
        assert(!node.is('http://example.org/bbb'));
        done();
      },
      (done) => {
        const aaa = reasoner.node('http://example.org/aaa');
        const types = aaa.subClasses;
        assert.strictEqual(types.size, 4);
        for (var n = 0; n < types.length; n++) {
          const id = types[n].id;
          assert(
            id === 'http://example.org/bbb' ||
            id === 'http://example.org/boo' ||
            id === 'http://example.org/bar' ||
            id === 'http://example.org/foo'
          );
        }
        done();
      },
      (done) => {
        const labels = node.literal(`${rdfs.ns}label`);
        assert.strictEqual(labels.length, 3);
        for (var n = 0; n < labels.length; n++) {
          assert(labels[n] == 'testing' ||
                 labels[n] == 'testing2');
        }
        done();
      }
    ], () => {
      done();
    });

  });

  it('should load the graph from the stream', (done) => {
    const path = require('path');
    const file = path.resolve(__dirname, 'test.ttl');
    const fs = require('fs').createReadStream(file);
    Graph.StreamLoader(fs, (err, graph) => {
      assert(!err);
      assert.strictEqual(graph.size, 3);
      done();
    });
  });

  it('should reduce properly', (done) => {

    const graph = new Graph();
    graph.add({
      subject: 'http://example.org/foo',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/aaa'
    });
    graph.add({
      subject: 'http://example.org/bar',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/foo'
    });
    graph.add({
      subject: 'http://example.org/baz',
      predicate: rdfs.subClassOf,
      object: 'http://example.org/aaa'
    });
    const reasoner = new Reasoner(graph);
    const types = [
      'http://example.org/foo',
      'http://example.org/bar',
      'http://example.org/baz',
      'http://example.org/baz',
      'http://example.org/aaa'
    ];
    const res = reasoner.reduce(types);
    assert.strictEqual(res.length, 2);
    for (var n = 0; n < res.length; n++) {
      assert(
        res[n] === 'http://example.org/bar' ||
        res[n] === 'http://example.org/baz'
      );
    }
    done();
  });
});
