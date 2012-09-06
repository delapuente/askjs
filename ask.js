

var ask = (function(undefined) {

  'use strict'

  function AskException(message, name) {
    this.name = name || 'AskException';
    this.message = message || '';
  }

  function BadArgument(operator, description) {
    description =
      'Bad argument for operator "' + operator + '": ' + description;
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
  //  + $type
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
            case '$type':
              return key;

            default:
              return 'operator';
          }
        }
      }
    }

    return 'object';
  }

  // Collection of types
  var TYPES = {
    // minkey: unsupported
    '-1': false,

    // double
    '1': function (value) {
      return typeof value === 'number';
    },

    // string
    '2': function (value) {
      return typeof value === 'string';
    },

    // object
    '3': function (value) {
      var isObject = typeof value === 'object' &&
                     value !== null &&
                     !Array.isArray(value) &&
                     !(value instanceof Date) &&
                     !(value instanceof RegExp);
      return isObject;
    },

    // array
    '4': function (value) {
      return Array.isArray(value);
    },

    // binary data: unsupported
    '5': false,

    // object id: unsupported
    '7': true,

    // boolean
    '8': true,
    '9': true,

    // null
    '10': function (value) {
      return value === null;
    },

    '11': true,
    '12': true,
    '13': true,

    // symbol: unsupported
    '14': false,
    '15': true,
    '16': true,
    '17': true,
    '18': true,

    // minkey: unsupported
    '255': false,

    // maxkey: unsupported
    '127': false
  };

  // Collection of tests by type of specification
  var TESTS = {
    value: function (item, key, spec) {
      if (key in item && item[key] !== spec)
        return false;

      return true;
    },

    $exists: function (item, key, spec) {
      // TODO: Check if Mongo admits falsies and truthies
      var parameter = spec.$exists;
      if (typeof parameter !== 'boolean')
        throw new BadArgument(
          '$exists',
          '"boolean" expected (no truthies nor falsies allowed.)'
        );

      var shouldExist = (parameter === true);
      return shouldExist ?
              item[key] !== undefined : item[key] === undefined;
    },

    $type: function (item, key, spec) {
      var parameter = spec.$type;
      if (typeof parameter !== 'number' || TYPES[parameter] === undefined )
        throw new BadArgument(
          '$type',
          '"number" from 1 to 18 (in addition with -1, 255 and 127) expected'
        );

      var matcher = TYPES[parameter];
      if (matcher === false)
        return false;

      else if (typeof matcher === 'function') {
        console.log('here');
        return matcher(item[key]);
      }
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
