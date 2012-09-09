# ask.js

Perform [mongo queries](http://www.mongodb.org/display/DOCS/Querying) on regular JS objects.

## How to use?

Add `ask.js` to your page and use `ask.mongify()` method to convert an array into a mongified collection. ;)

```javascript
var collection = [
  { x: 1, y: 1, z: true },
  { x: 2, y: "string", z: true },
  { x: 3, y: null, z: false },
  { x: 4, z: false }
];
ask.mongify(collection); // it returns the same collection object

collection.find( { z: false } );
```

At the moment, very basic features are supported:

  + `{ key: value }` with simple values (numbers, strings, dates but no arrays nor other objects). See [Mongo reference about query language](http://www.mongodb.org/display/DOCS/Mongo+Query+Language).
  + `$exists` operator. See [Mongo reference about $exists](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24exists) operator.
  + `$type` operator. See [Mongo table about datatypes](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24type) and [Mongo reference about types](http://www.mongodb.org/display/DOCS/Data+Types+and+Conventions) and, **please, please, please**, read the follwing notes:

     I have solid support for types **1 (double), 2 (string), 3 (object), 4 (array), 8 (boolean), 9 (date), 10 (null), 11 (regular expression), 13 (JavaScript code), 15 (JavaScript code with scope), 16 (32-bit integer), 18 (64-bit ~ 53-bit integer)**

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
