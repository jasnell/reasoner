'use strict';

const LRU = require('lru-cache');
const util = require('util');

function LoadingCache(options) {
  if (!(this instanceof LoadingCache))
    return new LoadingCache(options);
  LRU.call(this,options);
}
util.inherits(LoadingCache,LRU);

LoadingCache.prototype.set =
  function(key, value, maxAge) {
    if (typeof value === 'function') {
      value = value();
    }
    LRU.prototype.set.call(this, key, value, maxAge);
    return value;
  };

LoadingCache.prototype.get =
  function(key, loader, maxAge) {
    var val = LRU.prototype.get.call(this,key);
    return val !== undefined ? val :
          (typeof loader === 'function' ?
            this.set(key,loader,maxAge) :
            undefined) ;
  };

module.exports = LoadingCache;
