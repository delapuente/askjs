describe('operators $all and $in:', function() {

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

  it('$all checks if the parameter is a subset of other array',
    function () {
      var C = [
        { set: [] },
        { set: [1, 2, 3] },
        { set: [1, 2, 3, 4, 5] },
        { set: [1, 2] },
        { set: '[1, 2, 3]' } 
      ];
      ask.mongify(C);

      expect(C.find( {set: { $all: []}} )).sameCollection(C.slice(0, 4));
      expect(C.find( {set: { $all: [1, 2, 3]}} ))
      .sameCollection(C.slice(1, 3));
    }
  );

  it('$in checks if the key is in the set (actually, an array) passed as ' +
     'parameter',
    function () {
      var C = [
        { x: 5 },
        { color: "red" },
        { color: "green" },
        { color: "blue" },
      ];
      ask.mongify(C);

      expect(C.find( {color: { '$in': []}} )).sameCollection([]);
      expect(C.find( {color: { '$in': ["red", "green"]}} ))
      .sameCollection(C.slice(1, 3));
      expect(C.find( {color: { '$in': ["blue"]}} ))
      .sameCollectionByItems(C[3]);
    }
  );

  it('$nin checks if the key is NOT in the set (actually, an array) passed ' + 
     'as parameter',
    function () {
      var C = [
        { x: 5 },
        { color: "red" },
        { color: "green" },
        { color: "blue" },
      ];
      ask.mongify(C);

      expect(C.find( {color: { '$nin': []}} )).sameCollection(C);
      expect(C.find( {color: { '$nin': ["red", "green"]}} ))
      .sameCollectionByItems(C[0], C[3]);
      expect(C.find( {color: { '$nin': ["blue"]}} ))
      .sameCollection(C.slice(0, 3));
    }
  );

  it('if the value is an array, $in checks if some of its items is in the ' +
     'set passed as parameter',
    function () {
      var C = [
        { x: 5 },
        { color: [] },
        { color: ["red", "green"] },
        { color: ["green", "red"] },
        { color: ["blue", "yellow"] }
      ];
      ask.mongify(C);

      expect(C.find( {color: { '$in': []}} )).sameCollection([]);
      expect(C.find( {color: { '$in': ["red", "green"]}} ))
      .sameCollection(C.slice(2, 4));
      expect(C.find( {color: { '$in': ["blue"]}} ))
      .sameCollectionByItems(C[4]);
    }
  );

  it('if the value is an array, $nin checks if NO ONE of its items is in the ' +
     'set passed as parameter',
    function () {
      var C = [
        { x: 5 },
        { color: [] },
        { color: ["red", "green"] },
        { color: ["green", "red"] },
        { color: ["blue", "yellow"] }
      ];
      ask.mongify(C);

      expect(C.find( {color: { '$nin': []}} )).sameCollection(C);
      expect(C.find( {color: { '$nin': ["red", "green"]}} ))
      .sameCollectionByItems(C[0], C[1], C[4]);
      expect(C.find( {color: { '$nin': ["blue"]}} ))
      .sameCollection(C.slice(0, 4));
    }
  );
});
