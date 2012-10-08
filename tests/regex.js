describe('regular expressions', function() {

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

  it('can be used as value restricted specifications using a JS regexp literal',
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

      expect(C.find({'address.city': /.*an.*/}))
      .sameCollectionByItems(C[0]);
    }
  );

  it('can be used with flags following the JS regexp literal notation',
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

      expect(C.find({'address.city': /.*an.*/i}))
      .sameCollectionByItems(C[0], C[1]);
    }
  );

  it('can be constructed with $regex constructor followe by a string to let ' +
     'regular expressions matching inside a Mongo query expression',
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

      expect(C.find({'address.city': {$regex:".*an.*"}}))
      .sameCollectionByItems(C[0]);
    }
  );

  it('inside an expression, you can use constructor $options to indicate the ' +
     'flags for the regular expression',
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

      expect(C.find({'address.city': {$regex:".*an.*", $options:"i"}}))
      .sameCollectionByItems(C[0], C[1]);
    }
  );

  it('$options contructor has no effect alone',
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

      expect(C.find({'address.city': {$options:"i"}}))
      .sameCollection(C);
    }
  );

  it('using $regex contructor inside an expression, it can be used in ' +
     'addition to other operators',
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

      expect(C.find({'address.city': {
        $regex:".*an.*", $options:"i",
        $nin: ['San Francisco']
      }
      }))
      .sameCollectionByItems(C[1]);
    }
  );
});
