
import { resolverError, constructorError, resolveSelfError, cannotReturnOwn } from './error';
import { isObject, isFunction, noop } from './utils';
import asap from './asap';

const PENDING = void 0; // undefined
const FULFILLED = 1;
const REJECTED = 2;

let id = 0;
export default function Promise (resolver) {
  if (!(this instanceof Promise)) {
    throw constructorError();
  }
  if (typeof resolver !== 'function') {
    throw resolverError();
  }

  this['[[PromiseStatus]]'] = PENDING;
  this['[[PromiseValue]]'] = undefined;
  this.subscribes = [];
  this.tid = id++;

  this.initializePromise(resolver);
}

Promise.prototype.initializePromise = function (resolver) {
  try {
    resolver(
      value => {
        mockResolve(this, value);
      },
      reason => {
        mockReject(this, reason);
      }
    );
  } catch (e) {
    mockReject(this, e);
  }
  return null;
};

Promise.prototype.fulfill = function (value) {
  if (this['[[PromiseStatus]]'] !== PENDING) {
    return;
  }
  this['[[PromiseStatus]]'] = FULFILLED;
  this['[[PromiseValue]]'] = value;

  if (this.subscribes.length !== 0) {
    asap(this.publish.bind(this)); // 2.2.4  onFulfilled or onRejected must not be called until the execution context stack contains only platform code.
  }
};

Promise.prototype.publish = function () {
  const subscribes = this.subscribes;
  const settled = this['[[PromiseStatus]]'];
  const result = this['[[PromiseValue]]'];
  if (subscribes.length === 0) {
    return;
  }
  for (let i = 0; i < subscribes.length; i += 3) {
    const item = subscribes[i];
    const callback = subscribes[i + settled];
    if (item) {
      this.invokeCallback(settled, item, callback, result);
    } else {
      callback(result);
    }
  }
  this.subscribes.length = 0;
};

Promise.prototype.invokeCallback = function (settled, child, callback, detail) {
  let hasCallback = isFunction(callback);
  let value; let error; let succeeded; let failed;

  if (child['[[PromiseStatus]]'] !== PENDING) {
    return;
  }

  if (hasCallback) {
    try {
      value = callback(detail);
      succeeded = true;
    } catch (e) {
      error = { error: e, };
      failed = true;
    }
    /*
        var p = new Promise((r) => r(1))
        var pp = p.then(() => {
            return pp
        })

        is not allow
    */
    if (child === value) {
      mockReject(child, cannotReturnOwn());
    }
  } else {
    /*
        var p = new Promise( (r)=>r(1) )
          p.then().then(()=>{
        })
        There is empty then()
    */
    value = detail;
    succeeded = true;
  }

  if (hasCallback) {
    if (succeeded) {
      mockResolve(child, value);
    } else if (failed) {
      mockReject(child, error);
    }
  } else {
    if (settled === FULFILLED) {
      this.fulfill.call(child, value);
    } else if (settled === REJECTED) {
      mockReject(child, value);
    }
  }
};

Promise.prototype.then = function (onFulfilled, onRejected) {
  const parent = this;
  const child = new this.constructor(noop);

  const state = this['[[PromiseStatus]]'];

  if (state) { // 'pending' Corresponding to   undefined ，'fulfilled' Corresponding to  1，'rejected' Corresponding to  2
    const callback = arguments[state - 1];
    asap(() =>
      this.invokeCallback(
        this['[[PromiseStatus]]'],
        child,
        callback,
        this['[[PromiseValue]]']
      )
    );
  } else {
    this.subscribe(parent, child, onFulfilled, onRejected);
  }

  return child;
};

Promise.prototype.subscribe = function (parent, child, onFulfilled, onRejected) {
  let {
    subscribes,
    subscribes: { length, },
  } = parent;
  subscribes[length] = child;
  subscribes[length + FULFILLED] = onFulfilled;
  subscribes[length + REJECTED] = onRejected;
  if (length === 0 && parent['[[PromiseStatus]]']) {
    asap(this.publish.bind(this));
  }
};

Promise.prototype.handleThenable = function (value) {
  let then;
  try {
    then = value.then;
  } catch (e) {
    mockReject(this, e);
    return;
  }

  // true Promise
  if (isThenable(value, then)) {
    this.handlePromise(value);
    return;
  }

  // // 如果 then 是函数，则检验 then 方法的合法性
  if (isFunction(then)) {
    this.handleForeignThenable(value, then);
    return;
  }
  // normal data
  this.fulfill(value);
};

Promise.prototype.handleForeignThenable = function (thenable, then) {
  asap(() => {
    let sealed = false;
    const error = tryThen(
      then,
      thenable,
      value => {
        if (sealed) {
          return;
        }
        sealed = true;
        if (thenable !== value) {
          mockResolve(this, value);
        } else {
          this.fulfill(value);
        }
      },
      reason => {
        if (sealed) {
          return;
        }
        sealed = true;
        mockReject(this, reason);
      }
    );

    if (!sealed && error) {
      sealed = true;
      mockReject(this, error);
    }
  });
};

Promise.prototype.handlePromise = function (promise) {
  const state = promise['[[PromiseStatus]]'];
  const result = promise['[[PromiseValue]]'];

  if (state === FULFILLED) {
    this.fulfill(result);
    return;
  }
  if (state === REJECTED) {
    mockReject(this, result);
    return;
  }
  this.subscribe(
    promise,
    undefined,
    value => mockResolve(this, value),
    reason => mockReject(this, reason)
  );
};

function mockResolve (promise, value) {
  if (promise === value) {
    mockReject(promise, resolveSelfError()); // 2.3.1、If promise and x refer to the same object, reject promise with a TypeError as the reason
  } else if (isObject(value) || isFunction(value)) { // handle the thenable
    promise.handleThenable(value);
  } else {
    promise.fulfill(value);
  }
}

function mockReject (promise, reason) {
  if (promise['[[PromiseStatus]]'] !== PENDING) { return; }

  promise['[[PromiseStatus]]'] = REJECTED;
  promise['[[PromiseValue]]'] = reason;
  asap(promise.publish.bind(promise));
}

function isThenable (value, then) {
  const sameConstructor = value.constructor === Promise;
  const sameThen = then === Promise.prototype.then;
  // const sameResolve = value.constructor.resolve === Promise.resolve;
  return sameConstructor && sameThen;
}

function tryThen (then, thenable, resolvePromise, rejectPromise) {
  try {
    then.call(thenable, resolvePromise, rejectPromise);
  } catch (e) {
    return e;
  }
}

Promise.resolve = function (object) {
  let Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  let promise = new Constructor(noop);
  mockResolve(promise, object);
  return promise;
};

Promise.reject = function (reason) {
  let Constructor = this;
  let promise = new Constructor(noop);
  mockReject(promise, reason);
  return promise;
};
