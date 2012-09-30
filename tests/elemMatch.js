describe('$elemMatch', function() {

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

  it('dot notation is not enough (it behaves like and or)',
    function () {
      var C = [
        { "foo" : [
          {
            "shape" : "square",
            "color" : "purple",
            "thick" : false
          },
          {
            "shape" : "circle",
            "color" : "red",
            "thick" : true
          }
        ] },

        { "foo" : [
              {
                "shape" : "square",
                "color" : "red",
                "thick" : true
              },
              {
                "shape" : "circle",
                "color" : "purple",
                "thick" : false
              }
        ] }
      ];
      ask.mongify(C);

      expect(C.find({"foo.shape": "square", "foo.color": "purple"}))
      .sameCollection(C);
    }
  );

  it('subobject matching is not enough (there is another field that avoid ' +
     'required perfect matching)',
    function () {
      var C = [
        { "foo" : [
          {
            "shape" : "square",
            "color" : "purple",
            "thick" : false
          },
          {
            "shape" : "circle",
            "color" : "red",
            "thick" : true
          }
        ] },

        { "foo" : [
              {
                "shape" : "square",
                "color" : "red",
                "thick" : true
              },
              {
                "shape" : "circle",
                "color" : "purple",
                "thick" : false
              }
        ] }
      ];
      ask.mongify(C);

      expect(C.find({foo: { shape: "square", color: "purple"}}))
      .sameCollection([]);
    }
  );

  it('$elemMatch forces and object inside an array to match the given ' +
     'specification',
    function () {
      var C = [
        { "foo" : [
          {
            "shape" : "square",
            "color" : "purple",
            "thick" : false
          },
          {
            "shape" : "circle",
            "color" : "red",
            "thick" : true
          }
        ] },

        { "foo" : [
              {
                "shape" : "square",
                "color" : "red",
                "thick" : true
              },
              {
                "shape" : "circle",
                "color" : "purple",
                "thick" : false
              }
        ] }
      ];
      ask.mongify(C);

      expect(C.find({foo: { $elemMatch: { shape: "square", color: "purple"}}}))
      .sameCollectionByItems(C[0]);
    }
  );

  it('within arrays, expressions behave in an unexpected way. This is ' +
     'because all the elements inside an array are taken as possible values ' +
     'to match each operator. So it is not mandatory the same item pass all ' +
     'operators, just some of the item.',
    function () {
      var C = [
        {x: 3},
        {x: [4]},
        {x: [1, 6]}
      ];
      ask.mongify(C);

      expect(C.find({x:{$gt:2, $lt:5}}))
      .sameCollection(C);
    }
  );

  it('with $elemMatch, any item inside the array, individually, must match ' +
     'all the expression.',
    function () {
      var C = [
        {x: 3},
        {x: [4]},
        {x: [1, 6]}
      ];
      ask.mongify(C);

      expect(C.find({x: {$elemMatch: {$gt:2, $lt:5}}}))
      .sameCollectionByItems(C[1]);
    }
  );
});
