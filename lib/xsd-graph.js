'use strict';

var Graph = require('./graph');
var vocabs = require('linkeddata-vocabs');
var asx = vocabs.asx;
var xsd = vocabs.xsd;
var rdf = vocabs.rdf;
var rdfs = vocabs.rdfs;

var XsdGraph = new Graph();

function type(subject, object) {
  XsdGraph.add({
    subject: subject,
    predicate: rdfs.subClassOf,
    object: object
  });
}

type(xsd.date, asx.Date);
type(xsd.dateTime, asx.Date);
type(xsd.dateTime, asx.Date);
type(xsd.gMonth, asx.Date);
type(xsd.gDay, asx.Date);
type(xsd.gMonthDay, asx.Date);
type(xsd.gYear, asx.Date);
type(xsd.gYearMonth, asx.Date);

type(xsd.decimal, asx.Number);
type(xsd.float, asx.Number);
type(xsd.integer, asx.Number);

type(xsd.boolean, asx.Boolean);

type(xsd.anySimpleType, xsd.anyType);
type(xsd.gMonth, xsd.anySimpleType);
type(xsd.gDay, xsd.anySimpleType);
type(xsd.gMonthDay, xsd.anySimpleType);
type(xsd.gYear, xsd.anySimpleType);
type(xsd.gYearMonth, xsd.anySimpleType);
type(xsd.date, xsd.anySimpleType);
type(xsd.time, xsd.anySimpleType);
type(xsd.dateTime, xsd.anySimpleType);
type(xsd.duration, xsd.anySimpleType);
type(xsd.NOTATION, xsd.anySimpleType);
type(xsd.QName, xsd.anySimpleType);
type(xsd.anyURI, xsd.anySimpleType);
type(xsd.double, xsd.anySimpleType);
type(xsd.decimal, xsd.anySimpleType);
type(xsd.float, xsd.anySimpleType);
type(xsd.hexBinary, xsd.anySimpleType);
type(xsd.base64Binary, xsd.anySimpleType);
type(xsd.boolean, xsd.anySimpleType);
type(xsd.string, xsd.anySimpleType);
type(xsd.normalizedString, xsd.string);
type(xsd.token, xsd.normalizedString);
type(xsd.language, xsd.token);
type(xsd.Name, xsd.token);
type(xsd.NMTOKEN, xsd.token);
type(xsd.NCName, xsd.Name);
type(xsd.NMTOKENS, xsd.NMTOKEN);
type(xsd.ID, xsd.NCName);
type(xsd.IDREF, xsd.NCName);
type(xsd.ENTITY, xsd.NCName);
type(xsd.IDREFS, xsd.IDREF);
type(xsd.ENTITIES, xsd.ENTITY);
type(xsd.integer, xsd.decimal);
type(xsd.nonPositiveInteger, xsd.integer);
type(xsd.negativeInteger, xsd.nonPositiveInteger);
type(xsd.long, xsd.integer);
type(xsd.int, xsd.int);
type(xsd.short, xsd.short);
type(xsd.byte, xsd.byte);
type(xsd.nonNegativeInteger, xsd.integer);
type(xsd.unsignedLong, xsd.nonNegativeInteger);
type(xsd.positiveInteger, xsd.nonNegativeInteger);
type(xsd.unsignedInt, xsd.unsignedLong);
type(xsd.unsignedShort, xsd.unsignedInt);
type(xsd.unsignedByte, xsd.unsignedShort);

module.exports = XsdGraph;
