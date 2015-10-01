'use strict';

const Reasoner = require('./');
const xsd = require('linkeddata-vocabs').xsd;

const reasoner = new Reasoner();

const node = reasoner.node(xsd.language);

console.log(node);

console.log(node.is(xsd.anyType));

//node.is(xsd.anyType, (res)=> {console.log(res);});
