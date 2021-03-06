# ask.js

Perform [mongo queries](http://www.mongodb.org/display/DOCS/Querying) on regular JS objects.

## Compatibility

`ask.js` is compatible with the ECMAScript 5.1 standard, for retrocompatibility take advantage of [modernizr and polyfills](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills).

Tests have been passed for both latest Chrome and Firefox 15.0.1.

## How to use?


Add `ask.js` to your page and use `ask.mongify()` method to convert an array into a mongified collection. ;)

```javascript
var collection = [
  {"city": "ACMAR", "loc": [-86.51557, 33.584132], "pop": 6055, "state": "AL", "_id": "35004"},
  {"city": "ADAMSVILLE", "loc": [-86.959727, 33.588437], "pop": 10616, "state": "AL", "_id": "35005"},
  {"city": "NINILCHIK", "loc": [-151.639604, 60.010833], "pop": 767, "state": "AK", "_id": "99639"},
  {"city": "NONDALTON", "loc": [-154.731675, 60.030837], "pop": 233, "state": "AK", "_id": "99640"},
  {"city": "LAKESIDE", "loc": [-109.986878, 34.166224], "pop": 5350, "state": "AZ", "_id": "85929"},
  {"city": "PINETOP", "loc": [-109.919668, 34.117459], "pop": 1938, "state": "AZ", "_id": "85935"}
];
ask.mongify(collection); // it returns the same collection object

collection.find( { "state": "AK" } );
```

## Features supported

### Dot notation & subobjects

**All stuff** related to __dot notation__, `$elemMatch` and __subobjects__ is supported according to Mongo specification.

You can find [more information in Mongo documentation](http://www.mongodb.org/display/DOCS/Dot+Notation+(Reaching+into+Objects).

### JavaScript expressions and $where clause

You can use JavaScript expressions and the `$where` clause as it is described in [Mongo documentation about `$where`](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-JavascriptExpressionsand%7B%7B%24where%7D%7D)

### Regular expressions

You can use JavaScript regular expressions literals or `$regex` constructor to match agains a regular expression. See more about [regular expresssions in Mongo documentation](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-RegularExpressions).

### Operators

At the moment, almost all operators are supported but no indexation is applied on any search:

  + `{ key: value }` with simple values. See [Mongo reference about query language](http://www.mongodb.org/display/DOCS/Mongo+Query+Language).
  + `{ key: null }` where `null` means both checking for [equality or non existence](http://www.mongodb.org/display/DOCS/Querying+and+nulls).
  + `$gt`, `$gte`, `$lt`, `$lte` operators. See [Mongo reference about <, <=, >, >=](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%3C%2C%3C%3D%2C%3E%2C%3E%3D) operators.
  + `$all` and `$in` operators. See [Mongo reference about `$all`](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24all) and [documentation about `in`](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24in) for further details
  + `$exists` operator. See [Mongo reference about $exists](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24exists) operator.
  + `$mod` operator. See [Mongo reference about `$mod`](See [Mongo reference about `$all`](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24all) and [documentation about `in`](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24in) for further details) for further details. If you omit the remainder parameter, it is assumed to be 0.
  + `$ne` and `$nin` operators. See [Mongo reference about `$ne`](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24ne) and [`$nin operators`](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24nin).
  + `$size` operator. See [Mongo reference about $size](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24size) operator.
  + `$type` operator. See [Mongo table about datatypes](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24type) and [Mongo reference about types](http://www.mongodb.org/display/DOCS/Data+Types+and+Conventions) and, **please, please, please**, read notes below.
  + `$and`, `$or` and `$nor` operators. See from [Mongo `$nor` documentation](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24nor).
  + `$not` metaoperator. See [Mongo `$not` metaoperator notes](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-Metaoperator%3A%7B%7B%24not%7D%7D). 

### Notes related to `$type` operator

`ask.js` provides solid support for types **1 (double), 2 (string), 3 (object), 4 (array), 8 (boolean), 9 (date), 10 (null), 11 (regular expression), 13 (JavaScript code), 15 (JavaScript code with scope), 16 (32-bit integer), 18 (64-bit ~ 53-bit integer)**

As this is only JavaScript, it does not use BSON but JSON and some BSON data types are missed, see the commentaries below to further details.

 + Type **1**: *double* - in JavaScript, any number is a [double](http://en.wikipedia.org/wiki/Double-precision_floating-point_format), so this matches any field which type is number (I mean, `typeof` returns `number`)
 + Type **3**: *object* - but only if this object is not null neither one of these sub-objects: `Array`, `Date` `RegExp`
 + Type **5**: *binary data* - is <span style="color: red;">not supported (yet)</span>. You may ask how to support this feature. I don't know yet but, from my experience, I know there are methods to convert BSON into JSON, let me try...
 + Type **7**: *object id* - is <span style="color: red;">not supported (yet)</span>. Same here.
 + Types **13** and **15**: *JavaScript code and JavaScript code with scope* - they are treated like looking for `Function` instances.
 + Type **14**: *symbol* - This type refers to Ruby symbols which are different from strings. It is <span style="color: red;">not supported (yet)</span>. Same reasons.
 + Type **16**: *32-bit integers* - JavaScript [has no an integer type](http://ecma262-5.com/ELS5_HTML.htm#Section_8.5). But it can represent up to two times 2^52 integer values, half positive and halft negative using `double` types. So, using type 16 only test for an integer `v` that `2^32 < v < -2^32`.
 + Type **17**: *timestamp* - is <span style="color: red;">not supported (yet)</span>. Same here.
 + Type **18**: *64-bit integers* - Same reasons here allow us to check if *there is an `integer` inside a `double`* and nothing more. But those integers have are 52-bit sized so, this test for an integer `v` that `2^52 < v < -2^52`.
 + Type **255** / **-1**: *min key* - is <span style="color: red;">not supported (yet)</span>. Reasons are difficult to explain right now.
 + Type **127**: *max key* - is <span style="color: red;">not supported (yet)</span>. Same as above.

As optional, if you feel uncomfortable with the current implementation or know how to test for some of the missed types or you created your own types, you can use `ask.types()` package method to set an alternative implementation. Call `ask.types()` as in the following example:

```javascript
ask.types({
// This disable support for 64-bit integers
'18': false,

// This overrides the test for object returning true for every value instance of Object
'3': function (value) {
  return value instanceof Object;
},

// This enables support for object id
'7': function (value) {
  return value.$objectId !== undefined;
}

// This add support for a custom type -4: weak array-like object
'-4': function (value) {
  return typeof value.length === 'number' &&
         parseInt(value.length) === parseFloat(value.length) &&
         value.length >= 0;
}
});

// This reset type tests to default ones
ask.types();
```
