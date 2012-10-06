describe('JavaScript expressions and $where clauses in queries', function() {

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

  it('accepts the $where clause with a string where `this` is the item being ' +
     'tested',
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

      expect(C.find({x:{$gt:4}}))
      .sameCollection(C.find({$where:"this.x > 4"}));
    }
  );

  it('accepts the string directly as parameter of the find method',
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

      expect(C.find({x:{$gt:4}}))
      .sameCollection(C.find("this.x > 4"));
    }
  );

  it('accepts a function instead of the string as $where parameter',
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

      function f() {
        var value = 4;
        return this.x > value;
      }

      expect(C.find({x:{$gt:4}}))
      .sameCollection(C.find({$where:f}));
    }
  );

  it('accepts a function instead of the string as find() parameter',
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

      function f() {
        var value = 4;
        return this.x > value;
      }

      expect(C.find({x:{$gt:4}}))
      .sameCollection(C.find(f));
    }
  );
});
