describe('find() -- simple usage:', function() {
  var C = [
    {x: 1, y: 'A', z: true},
    {x: 2, y: 'B', z: true},
    {x: 3, y: 'C', z: true},
    {x: 4, y: null, z: false},
    {x: 5, z: false},
    {x: 6, color: "red", z: false},
    {x: 7, color: ["red", "green", "blue"], z: false}
  ];

  beforeEach(function () {
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

    ask.mongify(C);
  });

  it('after apply `ask.mongify()` to an array-like object, it exists as ' +
     'member of the object',
     function() {
       expect(C.find).toEqual(jasmine.any(Function));
     }
  );

  it('returns a shallow copy of the entire C when the empty ' +
     'object is passed',
    function() {
      var result = C.find({});
      expect(result).not.toBe(C);
      expect(result).sameCollection(C);
    }
  );

  it('accepts canonical and non-canonical query objects', function() {
    var result1 = C.find({});
    var result2 = C.find({ $query: {} });
    expect(result1).sameCollection(result2);
  });

  it('accepts value restricted specifications (key=value)', function() {
    var result = C.find({ z: true });
    expect(result).sameCollection(C.slice(0, 3));
  });

  it('accepts $ne operator which means `not equal`', function() {
    var result = C.find({z: {$ne: true}});
    expect(result).sameCollection(C.slice(3, 7));
  });

  it('in value restricted specs, when key is an array, the search check all ' +
     'values within the array', function() {
    var result = C.find({ color: "red" });
    expect(result).sameCollection(C.slice(5, 7));
  });

  it('using $ne, when key is an array, the search checks that no ' +
     'value within the array matches the query', function() {
    var result = C.find({ color: {$ne: "red"} });
    expect(result).sameCollection(C.slice(0, 5));
  });

  it('in value restricted specs, looking for null inlcudes those objects ' +
     'without the key',
     function () {
       var result = C.find({ y: null });
       expect(result).sameCollectionByItems(
        C[3], 
        C[4],
        C[5],
        C[6]
       );
     }
  );

  it('accepts the operator $exists with a falsy / truthty to check for the' + 
     'existence of a key. For Mongo query, the empty string is true',
     function () {
       var result = C.find({ y: { $exists: true } });
       var result2 = C.find({ y: { $exists: false } });
       expect(result).sameCollection(C.slice(0, 4));
       expect(result2).sameCollection(C.slice(4));

       result = C.find({ y: { $exists: 1 } });
       result2 = C.find({ y: { $exists: 0 } });
       expect(result).sameCollection(C.slice(0, 4));
       expect(result2).sameCollection(C.slice(4));

       result = C.find({ y: { $exists: "" } });
       result2 = C.find({ y: { $exists: null } });
       expect(result).sameCollection(C.slice(0, 4));
       expect(result2).sameCollection(C.slice(4));

       result = C.find({ y: { $exists: {} } });
       result2 = C.find({ y: { $exists: 0 } });
       expect(result).sameCollection(C.slice(0, 4));
       expect(result2).sameCollection(C.slice(4));

       result = C.find({ y: { $exists: [] } });
       result2 = C.find({ y: { $exists: 0 } });
       expect(result).sameCollection(C.slice(0, 4));
       expect(result2).sameCollection(C.slice(4));
     }
  );

  it('accepts the operator $size with a number to check length of arrays',
     function () {
       expect(C.find({ color: { $size: 3 } })).sameCollectionByItems(C[6]);
       expect(C.find({ color: { $size: 1 } })).sameCollection([]);
       expect(C.find({ x: { $size: 1 } })).sameCollection([]);
     }
  );

  it('accepts the operator $type with a number (and just a number) ' +
     'representing the type to test',
     function () {
       expect(function () { 
         C.find({ sample: { $type: 'function' } }) 
       }).toThrow();

       expect(function () { 
         C.find({ sample: { $type: '1' } }) 
       }).toThrow();
     }
  );
});
