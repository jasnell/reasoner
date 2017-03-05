'use strict'

const Graph = require('./graph')
const XsdGraph = require('./xsd-graph')
const LanguageTag = require('rfc5646')
const N3 = require('n3').Util
const rdf = require('vocabs-rdf')
const rdfs = require('vocabs-rdfs')
const asx = require('vocabs-asx')
const xsd = require('vocabs-xsd')

const _graph = Symbol('graph')
const _reasoner = Symbol('reasoner')
const _id = Symbol('id')
const _cache = Symbol('cache')
const _value = Symbol('value')
const _language = Symbol('language')
const _type = Symbol('type')

const subPropertyOf = rdfs.subPropertyOf
const subClassOf = rdfs.subClassOf
const rdfType = rdf.type
const asxDate = asx.Date
const asxNumber = asx.Number

var nodeCache = Object.create(null)

function getNode (reasoner, id) {
  let node = nodeCache[id]
  if (node === undefined) {
    node = nodeCache[id] = new Node(reasoner, id)
  }
  return node
}

function cast (val, type) {
  if (!type) { return String(val) }
  if (type.is(asxDate)) { return new Date(val) }
  if (type.is(asxNumber)) { return Number(val) }
  return String(val)
}

class Literal {
  constructor (reasoner, literal) {
    const lang = N3.getLiteralLanguage(literal)
    const type = N3.getLiteralType(literal)
    if (lang) {
      this[_language] = new LanguageTag(
        N3.getLiteralLanguage(literal)).toString()
    }
    if (type) { this[_type] = getNode(reasoner, N3.getLiteralType(literal)) }
    this[_value] = cast(N3.getLiteralValue(literal), this[_type])
  }

  valueOf () {
    return this[_value]
  }

  toString () {
    return String(this[_value])
  }

  get language () {
    return this[_language]
  }

  get type () {
    return this[_type]
  }
}

class Node {
  constructor (reasoner, id) {
    this[_reasoner] = reasoner
    this[_id] = id
    this[_cache] = Object.create(null)
  }

  get id () {
    return this[_id]
  }

  toString () {
    return this.id
  }

  valueOf () {
    return this.id
  }

  findInbound (predicate) {
    return find(this, {
      object: this.id,
      predicate: predicate
    })
  }

  find (predicate) {
    return find(this, {
      subject: this.id,
      predicate: predicate
    })
  }

  literal (predicate) {
    return findLiteral(this, predicate)
  }

  get types () {
    const ret = this.find(rdfType)
    Object.defineProperty(this, 'types', {
      enumerable: true,
      configurable: false,
      value: ret
    })
    return ret
  }

  get subProperties () {
    const ret = collect(this, true, subPropertyOf)
    Object.defineProperty(this, 'subProperties', {
      enumerable: true,
      configurable: false,
      value: ret
    })
    return ret
  }

  get superProperties () {
    const ret = collect(this, false, subPropertyOf)
    Object.defineProperty(this, 'superProperties', {
      enumerable: true,
      configurable: false,
      value: ret
    })
    return ret
  }

  get subClasses () {
    const ret = collect(this, true, subClassOf)
    Object.defineProperty(this, 'subClasses', {
      enumerable: true,
      configurable: false,
      value: ret
    })
    return ret
  }

  get superClasses () {
    const ret = collect(this, false, subClassOf)
    Object.defineProperty(this, 'superClasses', {
      enumerable: true,
      configurable: false,
      value: ret
    })
    return ret
  }

  is (type, callback) {
    const cached = this[_cache][type]
    if (cached !== undefined) return Boolean(cached)
    const isType = (item) => item.is(type)
    const answer =
      type === this.id ||
      has(this, {subject: this.id, predicate: rdfType, object: type}) ||
      has(this, {subject: this.id, predicate: subClassOf, object: type}) ||
      has(this, {subject: this.id, predicate: subPropertyOf, object: type}) ||
      filter(this.types, isType) ||
      filter(this.superClasses, isType) ||
      filter(this.superProperties, isType)
    this[_cache][type] = answer
    return answer
  }
}

function filter (iter, predicate) {
  for (let n = 0; n < iter.length; n++) {
    if (predicate(iter[n])) { return true }
  }
  return false
}

function findLiteral (node, predicate) {
  const reasoner = node[_reasoner]
  const ret = []
  const triple = {
    subject: node.id,
    predicate: predicate
  }
  const expanded = expand(reasoner, triple)
  for (let n = 0; n < expanded.length; n++) {
    const item = expanded[n]
    const found = reasoner[_graph].find(item)
    for (let i = 0; i < found.length; i++) {
      if (isLiteral(found[i])) {
        ret.push(toLiteral(reasoner, found[i]))
      }
    }
  }
  return ret
}

function toLiteral (reasoner, triple) {
  return new Literal(reasoner, triple.object)
}

function isLiteral (triple) {
  if (!triple || !triple.object) return false
  return N3.isLiteral(triple.object)
}

function doexpand (triple, res) {
  const ret = [triple]
  if (!res) return ret
  const subject = triple.subject
  const object = triple.object
  for (let n = 0; n < res.length; n++) {
    ret.push({ subject, predicate: res[n], object })
  }
  return ret
}

function expand (reasoner, triple) {
  const predicateNode = getNode(reasoner, triple.predicate)
  if (triple.object === triple.predicate) { return [triple] }
  return doexpand(triple, predicateNode.subProperties)
}

function has (node, triple) {
  const reasoner = node[_reasoner]
  const expanded = expand(reasoner, triple)
  for (let n = 0; n < expanded.length; n++) {
    const item = expanded[n]
    if (reasoner[_graph].count(item) > 0) {
      return true
    }
  }
  return false
}

function find (node, triple) {
  const reasoner = node[_reasoner]
  const outbound = triple.subject && !triple.object
  const ret = []
  const expanded = expand(reasoner, triple)
  for (let n = 0; n < expanded.length; n++) {
    const item = expanded[n]
    const found = reasoner[_graph].find(item)
    for (let n = 0; n < found.length; n++) {
      const i = found[n]
      ret.push(getNode(reasoner, outbound ? i.object : i.subject))
    }
  }
  return ret
}

function collect (node, inbound, predicate) {
  const set = new Set()
  _collect(node, inbound, predicate, set)
  return Array.from(set)
}

function _collect (node, inbound, predicate, collector) {
  const f = !inbound ? node.find : node.findInbound
  const items = f.call(node, predicate)
  for (let n = 0; n < items.length; n++) {
    const type = items[n]
    collector.add(type)
    _collect(type, inbound, predicate, collector)
  }
}

class Reasoner {
  constructor (graph) {
    this[_graph] = new Graph()
    this.bind(XsdGraph)
    if (graph !== undefined) {
      if (Array.isArray(graph)) {
        for (let n = 0; n < graph.length; n++) {
          this.bind(graph[n])
        }
      } else {
        this.bind(graph)
      }
    }
  }

  get size () {
    return this[_graph].size
  }

  bind (graph) {
    nodeCache = Object.create(null)
    if (graph[Graph.kStoreSymbol] === undefined) {
      throw new TypeError('graph must be an instance of Graph')
    }
    this[_graph].merge(graph)
    return this
  }

  node (id) {
    return getNode(this, id)
  }

  literal (val, options) {
    if (val === undefined || val === null) return undefined
    options = options || {}
    if (val instanceof Date) {
      val = val.toISOString()
      options.type = options.type || xsd.dateTime
    } else if (typeof val === 'number') {
      if (Number.isSafeInteger(val)) {
        if (val > 0) {
          options.type = options.type || xsd.nonNegativeInteger
        } else if (val < 0) {
          options.type = options.type || xsd.nonPositiveInteger
        } else {
          options.type = options.type || xsd.integer
        }
      } else {
        options.type = options.type || xsd.float
      }
    }
    const lit = N3.createLiteral(
      String(val),
      options.language || options.type)
    return new Literal(this, lit)
  }

  reduce (types) {
    return Reasoner.reduce(this, types)
  }
}

Reasoner.Graph = Graph
Reasoner.reduce = require('./reduce')

module.exports = Reasoner
