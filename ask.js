

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

  // Return the type of the specification. Possible types are:
  //  + $exists:
  //  + object:
  //  + operator:
  //  + value:
  function _getSpecType(spec) {

    // null is a value more than an object
    if (typeof spec !== 'object' || spec === null)
      return 'value';

    // look for operator
    if (spec !== null) {
      for (var key in spec) {

        if (key[0] === '$') {
          switch(key) {
            case '$exists':
              return '$exists';

            default:
              return 'operator';
          }
        }
      }
    }

    return 'object';
  }

  // Collection of tests by type of specification
  var TESTS = {
    value: function (item, key, spec) {
      if (key in item && item[key] !== spec)
        return false;

      return true;
    },

    $exists: function (item, key, spec) {
      // TODO: Check if Mongo admits falsies and truthies
      var shouldExist = (spec.$exists === true);
      return shouldExist ?
              item[key] !== undefined : item[key] === undefined;
    }
  };

  // General method to test objects.
  // Determining the type of the spec we can select the proper test.
  function _pass(item, key, spec) {
    var type = _getSpecType(spec);
    var test = TESTS[type];
    if (typeof test !== 'function')
      throw new AskException('Specification "' + JSON.stringify(spec) +
                               '" not yet supported');

    return test(item, key, spec);
  }

  // Point of entry for Mongo queries
  function _find(queryObj) {
    queryObj = _normalizeQueryObject(queryObj)
    var $query = queryObj.$query;
    var result = ask.mongify([]);

    [].forEach.call(this, function _testEach(item) {
      for (var key in $query)
        if(!_pass(item, key, $query[key]))
          return;

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
