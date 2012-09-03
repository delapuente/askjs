describe('find()', function() {
  var collection;

  beforeEach(function () {
    collection = [
      { x: 1, y: 1, z: true },
      { x: 2, y: "string", z: true },
      { x: 3, y: null, z: false },
      { x: 4, z: false }
    ];

    this.addMatchers({
      sameCollection: function(expected) {
        var c1 = [].slice.apply(this.actual);
        var c2 = [].slice.apply(expected);
        return jasmine.getEnv().equals_(c1, c2);
      }
    });

    ask.mongify(collection);
  });

  it('after apply `ask.mongify()` to an array-like object, it exists as ' +
     'member of the object',
     function() {
       expect(collection.find).toEqual(jasmine.any(Function));
     }
  );

  it('returns a shallow copy of the entire collection when the empty ' +
     'object is passed',
    function() {
      var result = collection.find({});
      expect(result).not.toBe(collection);
      expect(result).sameCollection(collection);
    }
  );

  it('accepts canonical and non-canonical query objects', function() {
    var result1 = collection.find({});
    var result2 = collection.find({ $query: {} });
    expect(result1).sameCollection(result2);
  });

  it('accepts an object with value-restrictions on its fields', function() {
    var result = collection.find({ z: true });
    expect(result).sameCollection(collection.slice(0, 2));
  });

  it('accepts the restriction key=null following Mongo specification',
     function () {
      var result = collection.find({ y: null });
      expect(result).sameCollection(collection.slice(2, 4))
     }
  );

});
