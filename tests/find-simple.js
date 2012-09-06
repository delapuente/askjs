describe('find() -- simple usage:', function() {
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
      },
      sameCollectionByItems: function() {
        var c1 = [].slice.apply(this.actual);
        var c2 = [].slice.apply(arguments);
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

  it('accepts value restricted specifications (key=value)', function() {
    var result = collection.find({ z: true });
    expect(result).sameCollection(collection.slice(0, 2));
  });

  it('in value restricted specs, if the item has not the key, the ' +
     'restriction does not apply',
     function () {
      var result = collection.find({ y: null });
      var result2 = collection.find({ nonexist: 'anything' });
      expect(result).sameCollection(collection.slice(2, 4));
      expect(result2).sameCollection(collection);
     }
  );

  it('accepts the operator $exists with a boolean to check for the existence ' +
     'of a key',
     function () {
      var result = collection.find({ y: { $exists: true } });
      var result2 = collection.find({ y: { $exists: false } });
      expect(result).sameCollection(collection.slice(0, 3));
      expect(result2).sameCollection(collection.slice(3, 4));
     }
  );
});
