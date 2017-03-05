'use strict';

const Graph = require('./graph');
const XsdGraph = require('./xsd-graph');
const LanguageTag = require('rfc5646');
const N3 = require('n3').Util;
const is_iterable = require('./isiterable');
const rdf = require('vocabs-rdf');
const rdfs = require('vocabs-rdfs');
const asx = require('vocabs-asx');
const xsd = require('vocabs-xsd');

const _graph = Symbol('graph');
const _reasoner = Symbol('reasoner');
const _id = Symbol('id');
const _cache = Symbol('cache');
const _value = Symbol('value');
const _language = Symbol('language');
const _type = Symbol('type');

const subPropertyOf = rdfs.subPropertyOf;
const subClassOf = rdfs.subClassOf;
const rdfType = rdf.type;
const asxDate = asx.Date;
const asxNumber = asx.Number;

var nodeCache = Object.create(null);

function get_node(reasoner, id) {
  let node = nodeCache[id];
  if (typeof node !== 'undefined') return node;
  node = new Node(reasoner, id);
  nodeCache[id] = node;
  return node;
}

function cast(val, type) {
  if (!type)
    return String(val);
  if (type.is(asxDate))
    return new Date(val);
  if (type.is(asxNumber))
    return Number(val);
  return String(val);
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
    const lang = N3.getLiteralLanguage(literal);
    const type = N3.getLiteralType(literal);
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
    return String(this[_value]);
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
    this[_cache] = Object.create(null);
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
    return find(this, {
      object: this.id,
      predicate: predicate
    });
  }

  find(predicate) {
    return find(this, {
      subject: this.id,
      predicate: predicate
    });
  }

  literal(predicate) {
    return findLiteral(this, predicate);
  }

  get types() {
    const ret = this.find(rdfType);
    Object.defineProperty(this, 'types', {
      enumerable: true,
      configurable: false,
      value: ret
    });
    return ret;
  }

  get subProperties() {
    const ret = collect(this, true, subPropertyOf);
    Object.defineProperty(this, 'subProperties', {
      enumerable: true,
      configurable: false,
      value: ret
    });
    return ret;
  }

  get superProperties() {
    const ret = collect(this, false, subPropertyOf);
    Object.defineProperty(this, 'superProperties', {
      enumerable: true,
      configurable: false,
      value: ret
    });
    return ret;
  }

  get subClasses() {
    const ret = collect(this, true, subClassOf);
    Object.defineProperty(this, 'subClasses', {
      enumerable: true,
      configurable: false,
      value: ret
    });
    return ret;
  }

  get superClasses() {
    const ret = collect(this, false, subClassOf);
    Object.defineProperty(this, 'superClasses', {
      enumerable: true,
      configurable: false,
      value: ret
    });
    return ret;
  }

  is(type, callback) {
    const cached = this[_cache][type];
    if (cached !== undefined) return Boolean(cached);
    const isType = (item) => item.is(type);
    const answer =
      type === this.id ||
      has(this, {subject: this.id, predicate: rdfType, object: type}) ||
      has(this, {subject: this.id, predicate: subClassOf, object: type}) ||
      has(this, {subject: this.id, predicate: subPropertyOf, object: type}) ||
      filter(this.types, isType) ||
      filter(this.superClasses, isType) ||
      filter(this.superProperties, isType);
    this[_cache][type] = answer;
    return answer;
  }
}

function filter(iter, predicate) {
  for (let item of iter) {
    if (predicate(item))
      return true;
  }
  return false;
}

function findLiteral(node, predicate) {
  const reasoner = node[_reasoner];
  const ret = [];
  const triple = {
    subject: node.id,
    predicate: predicate 
  };
  for (var item of expand(reasoner, triple)) {
    for (var i of reasoner[_graph].find(item)) {
      if (isLiteral(i)) {
        ret.push(toLiteral(reasoner, i));
      }
    }
  }
  return ret;
}

function toLiteral(reasoner, triple) {
  return new Literal(reasoner, triple.object);
}

function isLiteral(triple) {
  if (!triple || !triple.object) return false;
  return N3.isLiteral(triple.object);
}

function doexpand(triple, res) {
  const ret = [triple];
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

function expand(reasoner, triple) {
  const predicate_node = get_node(reasoner, triple.predicate);
  if (triple.object === triple.predicate)
    return [triple];
  return doexpand(triple, predicate_node.subProperties);
}

function has(node, triple) {
  const reasoner = node[_reasoner];
  const outbound = triple.subject && !triple.object;
  for (let item of expand(reasoner, triple)) {
    for (let i of reasoner[_graph].find(item)) {
      return true;
    }
  }
  return false;
}

function find(node, triple) {
  const reasoner = node[_reasoner];
  const outbound = triple.subject && !triple.object;
  const ret = [];
  for (let item of expand(reasoner, triple)) {
    for (let i of reasoner[_graph].find(item)) {
      ret.push(get_node(reasoner, outbound ? i.object : i.subject));
    }
  }
  return ret;
}

function collect(node, inbound, predicate) {
  return collectSync(node, inbound, predicate, new Set());
}

function collectSync(node, inbound, predicate, collector) {
  const f = !inbound ? node.find : node.findInbound;
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
    nodeCache = Object.create(null);
    if (graph[Graph._storeSymbol] === undefined)
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
        if (val > 0)
          options.type = options.type || xsd.nonNegativeInteger;
        else if (val < 0)
          options.type = options.type || xsd.nonPositiveInteger;
        else
          options.type = options.type || xsd.integer;
      } else {
        options.type = options.type || xsd.float;
      }
    }
    const lit = N3.createLiteral(
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
