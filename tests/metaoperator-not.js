describe('metaoperator $not', function() {

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

  it('precedes a expression and negates the the meaning of this expression',
    function () {
      var C = [
        { x: 1 },
        { x: 2 },
        { x: 3 },
        { x: 4 },
        { x: 5 },
        { y: 6 },
        { y: 7 },
        { y: 8 },
        { y: 9 },
        { y: 10 }
      ];
      ask.mongify(C);

      expect(C.find({x:{$not:{$lte:4, $gte:2}}}))
      .sameCollectionByItems(C[0], C[4], C[5], C[6], C[7], C[8], C[9]);
    }
  );

  it('for some reason, it accepts to be a type of restriction, just like ' +
     '$and / $or; but this is not a valid syntax according to ' +
     'http://docs.mongodb.org/manual/reference/operators/#_S_not . Anyway, ' +
     'it returns the empty collection',
    function () {
      var C = [
        { x: 1 },
        { x: 2 },
        { x: 3 },
        { x: 4 },
        { x: 5 },
        { y: 6 },
        { y: 7 },
        { y: 8 },
        { y: 9 },
        { y: 10 }
      ];
      ask.mongify(C);

      expect(C.find({$not:{x:{$not:{$lte:4, $gte:2}}}}))
      .sameCollection([]);
    }
  );

  it('as normal operators require the key to exists in order to match, $not ' +
     'does not require the key to exists, so it also returns items without ' +
     'the specified key.', 
    function() {
      var C = [
        { x: 1 },
        { x: 2 },
        { x: 3 },
        { x: 4 },
        { x: 5 },
        { y: 6 },
        { y: 7 },
        { y: 8 },
        { y: 9 },
        { y: 10 }
      ];
      ask.mongify(C);

      expect(C.find({x:{$not:{$lte:5}}}))
      .sameCollection(C.slice(5));
    }
  );

  it('this means it is not the same {$gt: 3} and {$not: {$lte: 3}} ', 
    function() {
      var C = [
        { x: 1 },
        { x: 2 },
        { x: 3 },
        { x: 4 },
        { x: 5 },
        { y: 6 },
        { y: 7 },
        { y: 8 },
        { y: 9 },
        { y: 10 }
      ];
      ask.mongify(C);

      expect(C.find({x: {$gt: 3}}))
      .sameCollectionByItems(C[3], C[4]);

      expect(C.find({x: {$not: {$lte: 3}}}))
      .sameCollection(C.slice(3));

      expect(C.find({x: {$gt: 3}}))
      .not.sameCollection(C.find({x: {$not: {$lte: 3}}}));
    }
  );
});
