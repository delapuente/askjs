describe('the $type operator with a number as parameter:', function() {
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
});
