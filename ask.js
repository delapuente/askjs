

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

  // Check the correct type of a parameter and if so, check the value belongs
  // to a proper set of values too.
  function _assertParameter(operator, parameter, type, values) {
    var assertion = true;
    var description = '"' + parameter + '"' + ' expected to be "' + type + '"';

    if (typeof parameter !== type) {
      assertion = false;
    }

    else if (values !== undefined && values[parameter] === undefined) {
      assertion = false;
      description += ' in the set ' + JSON.stringify(Object.keys(values));
    }

    if (!assertion)
      throw new BadArgument(operator, description);
  }

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
  //  + value
  //  + specification
  function _getSpecMode(spec) {

    // null is a value more than an object
    if (typeof spec !== 'object' || spec === null)
      return 'value';

    return 'specification';
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

    $exists: function (item, key, parameter) {
      // XXX: Mongo admits falsies and truthies and, even more, the empty
      // string is a truthy.
      if (parameter === '')
        parameter = true;

      parameter = !!parameter; // normalize to boolean

      var shouldExist = (parameter === true);
      return shouldExist ?
              item[key] !== undefined : item[key] === undefined;
    },

    $type: function (item, key, parameter) {
      _assertParameter('$type', parameter, 'number', CURRENT_TYPES);

      var typetest = CURRENT_TYPES[parameter];
      if (typetest === false)
        throw new BadArgument(
          '$type',
          parameter + ' not supported'
        );

      else if (typeof typetest === 'function') {
        return typetest(item[key]);
      }
    },

    $gt: function (item, key, parameter) {
      var value = item[key];
      if (typeof value !== typeof parameter)
        return false;

      return item[key] > parameter;
    },

    $gte: function (item, key, parameter) {
      var value = item[key];
      if (typeof value !== typeof parameter)
        return false;

      return item[key] >= parameter;
    },

    $lt: function (item, key, parameter) {
      var value = item[key];
      if (typeof value !== typeof parameter)
        return false;

      return item[key] < parameter;
    },

    $lte: function (item, key, parameter) {
      var value = item[key];
      if (typeof value !== typeof parameter)
        return false;

      return item[key] <= parameter;
    }
  }

  var MODES = {
    value: function (item, key, value) {
      if (Array.isArray(item[key]))
        return item[key].indexOf(value) !== -1;

      return (value === null && !(key in item)) || (value === item[key]);
    },

    specification: function (item, key, spec) {
      for (var operator in spec) {
        var test = TESTS[operator];
        if (typeof test !== 'function')
          throw new AskException('Operator "' + operator + '" not (yet)' +
                                  ' supported');

        if (!test(item, key, spec[operator]))
          return false;
      }
      return true;
    }

  };

  // General method to test objects.
  // Determining the type of the spec we can select the proper test.
  function _pass(item, key, spec) {
    var mode = _getSpecMode(spec);
    var handler = MODES[mode];
    if (typeof handler !== 'function')
      throw new AskException('Specification "' + JSON.stringify(spec) +
                               '" not supported');

    return handler(item, key, spec);
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
