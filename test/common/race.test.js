
const Promise = global.adapter.Promise;



const assert = require('assert');

describe('Promise.race', function () {
  function delay(value, time, rejectIt) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        if (rejectIt) {
          return reject(value);
        }
        resolve(value);
      }, time);
    });
  }
  it('fulfills if passed an empty array', function (done) {
    var iterable = [];

    Promise.race(iterable).then(function (value) {
      assert(Array.isArray(value));
      assert.deepEqual(value, []);
      done();
    });
  });

  it('fulfills if passed an array of mixed fulfilled promises and values', function (done) {
    var iterable = [delay(0, 20), Promise.resolve(1), delay(2, 30), delay(Promise.resolve(3), 20)];

    Promise.race(iterable).then(function (value) {
      assert.equal(value, 1);
      done();
    });
  });

  it('rejects if firsed resolved promise is rejected', function (done) {
    var error = new Error('Rejected');

    var iterable = [delay(true, 300), delay(error, 20, true)];

    Promise.race(iterable).then(
      function (value) {
        assert(false, 'should never get here');
        done();
      },
      function (reason) {
        assert.strictEqual(reason, error);
        done();
      }
    );
  });

  it('resolves if second resolved promise is rejected', function (done) {
    var error = new Error('Rejected');

    var iterable = [delay(true, 30), delay(error, 200, true)];

    Promise.race(iterable).then(
      function (value) {
        assert(value, 'should resolve');
        done();
      },
      function (reason) {
        assert(false, 'should never get here');
        done();
      }
    );
  });

  it('resolves foreign thenables', function (done) {
    var normal = Promise.resolve(1);
    var foreign = { then: function (f) { f(2); } };

    var iterable = [delay(Promise.resolve(1), 200), foreign];

    Promise.race(iterable).then(function (value) {
      assert.deepEqual(value, 2);
      done();
    });
  });

  it('fulfills when passed an sparse array, giving `undefined` for the omitted values', function (done) {
    var iterable = [delay(Promise.resolve(0), 300), , , delay(Promise.resolve(1), 300)];

    Promise.race(iterable).then(function (value) {
      assert.equal(value, undefined);
      done();
    });
  });



  it('should reject with a TypeError if given a non-iterable', function (done) {
    var notIterable = {};

    Promise.race(notIterable).then(
      function () {
        assert(false, 'should never get here');
        done();
      },
      function (reason) {
        assert(reason instanceof TypeError);
        done();
      }
    );
  });
});
