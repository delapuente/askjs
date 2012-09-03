

var ask = (function(undefined) {

  'use strict'

  function AskException(message, name) {
    this.name = name || 'AskException';
    this.message = message || '';
  }

  function BadArgument(description) {
    AskException.call(this, description, 'BadArgument');
  }
  BadArgument.prototype = new AskException();

  // Transform a query object into a real query object
  // See:
  //  http://www.mongodb.org/display/DOCS/Mongo+Query+Language
  function _normalizeQueryObject(queryObj) {
    if (typeof queryObj !== 'object')
      return null;

    if (typeof queryObj.$query === 'undefined')
      return {
        $query: queryObj
      };

    return queryObj;
  }

  // Point of entry for Mongo queries
  function _find(queryObj) {
    queryObj = _normalizeQueryObject(queryObj)
    var $query = queryObj.$query;
    var result = ask.mongify([]);

    [].forEach.call(this, function _testEach(item) {
      for (var key in item) {
        var value = item[key];
        if ($query.hasOwnProperty(key) && $query[key] !== value)
          return;
      }
      result.push(item);
    });
    return result;
  }

  // Enables an array like object to perform Mongo queries on it
  function _mongify(arraylike) {
    arraylike.find = _find;
    return arraylike;
  }

  return {
    mongify: _mongify
  }
}());
