describe('operators $and, $or and $nor:', function() {

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

  it('$and accepts a list of clauses, all of them must to be true in order ' +
     'to match the element',
    function () {
      var C = [
        { x: 1 },
        { x: 10 },
        { x: [1, 10] }
      ];
      ask.mongify(C);

      expect(C.find({$and: [{x: 1}, {x: {$gt: 5}}]}))
      .sameCollectionByItems(C[2]);
    }
  );

  it('$and expressions can be nested',
    function () {
      var C = [
        { x: 1 },
        { x: 10 },
        { x: [1, 10] }
      ];
      ask.mongify(C);

      expect(C.find({$and: [{$and: [{x: {$size: 2}}]}]}))
      .sameCollectionByItems(C[2]);
    }
  );

  it('$and can not take part of value restricted expression {x: {$size:2, ' +
     '$and: [...]}}',
    function () {
      var C = [
        { x: 1 },
        { x: 10 },
        { x: [1, 10], y:[1, 10] },
        { x: [1, 10], y:[1, 3] }
      ];
      ask.mongify(C);

      function f() {
        C.find({x:{$size:2, $and: [{y: 1}, {y: {$gt: 5}}]}});
      }
      expect(f).toThrow();
    }
  );

  it('$or accepts a list of clauses, some of them must to be true in order ' +
     'to match the element',
    function () {
      var C = [
        { x: 1 },
        { x: 2 },
        { x: 3 },
        { x: 4 },
        { x: 5 },
        { x: 6 },
        { x: 7 },
        { x: 8 },
        { x: 9 },
        { x: 10 }
      ];
      ask.mongify(C);

      expect(C.find({$or: [{x: {$mod: [2]}}, {x: {$gt: 5}}]}))
      .sameCollectionByItems(C[1], C[3], C[5], C[6], C[7], C[8], C[9]);
    }
  );

  it('$or expressions can be nested',
    function () {
      var C = [
        { x: 1 },
        { x: 10 },
        { x: [1, 10] }
      ];
      ask.mongify(C);

      expect(C.find({$or: [{$or: [{x: {$size: 2}}]}]}))
      .sameCollectionByItems(C[2]);
    }
  );

  it('$or can not take part of value restricted expression {x: {$size:2, ' +
     '$or: [...]}}',
    function () {
      var C = [
        { x: 1 },
        { x: 10 },
        { x: [1, 10], y:[1, 10] },
        { x: [1, 10], y:[1, 3] }
      ];
      ask.mongify(C);

      function f() {
        C.find({x:{$size:2, $or: [{y: 1}, {y: {$gt: 5}}]}});
      }
      expect(f).toThrow();
    }
  );

  it('$nor accepts a list of clauses, all of them must to be false in order ' +
     'to match the element',
    function () {
      var C = [
        { x: 1 },
        { x: 2 },
        { x: 3 },
        { x: 4 },
        { x: 5 },
        { x: 6 },
        { x: 7 },
        { x: 8 },
        { x: 9 },
        { x: 10 }
      ];
      ask.mongify(C);

      expect(C.find({$nor: [{x: {$mod: [2]}}, {x: {$gt: 5}}]}))
      .sameCollectionByItems(C[0], C[2], C[4]);
    }
  );

  it('$nor expressions can be nested (but nor is not associative)',
    function () {
      var C = [
        { x: 1 },
        { x: 10 },
        { x: [1, 10] }
      ];
      ask.mongify(C);

      expect(C.find({$nor: [{$nor: [{x: {$size: 2}}]}]}))
      .sameCollectionByItems(C[2]);
    }
  );

  it('$nor can not take part of value restricted expression {x: {$size:2, ' +
     '$nor: [...]}}',
    function () {
      var C = [
        { x: 1 },
        { x: 10 },
        { x: [1, 10], y:[1, 10] },
        { x: [1, 10], y:[1, 3] }
      ];
      ask.mongify(C);

      function f() {
        C.find({x:{$size:2, $nor: [{y: 1}, {y: {$gt: 5}}]}});
      }
      expect(f).toThrow();
    }
  );
});
