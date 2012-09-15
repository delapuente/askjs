describe('the $gt, $gte, $lt, $lte operators:', function() {

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
  });

  it('compare numbers',
    function() {
      var C = [
        { x: 1 },
        { x: 2 },
        { x: 3 },
        { x: 4 },
        { x: 5 }
      ];
      ask.mongify(C);

      expect(C.find({ x: { $gt: 3 } }))
      .sameCollectionByItems(C[3], C[4]);

      expect(C.find({ x: { $gte: 3 } }))
      .sameCollectionByItems(C[2], C[3], C[4]);

      expect(C.find({ x: { $lt: 3 } }))
      .sameCollectionByItems(C[0], C[1]);

      expect(C.find({ x: { $lte: 3 } }))
      .sameCollectionByItems(C[0], C[1], C[2]);
     }
  );

  it('accept numeric intervals',
    function() {
      var C = [
        { x: 1 },
        { x: 2 },
        { x: 3 },
        { x: 4 },
        { x: 5 }
      ];
      ask.mongify(C);

      expect(C.find({ x: { $gt: 3, $lt: 5 } }))
      .sameCollectionByItems(C[3]);

      expect(C.find({ x: { $gt: 3, $lte: 5 } }))
      .sameCollectionByItems(C[3], C[4]);

      expect(C.find({ x: { $gte: 3, $lt: 5 } }))
      .sameCollectionByItems(C[2], C[3]);

      expect(C.find({ x: { $gte: 3, $lte: 5 } }))
      .sameCollectionByItems(C[2], C[3], C[4]);
     }
  );


  it('compare strings',
    function() {
      var C = [
        { x: 'A' },
        { x: 'B' },
        { x: 'C' },
        { x: 'D' },
        { x: 'E' }
      ];
      ask.mongify(C);

      expect(C.find({ x: { $gt: 'C' } }))
      .sameCollectionByItems(C[3], C[4]);

      expect(C.find({ x: { $gte: 'C' } }))
      .sameCollectionByItems(C[2], C[3], C[4]);

      expect(C.find({ x: { $lt: 'C' } }))
      .sameCollectionByItems(C[0], C[1]);

      expect(C.find({ x: { $lte: 'C' } }))
      .sameCollectionByItems(C[0], C[1], C[2]);
     }
  );

  it('accept string intervals',
    function() {
      var C = [
        { x: 'A' },
        { x: 'B' },
        { x: 'C' },
        { x: 'D' },
        { x: 'E' }
      ];
      ask.mongify(C);

      expect(C.find({ x: { $gt: 'C', $lt: 'E' } }))
      .sameCollectionByItems(C[3]);

      expect(C.find({ x: { $gt: 'C', $lte: 'E' } }))
      .sameCollectionByItems(C[3], C[4]);

      expect(C.find({ x: { $gte: 'C', $lt: 'E' } }))
      .sameCollectionByItems(C[2], C[3]);

      expect(C.find({ x: { $gte: 'C', $lte: 'E' } }))
      .sameCollectionByItems(C[2], C[3], C[4]);
     }
  );

  it('enforce same type for comparisons',
    function() {
      var C = [
        { x: 1 },
        { x: 2 },
        { x: 3 },
        { x: 4 },
        { x: 5 }
      ];
      ask.mongify(C);

      expect(C.find({ x: { $gt: '3' } })).sameCollection([]);
      expect(C.find({ x: { $gte: '3' } })).sameCollection([]);
      expect(C.find({ x: { $lt: '3' } })).sameCollection([]);
      expect(C.find({ x: { $lte: '3' } })).sameCollection([]);
     }
  );


});
