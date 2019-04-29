import Promise from '../src/promise/promise.js';
import { resolverError, constructorError } from '../src/promise/error';
const assert = require('assert');

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
