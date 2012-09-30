describe('dot notation', function() {

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

  it('lets the user to match nested objects',
    function () {
      var C = [
        { name: 'Ann', address: { city: "San Francisco", state: "CA" } },
        { name: 'Bob', address: { city: "Los Angeles", state: "CA" } },
        { name: 'Charles', address: { city: "Orem", state: "UT" } },
        { name: 'David', address: { city: "Boston", state: "MA" } },
        { name: 'Emily', address: { city: "Hampshire", state: "MA" } },
        { name: 'Frank', address: { city: "Provo", state: "UT" } },
      ];
      ask.mongify(C);

      expect(C.find({'address.state': 'MA'}))
      .sameCollectionByItems(C[3], C[4]);
    }
  );

  it('lets the user to look in specified array positions',
    function () {
      var C = [
        { name: 'Ann', array: [1, 2, 3, 4, 5] },
        { name: 'Bob', array: [[1,2,3], ['A', 'B', 'C']] },
        { name: 'Charles', array: [{x:1}, {x:2}] },
        { name: 'David', array: [{x:'A'}, {x:'B'}] }
      ];
      ask.mongify(C);

      expect(C.find({'array.0': 1}))
      .sameCollectionByItems(C[0], C[1]);

      expect(C.find({'array.0.x': 1}))
      .sameCollectionByItems(C[2]);
    }
  );

  it('lets the user to look inside complete arrays of objects',
    function () {
      var C = [
        { name: 'Ann', array: [1, 2, 3, 4, 5] },
        { name: 'Bob', array: [[1,2,3], ['A', 'B', 'C']] },
        { name: 'Charles', array: [{x:1}, {x:2}] },
        { name: 'David', array: [{x:'A'}, {x:'B'}] }
      ];
      ask.mongify(C);

      expect(C.find({'array.x': 'A'}))
      .sameCollectionByItems(C[3]);
    }
  );

  it('lets the user to look inside complete arrays of objects, in complex ways',
    function () {
      var C = [
        {array:[{x:[{y:1}, {y:2}]}, {x:[{y:3}, {y:4}]}, {x:[{y:5}, {y:6}]}]},
        {array:[{x:[{y:7}, {y:8}]}, {x:[{y:9}, {y:10}]}, {x:[{y:11}, {y:12}]}]}
      ];
      ask.mongify(C);

      expect(C.find({'array.x.y': 7}))
      .sameCollectionByItems(C[1]);
    }
  );

});
