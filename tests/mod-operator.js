describe('$mod operator:', function() {

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

  it('performs modulus operation',
    function () {
      var C = [
        { x: 0 },
        { x: 1 },
        { x: 2 },
        { x: 3 },
        { x: 4 },
        { x: 5 }
      ];
      ask.mongify(C);

      expect(C.find( {x: { $mod: [2, 0]}} )).sameCollectionByItems(
        C[0],
        C[2],
        C[4]
      );
      expect(C.find( {x: { $mod: [2, 1]}} )).sameCollectionByItems(
        C[1],
        C[3],
        C[5]
      );
    }
  );
});
