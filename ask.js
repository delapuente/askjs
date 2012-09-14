

var ask = (function(undefined) {

  'use strict'

  var MAX_INT32 = 4294967296; // 2^32
  var MAX_INT52 = 9007199254740992; // 2^52

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

  function NotSupported(subject) {
    description = 
      'Feature not supported: ' + subject;
    AskException.call(this, description, 'NotSupported');
  }
  NotSupported.prototype = new AskException();

  function _extend(obj) {
    for (var i = 1, current; current = arguments[i]; i++)
      for (var key in current) if (current.hasOwnProperty(key))
        obj[key] = current[key];
    return obj;
  }

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
  var CURRENT_TYPES, DEFAULT_TYPES = {
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
    '7': false,

    // boolean
    '8': function (value) {
      return typeof value === 'boolean';
    },

    // date
    '9': function (value) {
      return value instanceof Date;
    },

    // null
    '10': function (value) {
      return value === null;
    },

    // regular expression
    '11': function (value) {
      return value instanceof RegExp;
    },

    // code: ~ function
    '13': function (value) {
      return typeof value === 'function' || value instanceof Function;
    },

    // symbol: unsupported
    '14': false,

    // code with scope: ~ function
    '15': function (value) {
      return typeof value === 'function' || value instanceof Function;
    },

    // 32-bit int
    '16': function (value) {
      return typeof value === 'number' &&
              parseInt(value) === parseFloat(value) &&
              -MAX_INT32 < value && value < MAX_INT32;
    },

     // timestamps: unsupported
    '17': false,

    // 64-bit int
    '18': function (value) {
      return typeof value === 'number' &&
              parseInt(value) === parseFloat(value) &&
              -MAX_INT52 < value && value < MAX_INT52;
    },

    // minkey: unsupported
    '255': false,

    // maxkey: unsupported
    '127': false
  };

  // Collection of tests by type of specification
  var TESTS = {
    value: function (item, key, spec) {
      if (Array.isArray(item[key]))
        return item[key].indexOf(spec) !== -1;

      return (spec === null && !(key in item)) || (spec === item[key]);
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
      if (typeof parameter !== 'number' || CURRENT_TYPES[parameter] === undefined )
        throw new BadArgument(
          '$type',
          '"number" in the set {1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 13, 14, 15, ' +
          '16, 17, 18, -1, 255 and 127} expected'
        );

      var typetest = CURRENT_TYPES[parameter];
      if (typetest === false)
        throw new BadArgument(
          '$type',
          parameter + ' not supported'
        );

      else if (typeof typetest === 'function') {
        return typetest(item[key]);
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

  // Set type tests
  function _types(typetests) {
    typetests = typetests || {};
    CURRENT_TYPES = _extend({}, DEFAULT_TYPES, typetests);
  }

  _types();

  return {
    mongify: _mongify,
    types: _types
  }
}());
