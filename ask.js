/*
Copyright 2012

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
*/

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

  // Resolves key in dot notation for the given item.
  function _(item, key) {

    // Auxiliar function to determine if we are looking for some value in any
    // position of the array.
    function lookingInAllTheArray(key, field) {
      var isNumber = !isNaN(Number(key));
      return Array.isArray(field) && !isNumber;
    }

    var path = key.split('.');

    // Actually resolves the dot notation for an object
    // XXX: Implementation is recursive, see commentaries in the code
    function __(item, currentKeyIndex) {
      // Base cases
      if (item === undefined || currentKeyIndex >= path.length)
        return item;

      // Normal search, going one level deeper and updating the key
      var currentKey = path[currentKeyIndex];
      if (!lookingInAllTheArray(currentKey, item))
        return __(item[currentKey], currentKeyIndex + 1);

      // Complex search, looking inside the objects of an array
      // XXX: This is like returning a "multiplexed value". Lets consider
      // a "multiplexed value" like a marked array.
      var arrayValue = [];
      arrayValue.$__isMultiplexedValue = true;
      for (var i = 0, subitem; subitem = item[i]; i++) {

        // Perform a search with the current key on every subitem
        var value = __(subitem, currentKeyIndex);

        // If value is a "multiplexed value", concatenate to the current one
        if (value !== undefined && value.$__isMultiplexedValue)
          for (var j = 0, len = value.length; j < len; j++)
            arrayValue.push(value[j]);

        // If value is not an array or it is a normal array, simply add it
        else if (value !== undefined)
          arrayValue.push(value);

      }

      // XXX: In any case, undefined is never added to the multiplexed value
      // An empty "multiplexed value" is like undefined
      return arrayValue.length ? arrayValue : undefined;
    }

    var value = __(item, 0);
    if (value !== undefined && value !== null && value.$__isMultiplexedValue)
      delete value.$__isMultiplexedValue;

    return value;
  }

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

  // Overwrite the fields of obj with those belonging to the following
  // arguments.
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

    if (typeof queryObj === 'string' || typeof queryObj === 'function')
      return {
        $query: {
          $where: queryObj
        }
      };

    var type = typeof queryObj;
    if (type !== 'object')
      throw new AskException(
        'Invalid query syntax',
        'don\'t know how to massage : ' + type
      );

    if (typeof queryObj.$query === 'undefined')
      return {
        $query: queryObj
      };

    return queryObj;
  }

  function _isExpression(spec) {
    var keys = Object.keys(spec);
    return keys.every(function(key) {
      return key[0] === '$';
    });
  }

  // Return the type of the specification. Possible types are:
  //  + boolean $and, $or, $nor
  //  + value
  //  + object (to compare complete subobjects)
  //  + specification
  function _getSpecMode(key, spec) {

    // key can be a boolean operator itself
    if (key[0] === '$')
      return key;

    // null is a value more than an object
    if (typeof spec !== 'object' || spec === null)
      return 'value';

    // complete subobject match
    if (!_isExpression(spec))
      return 'subobject';

    return 'expression';
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

  // Some reusable functions
  function _valueEquality(item, key, value) {
    var field = _(item, key);
    if (Array.isArray(field))
      return field.indexOf(value) !== -1;

    return (value === null && !(key in item)) || (value === field);
  }

  // General handler for binary comparators
  function _binaryComparator(item, key, parameter, comparator) {
    var valueArray = _(item, key);
    if (!Array.isArray(valueArray))
      valueArray = [valueArray];

    var value;
    for (var i = 0, len = valueArray.length; i < len; i++) {
      value = valueArray[i];
      if (typeof value !== typeof parameter)
        continue;

      if (comparator(value, parameter))
        return true;
    }
    return false;
  }

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
              _(item, key) !== undefined : _(item, key) === undefined;
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
        return typetest(_(item, key));
      }
    },

    $gt: function (item, key, parameter) {
      return _binaryComparator(item, key, parameter, function(v, p) {
        return v > p;
      });
    },

    $gte: function (item, key, parameter) {
      return _binaryComparator(item, key, parameter, function(v, p) {
        return v >= p;
      });
    },

    $lt: function (item, key, parameter) {
      return _binaryComparator(item, key, parameter, function(v, p) {
        return v < p;
      });
    },

    $lte: function (item, key, parameter) {
      return _binaryComparator(item, key, parameter, function(v, p) {
        return v <= p;
      });
    },

    $all: function (item, key, subset) {
      var set = _(item, key);
      if (!Array.isArray(set))
        return false;

      return subset.every(function(item) {
        return set.indexOf(item) !== -1;
      });
    },

    '$in': function (item, key, values) {
      var valueArray = _(item, key);
      if (!Array.isArray(valueArray))
        valueArray = [valueArray];

      return valueArray.some(function(value){
        return values.indexOf(value) !== -1;
      });
    },

    // TODO: Check if this work on arrays
    $mod: function (item, key, parameter) {
      if (!Array.isArray(parameter))
        throw new BadArgument('$mod', parameter + ' expected to be an array ' +
                                       'of at least one element.');
      var divider = parameter[0];
      var remainder = parameter[1] || 0;
      var valueArray = _(item, key);
      if (!Array.isArray(valueArray))
        valueArray = [valueArray];

      return valueArray.some(function(value) {
        return typeof value === 'number' && (value % divider === remainder);
      });
    },

    $ne: function (item, key, value) {
      return !_valueEquality(item, key, value);
    },

    $nin: function (item, key, parameter) {
      return !TESTS['$in'](item, key, parameter);
    },

    $size: function (item, key, parameter) {
      var array = _(item, key);
      return Array.isArray(array) && (array.length === parameter);
    },

    $not: function (item, key, expression) {
      return !_solveExpression(item, key, expression);
    },

    $elemMatch: function (item, key, specification) {
      var array = _(item, key);
      if (!Array.isArray(array))
        return false;

      // Test expression for each array item
      if (_isExpression(specification)) {
        return array.every(function (arrayItem, index) {
          return _solveExpression(array, index+'', specification);
        });
      }

      // Test some object to match specification
      return array.some(function (arrayItem) {
        return _passQuery(arrayItem, specification);
      });
    }
  }

  function _solveExpression(item, key, expression) {
    for (var operator in expression) {
      var test = TESTS[operator];
      if (typeof test !== 'function')
        throw new AskException('Operator "' + operator + '" not (yet)' +
                                ' supported');

      if (!test(item, key, expression[operator]))
        return false;
    }
    return true;
  }

  function _compareObjects(objA, objB) {
    return JSON.stringify(objA) === JSON.stringify(objB);
  }

  var MODES = {
    value: _valueEquality,

    expression: _solveExpression,

    subobject: function (item, key, referenceObject) {
      var obj = _(item, key);
      return _compareObjects(obj, referenceObject);
    },

    // XXX: this is here to force same results as Mongo. But documentation
    // says that this syntax is not valid:
    // http://docs.mongodb.org/manual/reference/operators/#_S_not
    $not: function () { return false; },

    $and: function (item, key, queries) {
      if (!Array.isArray(queries) || !queries.length)
        throw new BadArgument(
          '$and',
          'expression must be a nonempty array of queries'
        );

      return queries.every(function (query) {
        return _passQuery(item, query);
      });
    },

    $or: function (item, key, queries) {
      if (!Array.isArray(queries) || !queries.length)
        throw new BadArgument(
          '$or',
          'expression must be a nonempty array of queries'
        );

      return queries.some(function (query) {
        return _passQuery(item, query);
      });
    },

    $nor: function (item, key, queries) {
      if (!Array.isArray(queries) || !queries.length)
        throw new BadArgument(
          '$nor',
          'expression must be a nonempty array of queries'
        );

      return !MODES['$or'](item, key, queries);
    },

    $where: function (item, key, specification) {
      var filterFunction;

      // If a function is provided, use that
      if (typeof specification === 'function')
        filterFunction = specification;

      // If not, make a new one
      else if (typeof specification === 'string')
        filterFunction = new Function('return ' + specification + ';');

      // Other types does not trigger an error but filter everything
      else
        return false;

      return filterFunction.apply(item);
    }


  };

  // Test a restriction. Restrictions can be:
  // + value restricted {key: value}
  // + expression {key: { $operator: expression}}
  // + boolean expression { $and: [ subqueries ]} / { $or: [ subqueries ]}
  function _passRestriction(item, key, spec) {
    var mode = _getSpecMode(key, spec, item);
    var handler = MODES[mode];
    if (typeof handler !== 'function')
      throw new AskException('Specification "' + key + ':' + 
                              JSON.stringify(spec) + '" not supported');

    return handler(item, key, spec);
  }

  // Test every restriction
  function _passQuery(item, query, elemMatchKey) {
    for (var key in query)
      if(!_passRestriction(item, key, query[key]))
        return false;

    return true;
  }

  // Point of entry for Mongo queries
  function _find(queryObj) {
    queryObj = _normalizeQueryObject(queryObj);

    var query = queryObj.$query;
    var result = ask.mongify([]);

    [].forEach.call(this, function (item) {
      if (_passQuery(item, query))
        result.push(item);

    });
    return result;
  }

  // Enables an array-like object to perform Mongo queries on it
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
