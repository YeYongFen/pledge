import Promise from '../src/promise/promise.js';
import { resolverError, constructorError } from '../src/promise/error';
const assert = require('assert');

// const aplus = require('promises-aplus-tests');

describe('test new Promise process ', () => {
  it('not passing any argument to the promise constructor will throw a error', () => {
    try {
      new Promise();  // eslint-disable-line
    } catch (e) {
      assert.strictEqual(e.message, resolverError().message);
    }
  });

  it('calling Promise as a function will throw a error', () => {
    try {
      Promise(() => {});
    } catch (e) {
      assert.strictEqual(e.message, constructorError().message);
    }
  });
});

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


global.adapter = adapter;
require('./aplus/testFiles');