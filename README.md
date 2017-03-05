## Reasoner
A simple linked data reasoner...

This module began life as part of the ActivityStrea.ms implementation
(http://github.com/jasnell/activitystrea.ms).

### Requirements:

This module requires Node.js 4.0.0 and uses ES6 language features.

### Install:
```
npm install reasoner
```

### Example:
```
const rdf = require('linkeddata-vocabs').rdf;
const Reasoner = require('reasoner');
const Graph = Reasoner.Graph;

const graph = new Graph();
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

const reasoner = new Reasoner(graph);
const node = reasoner.node('http://example.org/foo');

node.is('http://example.org/bar'); // true
node.is('http://example.org/boo'); // true
node.is('http://example.org/aaa'); // true
node.is('http://example.org/ccc'); // true
node.is('http://example.org/bbb'); // false
```

## API

### Constructor: `Reasoner([graph])`

Creates a new Reasoner. Either a single `Reasoner.Graph` instance, or an array
of `Reasoner.Graph` instances can be provided to the constructor to be bound
automatically when the Reasoner is created.

#### Property: `<number> Reasoner.prototype.size`

The total number of triples known to the Reasoner.

#### Method: `Reasoner.prototype.bind(graph)`

Binds a single `Reasoner.Graph` instance to the Reasoner.

#### Method: `<Reasoner.Node> Reasoner.prototype.node(uri)`

Returns a `Reasoner.Node` instance. A Node represents a single subject known to
the Reasoner.

#### Method: `<Reasoner.Literal> Reasoner.prototype.literal(value[, options])`

Utility method that creates new `Reasoner.Literal`

### Constructor: `Reasoner.Graph()`

Creates a new `Reasoner.Graph` instance. A Graph is essentially a thin wrapper
around an `N3.Store` object.

#### Property : `<number> Reasoner.Graph.prototype.size`

Returns the total number of triples known to the Graph.

#### Method: `Reasoner.Graph.prototype.add(triple)`

Adds a single triple to the Graph. The argument is an object with three
properties: `subject`, `predicate` and `object`.

```javascript
const Graph = require('reasoner').Graph;
const graph = new Graph();

graph.add({
  subject: 'http://example.org/foo',
  predicate: 'http://example.org/bar',
  object: 'http://example.org/baz'
});
```

#### Method: `Reasoner.Graph.prototype.merge(graph)`

Merge the specified Graph into this Graph.

#### Method: `Reasoner.Graph.prototype.find(triple)`

Search the Graph for triples matching the specified pattern.

```javascript
const Graph = require('reasoner').Graph;
const graph = new Graph();

graph.add({
  subject: 'http://example.org/foo',
  predicate: 'http://example.org/bar',
  object: 'http://example.org/baz'
});

const triples = graph.find({subject:'http://example.org/foo'});
for (const triple of triples) {
  console.log(triple);
}
```

### Object: `Reasoner.Node`

The `Reasoner.Node` object provides access to explicit and inferred information
about a single subject known to the Reasoner.

```javascript
const Reasoner = require('reasoner');
const Graph = Reasoner.Graph;
const graph = new Graph();

graph.add({
  subject: 'http://example.org/foo',
  predicate: 'http://example.org/bar',
  object: 'http://example.org/baz'
});

const reasoner = new Reasoner(graph);
const node = reasoner.node('http://example.org/foo');
// ...
```

#### Property: `Reasoner.Node.prototype.id`

The Subject URI

#### Method: `Reasoner.Node.prototype.findInbound(predicate)`

Searches for all triples known to the Reasoner for which this node is the
*object*.

#### Method: `Reasoner.Node.prototype.find(predicate)`

Searches for all triples known to the Reasoner for which this node is the
*subject*.

#### Method: `Reasoner.Node.prototype.literal(predicate)`

Searches for literal values with the specified predicate.

```javascript
var literals = node.literal('http://example.org/label');
for (let literal of literals) {
  console.log(literal.valueOf());
  console.log(literal.type);
  console.log(literal.language);
};
```

#### Property: `Reasoner.Node.prototype.types`

The collection of `rdf:type` explicitly defined for this subject.

#### Property: `Reasoner.Node.prototype.subProperties`

A listing of `Reasoner.Node` objects representing other subjects defined as
`rdfs:subPropertyOf` this subject.

#### Property: `Reasoner.Node.prototype.subClasses`

A listing of `Reasoner.Node` objects representing other
subjects defined as `rdfs:subClassOf` this subject.

#### Property: `Reasoner.Node.prototype.superProperties`

A listing of `Reasoner.Node` objects representing other
subjects for which this node can be considered a sub-property.

#### Property: `Reasoner.Node.prototype.superClasses`

A listing of `Reasoner.Node` objects representing other
subjects for which this node can be considered a sub-class.

#### Method: `Reasoner.Node.prototype.is(type)`

Returns `true` if this subject can be considered to be an instance of the
specified type. Specifically, this will return `true` if:

1. It has `rdf:type` `type`
2. One of it's `rdf:type`'s is `type`
3. It has `rdfs:subClassOf` `type`
4. One of it's superClasses is `type`
5. It has `rdfs:subPropertyOf` `type`
6. One of it's superProperties is `type`

### Object: `Reasoner.Literal`

Represents a literal value.

#### Method: `Reasoner.Literal.prototype.valueOf()`

Returns the value of the literal.

#### Property: `<Reasoner.Node> Reasoner.Literal.prototype.type`

A `Reasoner.Node` representing the Literal type.

#### Property: `<LanguageTag> Reasoner.Literal.prototype.language`

A `LanguageTag` representing the Literal language. (The `LanguageTag` object is
provided by the `rfc5646` module in npm)
