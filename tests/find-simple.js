describe('find() -- simple usage:', function() {
  var C;

  beforeEach(function () {
    C = [
      { x: 1, sample: 1, z: true },
      { x: 2, sample: Math.PI, z: true },
      { x: 3, sample: "string", z: true },
      { x: 4, sample: {}, z: false },
      { x: 5, sample: [], z: false },
      { x: 6, sample: true, z: false },
      { x: 7, sample: new Date(1990, 10, 5), z: false },
      { x: 8, sample: null, z: false },
      { x: 9, sample: /regexp/, z: false },
      { x: 10, sample: true, z: false },
      { x: 11, sample: function () { return 'this is a function'; }, z: false },
      { x: 12, sample: 8589934592, z: false },
      { x: 13, z: false }
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

  it('in value restricted specs, if the item has not the key, the ' +
     'restriction does not apply',
     function () {
       var result = C.find({ sample: null });
       var result2 = C.find({ nonexist: 'anything' });
       expect(result).sameCollectionByItems(
        C[7], 
        C[12]
       );
       expect(result2).sameCollection(C);
     }
  );

  it('accepts the operator $exists with a boolean to check for the existence ' +
     'of a key',
     function () {
       expect(function () { 
         C.find({ y: { $exists: 1 } }) 
       }).toThrow();

       var result = C.find({ sample: { $exists: true } });
       var result2 = C.find({ sample: { $exists: false } });
       expect(result).sameCollection(C.slice(0, 12));
       expect(result2).sameCollectionByItems(C[12]);
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
