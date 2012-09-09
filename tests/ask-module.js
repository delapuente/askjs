describe('ask module', function() {
  it('has a `mongify()` method', function () {
    expect(ask.mongify).toEqual(jasmine.any(Function));
  });

  it('has a `types()` method', function () {
    expect(ask.types).toEqual(jasmine.any(Function));
  });
});
