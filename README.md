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

At the moment, very basic support is implemented:

  + `{ key: value }` with simple values (numbers, strings, dates but no arrays nor other objects). See [Mongo reference about query language](http://www.mongodb.org/display/DOCS/Mongo+Query+Language).
  + `$exists` operator. See [Mongo reference about $exists](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24exists) operator.
  + `$type` operator. See [Mongo table about datatypes](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24type) and [Mongo reference about types](http://www.mongodb.org/display/DOCS/Data+Types+and+Conventions) and, **please, please, please**, read the follwing notes:

     As this is not *MongoDB*, just JavaScript, it lacks of some data types, see the commentaries below to further details.

       + Type **1**: *double* - in JavaScript, any number is a [double](http://en.wikipedia.org/wiki/Double-precision_floating-point_format), so this matches any field which type is number (I mean, `typeof` returns `number`)
       + Type **3**: *object* - but only if this object is not null neither one of these sub-objects: `Array`, `Date` `RegExp`
       + Type **5**: *binary data* - is not supported (yet). You may ask how to support this feature. I don't know yet but, from my experience, I know there are methods to convert BSON into JSON, let me try...
       + Type **7**: *object id* - is not supported (yet). Same here.

     So we have support for types: **1, 2, 3, 4** at present time.
