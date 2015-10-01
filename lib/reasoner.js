'use strict';

const Graph = require('./graph');
const XsdGraph = require('./xsd-graph');
const LRU = require('lru-cache');
const vocabs = require('linkeddata-vocabs');
const LanguageTag = require('rfc5646');
const N3 = require('n3').Util;
const is_iterable = require('./isiterable');
const rdf = vocabs.rdf;
const rdfs = vocabs.rdfs;
const asx = vocabs.asx;
const xsd = vocabs.xsd;

const _graph = Symbol('graph');
const _reasoner = Symbol('reasoner');
const _id = Symbol('id');
const _cache = Symbol('cache');
const _value = Symbol('value');
const _language = Symbol('language');
const _type = Symbol('type');
const _types = Symbol('types');
const _subproperties = Symbol('subproperties');
const _subclasses = Symbol('subclasses');
const _superproperties = Symbol('superproperties');
const _superclasses = Symbol('superclasses');

const nodeCache = new LRU({
  max: 500,
  maxAge: 1000 * 60 * 60
});
function get_node(reasoner, id) {
  let node = nodeCache.get(id);
  if (typeof node !== 'undefined') return node;
  node = new Node(reasoner, id);
  nodeCache.set(id, node);
  return node;
}

function cast(val, type) {
  if (!type) return String(val);
  else if (type.is(asx.Date)) {
    return new Date(val);
  } else if (type.is(asx.Number)) {
    return Number(val);
  } else {
    return String(val);
  }
}

function is_integer(val) {
  return !isNaN(val) &&
    isFinite(val) &&
    val > -9007199254740992 &&
    val < 9007199254740992 &&
    Math.floor(val) === val;
}

class Literal {
  constructor(reasoner, literal) {
    let lang = N3.getLiteralLanguage(literal);
    let type = N3.getLiteralType(literal);
    if (lang)
      this[_language] = new LanguageTag(
        N3.getLiteralLanguage(literal)).toString();
    if (type)
      this[_type] = get_node(reasoner, N3.getLiteralType(literal));
    this[_value] = cast(N3.getLiteralValue(literal),this[_type]);
  }

  valueOf() {
    return this[_value];
  }

  toString() {
    return String(this.valueOf());
  }

  get language() {
    return this[_language];
  }

  get type() {
    return this[_type];
  }
}

class Node {
  constructor(reasoner, id) {
    this[_reasoner] = reasoner;
    this[_id] = id;
    this[_cache] = new LRU({max:10, maxAge: 1000 * 60});
  }

  get id() {
    return this[_id];
  }

  toString() {
    return this.id;
  }

  valueOf() {
    return this.id;
  }

  findInbound(predicate) {
    return find(this,{
      object: this.id,
      predicate: predicate
    });
  }

  find(predicate) {
    return find(this,{
      subject: this.id,
      predicate: predicate
    });
  }

  literal(predicate) {
    return findLiteral(this,predicate);
  }

  types() {
    let cached = this[_types];
    let ret = cached || this.find(rdf.type);
    this[_types] = ret;
    return ret;
  }

  subProperties() {
    let cached = this[_subproperties];
    let ret = cached || collect(this, true, rdfs.subPropertyOf);
    this[_subproperties] = ret;
    return ret;
  }

  superProperties() {
    let cached = this[_superproperties];
    let ret = cached || collect(this, false, rdfs.subPropertyOf);
    this[_superproperties] = ret;
    return ret;
  }

  subClasses() {
    let cached = this[_subclasses];
    let ret = cached || collect(this, true, rdfs.subClassOf);
    this[_subclasses] = ret;
    return ret;
  }

  superClasses() {
    let cached = this[_superclasses];
    let ret = cached || collect(this, false, rdfs.subClassOf);
    this[_superclasses] = ret;
    return ret;
  }

  is(type, callback) {
    var cached = this[_cache].get(type);
    if (cached !== undefined) return Boolean(cached);
    var answer = (
        type == this.id ||
        find(this,{subject:this.id,
              predicate:rdf.type,
              object:type
            }).length > 0                 ||  // or
        find(this,{subject:this.id,
              predicate:rdfs.subClassOf,
              object:type}).length > 0    ||  // or
        find(this,{subject:this.id,
              predicate:rdfs.subPropertyOf,
              object:type}).length > 0    ||  // or
        filter(this.types(), (item)=> {
              return item.is(type);
            }).length > 0                 ||  // or
        filter(this.superClasses(), (item)=> {
              return item.is(type);
            }).length > 0                 || // or
        filter(this.superProperties(), (item)=> {
              return item.is(type);
            }).length > 0);
    this[_cache].set(type,answer);
    return answer;
  }
}

function filter(iter, predicate) {
  let ret = [];
  for (let item of iter) {
    if (predicate(item)) ret.push(item);
  }
  return ret;
}

function findLiteral(node,predicate) {
  var reasoner = node[_reasoner];
  var ret = [];
  var triple = {
    subject: node.id,
    predicate: predicate
  };
  for (var item of expand(reasoner, triple)) {
    for (var i of reasoner[_graph].find(item)) {
      if (isLiteral(i))
        ret.push(toLiteral(reasoner,i));
    }
  }
  return ret;
}

function toLiteral(reasoner, triple) {
  return new Literal(reasoner,triple.object);
}

function isLiteral(triple) {
  if (!triple || !triple.object) return false;
  return N3.isLiteral(triple.object);
}

function expand(reasoner, triple) {
  var predicate_node = get_node(reasoner, triple.predicate);
  function doexpand(triple, res) {
    var ret = [triple];
    if (!res) return ret;
    for (let predicate of res) {
      ret.push({
        subject: triple.subject,
        predicate: predicate,
        object: triple.object
      });
    }
    return ret;
  }
  if (triple.object === triple.predicate)
    return [triple];
  return doexpand(triple,predicate_node.subProperties());
}

function find(node,triple) {
  let reasoner = node[_reasoner];
  let outbound = triple.subject && !triple.object;
  let ret = [];
  for (let item of expand(reasoner, triple)) {
    for (let i of reasoner[_graph].find(item)) {
      ret.push(get_node(
        reasoner,
        outbound ?
          i.object :
          i.subject
      ));
    }
  }
  return ret;
}

function collect(node, inbound, predicate) {
  return collectSync(node, inbound, predicate, new Set());
}

function collectSync(node, inbound, predicate, collector) {
  var f = !inbound ? node.find : node.findInbound;
  for (let type of f.call(node, predicate)) {
    collector.add(type);
    collectSync(type, inbound, predicate, collector);
  }
  return collector;
}

class Reasoner {
  constructor(graph) {
    this[_graph] = new Graph();
    this.bind(XsdGraph);
    if (graph) {
      if (!is_iterable(graph))
        graph = [graph];
      for (let g of graph)
        this.bind(g);
    }
  }

  get size() {
    return this[_graph].size;
  }

  bind(graph) {
    nodeCache.reset();
    if (!(graph instanceof Graph))
      throw new TypeError('graph must be an instance of Graph');
    this[_graph].merge(graph);
  }

  node(id) {
    return get_node(this, id);
  }

  literal(val, options) {
    if (val === undefined || val === null) return undefined;
    options = options || {};
    if (val instanceof Date) {
      val = val.toISOString();
      options.type = options.type || xsd.dateTime;
    } else if (!isNaN(val)) {
      val = Number(val);
      if (is_integer(val)) {
        if (val > 0) options.type = options.type || xsd.nonNegativeInteger;
        if (val < 0) options.type = options.type || xsd.nonPositiveInteger;
        if (val === 0) options.type = options.type || xsd.integer;
      } else {
        options.type = options.type || xsd.float;
      }
    }
    var lit = N3.createLiteral(
      String(val),
      options.language || options.type);
    return new Literal(this, lit);
  }

  reduce(types) {
    return Reasoner.reduce(this, types);
  }
}

Reasoner.Graph = Graph;
Reasoner.reduce = require('./reduce');

module.exports = Reasoner;
