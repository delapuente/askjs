describe('the $type operator with a number as parameter:', function() {
  var ArrayLike = function ArrayLike() {
    this.length = 0;
  }

  var C = [
    { sample: 1 },
    { sample: Math.PI },
    { sample: "string"},
    { sample: {} },
    { sample: [] },
    { sample: true },
    { sample: new Date(1990, 10, 5) },
    { sample: null },
    { sample: /regexp/ },
    { sample: true },
    { sample: function () { return 'this is a function'; }},
    { sample: 4294967296 } // 2^32
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

  it('accepts the number 1, double ',
     function() {
       expect(
         C.find({ sample: { $type: 1 } })
       )
       .sameCollectionByItems(
         C[0],
         C[1],
         C[11]
       );
     }
  );

  it('accepts the number 2, string ',
     function() {
       expect(
         C.find({ sample: { $type: 2 } })
       )
       .sameCollectionByItems(
         C[2]
       );
     }
  );

  it('accepts the number 3, object ',
     function() {
       expect(
         C.find({ sample: { $type: 3 } })
       )
       .sameCollectionByItems(
         C[3]
       );
     }
  );

  it('accepts the number 4, array ',
     function() {
       expect(
         C.find({ sample: { $type: 4 } })
       )
       .sameCollectionByItems(
         C[4]
       );
     }
  );

  it('accepts the number 8, boolean ',
     function() {
       expect(
         C.find({ sample: { $type: 8 } })
       )
       .sameCollectionByItems(
         C[5],
         C[9]
       );
     }
  );

  it('accepts the number 9, date ',
     function() {
       expect(
         C.find({ sample: { $type: 9 } })
       )
       .sameCollectionByItems(
         C[6]
       );
     }
  );

  it('accepts the number 10, null ',
     function() {
       expect(
         C.find({ sample: { $type: 10 } })
       )
       .sameCollectionByItems(
         C[7]
       );
     }
  );

  it('accepts the number 11, regular expression ',
     function() {
       expect(
         C.find({ sample: { $type: 11 } })
       )
       .sameCollectionByItems(
         C[8]
       );
     }
  );

  it('accepts the number 13, JavaScript code',
     function() {
       expect(
         C.find({ sample: { $type: 13 } })
       )
       .sameCollectionByItems(
         C[10]
       );
     }
  );

  it('accepts the number 15, JavaScript code with scope ',
     function() {
       expect(
         C.find({ sample: { $type: 15 } })
       )
       .sameCollectionByItems(
         C[10]
       );
     }
  );

  it('accepts the number 16, 32-bit integer ',
     function() {
       expect(
         C.find({ sample: { $type: 16 } })
       )
       .sameCollectionByItems(
         C[0]
       );
     }
  );

  it('accepts the number 18, 64-bit (really 52-bit) integer ',
     function() {
       expect(
         C.find({ sample: { $type: 18 } })
       )
       .sameCollectionByItems(
         C[0],
         C[11]
       );
     }
  );

  it('does not support 7, object id',
     function() {
       function f() { C.find({ sample: { $type: 7 } }); }
       expect(f).toThrow();
     }
  );

});
