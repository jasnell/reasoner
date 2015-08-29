'use strict';

const Symbol = require('es6-symbol');
const Graph = require('./graph');
const Collector = require('./collector');
const XsdGraph = require('./xsd-graph');
const LRU = require('./loading-lru-cache');
const vocabs = require('linkeddata-vocabs');
const LanguageTag = require('rfc5646');
const N3 = require('n3').Util;
const async = require('async');
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
  return nodeCache.get(id, function() {
    return new Node(reasoner, id);
  });
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

function Literal(reasoner, literal) {
  if (!(this instanceof Literal))
    return new Literal(literal);
  var lang = N3.getLiteralLanguage(literal);
  var type = N3.getLiteralType(literal);
  if (lang)
    this[_language] = new LanguageTag(
      N3.getLiteralLanguage(literal)).toString();
  if (type)
    this[_type] = get_node(reasoner, N3.getLiteralType(literal));
  this[_value] = cast(N3.getLiteralValue(literal),this[_type]);
}
Literal.prototype = {
  valueOf : function() {
    // TODO: cast based on type
    return this[_value];
  },
  toString : function() {
    return String(this.valueOf());
  },
  get language() {
    return this[_language];
  },
  get type() {
    return this[_type];
  }
};

function Node(reasoner, id) {
  if (!(this instanceof Node))
    return new Node(reasoner,id);
  this[_reasoner] = reasoner;
  this[_id] = id;
  this[_cache] = new LRU({max:10, maxAge: 1000 * 60});
}
Node.prototype = {
  get id() {
    return this[_id];
  },
  toString: function() {
    return this.id;
  },
  valueOf: function() {
    return this.id;
  },
  findInbound: function(predicate, callback) {
    return find(this,{
      object: this.id,
      predicate: predicate
    },callback);

  },
  find : function(predicate, callback) {
    return find(this,{
      subject: this.id,
      predicate: predicate
    },callback);
  },
  literal : function(predicate, callback) {
    return findLiteral(this,predicate,callback);
  },
  types : function(callback) {
    var cached = this[_types];
    var self = this;
    if (typeof callback === 'function') {
      if (cached) {
        callback(null,cached);
      } else {
        this.find(rdf.type, function(err,ret) {
          if (err) {
            callback(err);
            return;
          }
          self[_types] = ret;
          callback(null, ret);
        });
      }
    } else {
      var ret = cached || this.find(rdf.type);
      this[_types] = ret;
      return ret;
    }
  },
  subProperties : function(callback) {
    var cached = this[_subproperties];
    var self = this;
    if (typeof callback === 'function') {
      if (cached) {
        callback(null,cached);
      } else {
        collect(this, true, rdfs.subPropertyOf, function(err, ret) {
          if (err) {
            callback(err);
            return;
          }
          self[_subproperties] = ret;
          callback(null,ret);
        });
      }
    } else {
      var ret = cached || collect(this, true, rdfs.subPropertyOf);
      this[_subproperties] = ret;
      return ret;
    }
  },
  superProperties : function(callback) {
    var cached = this[_superproperties];
    var self = this;
    if (typeof callback === 'function') {
      if (cached) {
        callback(null,cached);
      } else {
        collect(this, false, rdfs.subPropertyOf, function(err, ret) {
          if (err) {
            callback(err);
            return;
          }
          self[_superproperties] = ret;
          callback(null,ret);
        });
      }
    } else {
      var ret = cached || collect(this, false, rdfs.subPropertyOf);
      this[_superproperties] = ret;
      return ret;
    }
  },
  subClasses : function(callback) {
    var cached = this[_subclasses];
    var self = this;
    if (typeof callback === 'function') {
      if (cached) {
        callback(null,cached);
      } else {
        collect(this, true, rdfs.subClassOf, function(err, ret) {
          if (err) {
            callback(err);
            return;
          }
          self[_subclasses] = ret;
          callback(null,ret);
        });
      }
    } else {
      var ret = cached || collect(this, true, rdfs.subClassOf);
      this[_subclasses] = ret;
      return ret;
    }
  },
  superClasses : function(callback) {
    var cached = this[_superclasses];
    var self = this;
    if (typeof callback === 'function') {
      if (cached) {
        callback(null,cached);
      } else {
        collect(this, false, rdfs.subClassOf, function(err, ret) {
          if (err) {
            callback(err);
            return;
          }
          self[_superclasses] = ret;
          callback(null,ret);
        });
      }
    } else {
      var ret = cached || collect(this, false, rdfs.subClassOf);
      this[_superclasses] = ret;
      return ret;
    }
  },
  is : function(type, callback) {
    var self = this;
    var cached = this[_cache].get(type);
    if (typeof callback === 'function') {
      if (cached !== undefined) {
        callback(Boolean(cached));
        return;
      }
      if (type == self.id) callback(true);
      async.series(
        [
          // easiest.. is this thing rdf:type type
          function(done) {
            // check type
            find(self, {
              subject: self.id,
              predicate: rdf.type,
              object: type
            }, function(err,res) {
              if (err) {
                done(err);
                return;
              }
              if (Array.isArray(res) && res.length > 0) {
                done(true);
                return;
              }
              done(null);
            });
          },
          // is type a superClass?
          function(done) {
            find(self, {
              subject: self.id,
              predicate: rdfs.subClassOf,
              object: type
            }, function(err,res) {
              if (err) {
                done(err);
                return;
              }
              if (Array.isArray(res) && res.length > 0) {
                done(true);
                return;
              }
              done(null);
            });
          },
          // is type a superProperty?
          function(done) {
            find(self, {
              subject: self.id,
              predicate: rdfs.subPropertyOf,
              object: type
            }, function(err,res) {
              if (err) {
                done(err);
                return;
              }
              if (Array.isArray(res) && res.length > 0) {
                done(true);
                return;
              }
              done(null);
            });
          },
          // bit harder, are any of it's rdf:type's is(type)
          function(done) {
            self.types(function(err,types) {
              if (err) {
                done(err);
                return;
              }
              if (Array.isArray(types)) {
                async.detect(types, function(item,done) {
                  item.is(type, function(res) {
                    done(res);
                  });
                }, function(type) {
                  done(Boolean(type));
                });
              } else {
                done(null);
              }
            });
          },
          // are any of it's superClasses is(type)
          function(done) {
            self.superClasses(function(err,types) {
              if (err) {
                done(err);
                return;
              }
              if (Array.isArray(types)) {
                async.detect(types, function(item,done) {
                  item.is(type, function(res) {
                    done(res);
                  });
                }, function(type) {
                  done(Boolean(type));
                });
              } else {
                done(null);
              }
            });
          },
          // are any of it's superProperties is(type)
          function(done) {
            self.superProperties(function(err,types) {
              if (err) {
                done(err);
                return;
              }
              if (Array.isArray(types)) {
                async.detect(types, function(item,done) {
                  item.is(type, function(res) {
                    done(res);
                  });
                }, function(type) {
                  done(Boolean(type));
                });
              } else {
                done(null);
              }
            });
          }
        ],
        function(result) {
          var answer = false;
          if (result instanceof Error) answer = false;
          else answer = Boolean(result);
          self[_cache].set(type,answer);
          callback(answer);
        });
    } else {
      if (cached !== undefined) return Boolean(cached);
      var answer = (
          type == self.id ||
          find(self,{subject:self.id,
                predicate:rdf.type,
                object:type
              }).length > 0                 ||  // or
          find(self,{subject:self.id,
                predicate:rdfs.subClassOf,
                object:type}).length > 0    ||  // or
          find(self,{subject:self.id,
                predicate:rdfs.subPropertyOf,
                object:type}).length > 0    ||  // or
          self.types().filter(function(item) {
                return item.is(type);
              }).length > 0                 ||  // or
          self.superClasses().filter(function(item) {
                return item.is(type);
              }).length > 0                 || // or
          self.superProperties().filter(function(item) {
                return item.is(type);
              }).length > 0);
      self[_cache].set(type,answer);
      return answer;
    }
  }
};

function dofindLiteral(toLit, graph, ret, triple, done) {
  graph.find(triple, function(err, results) {
    if (err) {
      done(err);
      return;
    }
    if (Array.isArray(results)) {
      results.forEach(function(item) {
        if (isLiteral(item)) {
          ret.push(toLit(item));
        }
      });
    }
    done();
  });
}

function findLiteral(node,predicate,callback) {
  var reasoner = node[_reasoner];
  var graph = reasoner[_graph];
  var toLit = toLiteral.bind(null, reasoner);
  var ret = [];
  var triple = {
    subject: node.id,
    predicate: predicate
  };
  if (typeof callback === 'function') {
    expand(reasoner, triple, function(err,triples) {
      if (err) {
        callback(err);
        return;
      }
      setImmediate(function() {
        async.parallel(
          triples.map(function(triple) {
            return dofindLiteral.bind(null,toLit,graph,ret,triple);
          }),
          function(err) {
            if (err) {
              callback(err);
              return;
            }
            callback(null,ret);
          }
        );
      });
    });
  } else {
    var triples = expand(reasoner, triple);
    triples.forEach(function(triple) {
      graph.find(triple).forEach(function(item) {
        if (isLiteral(item)) {
          ret.push(toLit(item));
        }
      });
    });
    return ret;
  }
}

function toLiteral(reasoner, triple) {
  return new Literal(reasoner,triple.object);
}

function isLiteral(triple) {
  if (!triple || !triple.object) return false;
  return N3.isLiteral(triple.object);
}

function expand(reasoner, triple, callback) {
  var predicate_node = get_node(reasoner, triple.predicate);
  function doexpand(triple, res) {
    var ret = [triple];
    if (!res) return ret;
    res.forEach(function(predicate) {
      ret.push({
        subject: triple.subject,
        predicate: predicate,
        object: triple.object
      });
    });
    return ret;
  }
  if (typeof callback === 'function') {
    if (triple.object === triple.predicate) {
      callback(null,[triple]);
      return;
    }
    setImmediate(function() {
      predicate_node.subProperties(function(err, res) {
        if (err) {
          callback(err);
          return;
        }
        callback(null, doexpand(triple,res));
      });
    });
  } else {
    if (triple.object === triple.predicate) {
      return [triple];
    }
    var res = predicate_node.subProperties();
    return doexpand(triple,res);
  }
}

function dofind(reasoner, graph, ret, triple, outbound, done) {
  graph.find(triple, function(err, results) {
    if (err) {
      done(err);
      return;
    }
    if (Array.isArray(results)) {
      results.forEach(
        function(triple){
          ret.push(get_node(
            reasoner,
            outbound ?
              triple.object :
              triple.subject));
      });
      done();
    } else done(null);
  });
}

function find(node,triple,callback) {
  var reasoner = node[_reasoner];
  var graph = reasoner[_graph];
  var outbound = triple.subject && !triple.object;
  var ret = [];
  if (typeof callback === 'function') {
    expand(reasoner,triple,function(err,triples) {
      if (err) {
        callback(err);
        return;
      }
      setImmediate(function() {
        async.parallel(
          triples.map(function(triple) {
            return dofind.bind(null,reasoner,graph,ret,triple,outbound);
          }),
          function(err) {
            if (err) {
              callback(err);
              return;
            }
            callback(null,ret);
          }
        );
      });
    });
  } else {
    var triples = expand(reasoner,triple);
    triples.forEach(function(triple) {
      var items = graph.find(triple);
      items.forEach(function(triple) {
        var node = get_node(
          reasoner,
          outbound ?
            triple.object :
            triple.subject);
        ret.push(node);
      });
    });
    return ret;
  }
}

function collect(node, inbound, predicate, callback) {
  var collector = new Collector();
  if (typeof callback === 'function') {
    collectAsync(node, inbound, predicate, collector, function(err) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, collector.items);
    });
  } else {
    return collectSync(node, inbound, predicate, collector);
  }
}

function collectSync(node, inbound, predicate, collector) {
  var f = !inbound ? node.find : node.findInbound;
  f.call(node, predicate).forEach(function(type) {
    collector.collect(type);
    collectSync(type, inbound, predicate, collector);
  });
  return collector.items;
}

function collectAsync(node, inbound, predicate, collector, callback) {
  var f = (!inbound) ? node.find : node.findInbound;
  f.call(node,predicate, function(err,types) {
    if (err) {
      callback(err);
      return;
    }
    async.parallel(
      types.map(function(type) {
        collector.collect(type);
        return collectAsync.bind(null, type, inbound, predicate, collector);
      }),
      function(err) {
        callback(err);
      }
    );
  });
}

function Reasoner(graph) {
  if (!(this instanceof Reasoner))
    return new Reasoner();
  this[_graph] = new Graph();
  this.bind(XsdGraph);
  if (graph) {
    if (Array.isArray(graph)) {
      graph.forEach(this.bind);
    } else {
      this.bind(graph);
    }
  }
}
Reasoner.prototype = {
  get size() {
    return this[_graph].size;
  },
  bind : function(graph, callback) {
    nodeCache.reset();
    if (!(graph instanceof Graph))
      throw new TypeError('graph must be an instance of Graph');
    if (typeof callback === 'function') {
      var self = this;
      self[_graph].merge(graph, function(err, newgraph) {
        if (err) {
          callback(err);
          return;
        }
        self[_graph] = newgraph;
      });
    } else {
      this[_graph].merge(graph);
    }
  },
  node : function(id) {
    return get_node(this,id);
  },
  literal : function(val, options) {
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
  },
  reduce : function(types, callback) {
    return Reasoner.reduce(this, types, callback);
  }
};
Reasoner.Graph = Graph;
Reasoner.reduce = require('./reduce');

module.exports = Reasoner;
