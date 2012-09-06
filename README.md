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

At the moment, very basic support is implemented

  + `{ key: value }` with simple values (numbers, strings, dates but no arrays nor other objects). See [Mongo reference about query language](http://www.mongodb.org/display/DOCS/Mongo+Query+Language)
  + `$exists` operator. See [Mongo reference about $exists](http://www.mongodb.org/display/DOCS/Advanced+Queries#AdvancedQueries-%24exists) operator.

