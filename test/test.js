'use strict';

const assert = require('assert');
const async = require('async');
const Graph = require('../lib/graph');
const Reasoner = require('../lib/reasoner');
const rdf = require('vocabs-rdf');
const rdfs = require('vocabs-rdfs');

describe('It Works', function() {

  it('Should work', function(done) {

    var graph = new Graph();
    graph.add({
      subject: 'http://example.org/foo',
      predicate: 'http://example.org/bar',
      object: 'http://example.org/baz'
    });

    var reasoner = new Reasoner();
    reasoner.bind(graph);
    reasoner.bind(graph); // it's already been added

    assert.equal(reasoner.size, 57);
    done();

  });

  it('Should merge', function(done) {

    var graph1 = new Graph();
    graph1.add({
      subject: 'http://example.org/foo',
      predicate: 'http://example.org/bar',
      object: 'http://example.org/baz'
    });
    var graph2 = new Graph();
    graph2.add({
      subject: 'http://example.org/foo1',
      predicate: 'http://example.org/bar1',
      object: 'http://example.org/baz1'
    });

    var graph3 = graph1.merge(graph2);
    assert.equal(graph3.size,2);

    done();
  });

  it('Should be reasonable...', function(done) {

    var graph = new Graph();
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

    var node = reasoner.node('http://example.org/foo');
    async.parallel([
      function(done) {
        var types = node.types();
        assert.equal(types.length,2);
        types.forEach(function(item) {
          assert(
            item.id === 'http://example.org/bar' ||
            item.id === 'http://example.org/baz'
          );
        });
        done();
      },
      function(done) {
        node.superClasses();
        done();
      },
      function(done) {
        var types = node.types();
        assert.equal(types.length,2);
        types.forEach(function(item) {
          assert(
            item.id === 'http://example.org/bar' ||
            item.id === 'http://example.org/baz'
          );
        });
        done();
      },
      function(done) {
        var types = node.superClasses();
        assert.equal(types.size,3);
        types.forEach(function(item) {
          assert(
            item.id === 'http://example.org/boo' ||
            item.id === 'http://example.org/aaa' ||
            item.id === 'http://example.org/ccc'
          );
        });
        done();
      },
      function(done) {
        assert(node.is('http://example.org/bar'));
        done();
      },
      function(done) {
        assert(node.is('http://example.org/aaa'));
        done();
      },
      function(done) {
        assert(node.is('http://example.org/ccc'));
        done();
      },
      function(done) {
        assert(!node.is('http://example.org/bbb'));
        done();
      },
      function(done) {
        assert(node.is('http://example.org/bar'));
        done();
      },
      function(done) {
        assert(node.is('http://example.org/bar'));
        done();
      },
      function(done) {
        assert(node.is('http://example.org/aaa'));
        done();
      },
      function(done) {
        assert(node.is('http://example.org/ccc'));
        done();
      },
      function(done) {
        assert(!node.is('http://example.org/bbb'));
        done();
      },
      function(done) {
        var aaa = reasoner.node('http://example.org/aaa');
        var types = aaa.subClasses();
        assert.equal(types.size, 4);
        types.forEach(function(m) {
           assert(
            m.id === 'http://example.org/bbb' ||
            m.id === 'http://example.org/boo' ||
            m.id === 'http://example.org/bar' ||
            m.id === 'http://example.org/foo'
           );
        });
        done();
      },
      function(done) {
        var labels = node.literal(rdfs.ns + 'label');
        assert.equal(labels.length, 2);
        labels.forEach(function(label) {
          assert(label == 'testing' ||
                 label == 'testing2');
        });
        done();
      }
    ], function() {
      done();
    });

  });

  it('should load the graph from the stream', function(done) {
    var path = require('path');
    var file = path.resolve(__dirname, 'test.ttl');
    var fs = require('fs').createReadStream(file);
    Graph.StreamLoader(fs, function(err, graph) {
      assert.equal(err,undefined);
      assert.equal(graph.size, 3);
      done();
    });
  });

  it('should reduce properly', function(done) {

    var graph = new Graph();
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
    var reasoner = new Reasoner(graph);
    var types = [
      'http://example.org/foo',
      'http://example.org/bar',
      'http://example.org/baz',
      'http://example.org/baz',
      'http://example.org/aaa'
    ];
    var res = reasoner.reduce(types);
    assert.equal(res.length,2);
    res.forEach(function(type) {
      assert(
        type === 'http://example.org/bar' ||
        type === 'http://example.org/baz'
      );
    });
    done();
  });
});
