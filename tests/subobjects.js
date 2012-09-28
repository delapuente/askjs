describe('subobjects', function() {

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

  it('lets the user to look for specific subobjects',
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

      expect(C.find({address: { city: "San Francisco", state: "CA"}}))
      .sameCollectionByItems(C[0]);
    }
  );

  it('does not match if partial object is provided',
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

      expect(C.find({address: { state: "CA"}}))
      .sameCollection([]);
    }
  );

  it('works in combination with dot notation',
    function () {
      var C = [
        { name: 'Ann', address: { city: "San Francisco", state: "CA" } },
        { name: 'Bob', address: { city: "Los Angeles", state: "CA" } },
        { name: 'Charles', address: { city: "Orem", state: "UT" } },
        { name: 'David', address: { city: "Boston", state: "MA" } },
        { name: 'Emily', address: { city: "Hampshire", state: "MA" } },
        { name: 'Frank', address: { city: "Provo", state: "UT" } },
        { name: 'George', address: { 
          city: { name: "Provo", zipcode: 84601 }, state: "UT"
        }}
      ];
      ask.mongify(C);

      expect(C.find({"address.city": { name: "Provo", zipcode: 84601}}))
      .sameCollectionByItems(C[6]);
    }
  );

  it('in combination with operators, it returns no results',
    function () {
      var C = [
        { name: 'Ann', address: { city: "San Francisco", state: "CA" } },
        { name: 'Bob', address: { city: "Los Angeles", state: "CA" } },
        { name: 'Charles', address: { city: "Orem", state: "UT" } },
        { name: 'David', address: { city: "Boston", state: "MA" } },
        { name: 'Emily', address: { city: "Hampshire", state: "MA" } },
        { name: 'Frank', address: { city: "Provo", state: "UT" } }
      ];
      ask.mongify(C);

      expect(C.find({address: { $type: 3}}))
      .sameCollection(C);

      expect(C.find({address: { city: "San Francisco", state: "CA", $type: 3}}))
      .sameCollection([]);
    }
  );
});
