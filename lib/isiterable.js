'use strict';

function is_iterable(i) {
  if (!i) return false;
  if (typeof i === 'string') return false;
  if (i instanceof String) return false;
  if (Array.isArray(i)) return true;
  return (typeof i[Symbol.iterator] === 'function');
}

module.exports = is_iterable;
