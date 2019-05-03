const Promise = require('../src/promise/promise.js')

const adapter = {};

adapter.deferred = function () {
  let pending = {};
  pending.promise = new Promise(function (resolve, reject) {
    pending.resolve = resolve;
    pending.reject = reject;
  });
  return pending;
};
adapter.resolved = function (value) {
  return Promise.resolve(value);
};
adapter.rejected = function (reason) {
  return Promise.reject(reason);
};

adapter.Promise = Promise;

global.adapter = adapter;


require('./common/constructor.test.js');
require('./aplus/testFiles');
require('./common/finally.test.js')
require('./common/all.test.js')
require('./common/race.test.js')
