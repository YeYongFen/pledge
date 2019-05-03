'use strict';

var isObject = function (val) {
  return val !== null && typeof val === 'object';
};

var isFunction = function (val) {
  return toString.call(val) === '[object Function]';
};

var noop = function () {}
;

var utils = {
  isObject: isObject, isFunction: isFunction, noop: noop,
}
;

var queue = [];
var index = 0;
// let flushing = false;
var capacity = 1024;

var browserWindow = (typeof window !== 'undefined') ? window : undefined;
var browserGlobal = browserWindow || {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;

var requestFlush = (function () {
  if (BrowserMutationObserver) {
    return makeMutationObserver(flush);
  } else {
    return makeMutationTimeout(flush);
  }
})();

function makeMutationObserver (callback) {
  var toggle = 1;
  var observer = new BrowserMutationObserver(callback);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true, });
  return function () {
    node.data = --toggle;
  };
}
function makeMutationTimeout (callback) {
  return function () { setTimeout(callback, 1); };
}
function flush () {
  while (index < queue.length) {
    var currentIndex = index;
    index = index + 1;
    queue[currentIndex].call();

    if (index > capacity) {
      for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
        queue[scan] = queue[scan + index];
      }
      queue.length -= index;
      index = 0;
    }
  }
  queue.length = 0;
  index = 0;
  // flushing = false;
}

function asap (task) {
  if (!queue.length) {
    requestFlush();
    // flushing = true;
  }
  // Equivalent to push, but avoids a function call.
  queue[queue.length] = task;
}

var asap_1 = asap;

var constructorErrorText = 'Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.';
var resolverErrorText = 'You must pass a resolver function as the first argument to the promise constructor';
var resolveSelfErrorText = 'You cannot resolve a promise with itself';
var cannotReturnOwnText = 'A promises callback cannot return that same promise.';
var validationErrorText = 'Array Methods must be provided an Array';
var needsResolverText = 'You must pass a resolver function as the first argument to the promise constructor';
var allNotPassArrayErrorText = 'You must pass an array to Promise.all()';
var raceNotPassArrayErrorText = 'You must pass an array to Promise.race()';

var constructorError = function () { return new TypeError(constructorErrorText); };

var resolverError = function () { return new TypeError(resolverErrorText); };

var resolveSelfError = function () { return new TypeError(resolveSelfErrorText); };

var cannotReturnOwn = function () { return new TypeError(cannotReturnOwnText); };

var validationError = function () { return new Error(validationErrorText); };

var needsResolver = function () { return new TypeError(needsResolverText); };

var allNotPassArrayError = function () { return new TypeError(allNotPassArrayErrorText); };

var raceNotPassArrayError = function () { return new TypeError(raceNotPassArrayErrorText); };

var error = {
  constructorError: constructorError, resolverError: resolverError, resolveSelfError: resolveSelfError, cannotReturnOwn: cannotReturnOwn, validationError: validationError, needsResolver: needsResolver, allNotPassArrayError: allNotPassArrayError, raceNotPassArrayError: raceNotPassArrayError,
};

var isObject$1 = utils.isObject;
var isFunction$1 = utils.isFunction;
var noop$1 = utils.noop;


var resolverError$1 = error.resolverError;
var constructorError$1 = error.constructorError;
var resolveSelfError$1 = error.resolveSelfError;
var cannotReturnOwn$1 = error.cannotReturnOwn;
var allNotPassArrayError$1 = error.allNotPassArrayError;
var raceNotPassArrayError$1 = error.raceNotPassArrayError;

var PENDING = void 0; // undefined
var FULFILLED = 1;
var REJECTED = 2;

var id = 0;
function Promise (resolver) {
  if (!(this instanceof Promise)) {
    throw constructorError$1();
  }
  if (typeof resolver !== 'function') {
    throw resolverError$1();
  }

  this['[[PromiseStatus]]'] = PENDING;
  this['[[PromiseValue]]'] = undefined;
  this.subscribes = [];
  this.tid = id++;

  this.initializePromise(resolver);
}

Promise.prototype.initializePromise = function (resolver) {
  var self = this;
  try {
    resolver(
      function (value) {
        mockResolve(self, value);
      },
      function (reason) {
        mockReject(self, reason);
      }
    );
  } catch (e) {
    mockReject(self, e);
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
    asap_1(this.publish.bind(this)); // 2.2.4  onFulfilled or onRejected must not be called until the execution context stack contains only platform code.
  }
};

Promise.prototype.publish = function () {
  var subscribes = this.subscribes;
  var settled = this['[[PromiseStatus]]'];
  var result = this['[[PromiseValue]]'];
  if (subscribes.length === 0) {
    return;
  }
  for (var i = 0; i < subscribes.length; i += 3) {
    var item = subscribes[i];
    var callback = subscribes[i + settled];
    if (item) {
      this.invokeCallback(settled, item, callback, result);
    } else {
      callback(result);
    }
  }
  this.subscribes.length = 0;
};

Promise.prototype.invokeCallback = function (settled, child, callback, detail) {
  var hasCallback = isFunction$1(callback);
  var value; var error; var succeeded; var failed;

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
      mockReject(child, cannotReturnOwn$1());
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
      mockReject(child, error.error);
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
  var parent = this;
  var self = this;
  var child = new this.constructor(noop$1);

  var state = this['[[PromiseStatus]]'];

  if (state) { // 'pending' Corresponding to   undefined ，'fulfilled' Corresponding to  1，'rejected' Corresponding to  2
    var callback = arguments[state - 1];
    asap_1(function () {
      self.invokeCallback(
        self['[[PromiseStatus]]'],
        child,
        callback,
        self['[[PromiseValue]]']
      )
      ;
    }
    );
  } else {
    this.subscribe(parent, child, onFulfilled, onRejected);
  }

  return child;
};

Promise.prototype.subscribe = function (parent, child, onFulfilled, onRejected) {
  var subscribes = parent.subscribes;
  var length = parent.subscribes.length;
  subscribes[length] = child;
  subscribes[length + FULFILLED] = onFulfilled;
  subscribes[length + REJECTED] = onRejected;
  if (length === 0 && parent['[[PromiseStatus]]']) {
    asap_1(this.publish.bind(this));
  }
};

Promise.prototype.handleThenable = function (value) {
  var then;
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
  if (isFunction$1(then)) {
    this.handleForeignThenable(value, then);
    return;
  }
  // normal data
  this.fulfill(value);
};

Promise.prototype.handleForeignThenable = function (thenable, then) {
  var self = this;
  asap_1(function () {
    var sealed = false;
    var error = tryThen(
      then,
      thenable,
      function (value) {
        if (sealed) {
          return;
        }
        sealed = true;
        if (thenable !== value) {
          mockResolve(self, value);
        } else {
          self.fulfill(value);
        }
      },
      function (reason) {
        if (sealed) {
          return;
        }
        sealed = true;
        mockReject(self, reason);
      }
    );

    if (!sealed && error) {
      sealed = true;
      mockReject(self, error);
    }
  });
};

Promise.prototype.handlePromise = function (promise) {
  var state = promise['[[PromiseStatus]]'];
  var result = promise['[[PromiseValue]]'];
  var self = this;

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
    function (value) { mockResolve(self, value); },
    function (reason) { mockReject(self, reason); }
  );
};

Promise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};

Promise.prototype.finally = function (callback) {
  if (typeof callback !== 'function') {
    return this;
  }
  var p = this.constructor;
  // return this.then(resolve, reject);
  return this.then(resolve, reject);

  function resolve (value) {
    function yes () {
      return value;
    }
    return p.resolve(callback()).then(yes);
  }
  function reject (reason) {
    function no () {
      throw reason;
    }
    return p.resolve(callback()).then(no);
  }
};

function mockResolve (promise, value) {
  if (promise === value) {
    mockReject(promise, resolveSelfError$1()); // 2.3.1、If promise and x refer to the same object, reject promise with a TypeError as the reason
  } else if (isObject$1(value) || isFunction$1(value)) { // handle the thenable
    promise.handleThenable(value);
  } else {
    promise.fulfill(value);
  }
}

function mockReject (promise, reason) {
  if (promise['[[PromiseStatus]]'] !== PENDING) { return; }

  promise['[[PromiseStatus]]'] = REJECTED;
  promise['[[PromiseValue]]'] = reason;
  asap_1(promise.publish.bind(promise));
}

function isThenable (value, then) {
  var sameConstructor = value.constructor === Promise;
  var sameThen = then === Promise.prototype.then;
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
  var Constructor = this;

  if (object && typeof object === 'object' && object.constructor === Constructor) {
    return object;
  }

  var promise = new Constructor(noop$1);
  mockResolve(promise, object);
  return promise;
};

Promise.reject = function (reason) {
  var Constructor = this;
  var promise = new Constructor(noop$1);
  mockReject(promise, reason);
  return promise;
};

Promise.all = function (promises) {
  return new Promise(function (resolve, reject) {
    if (!Array.isArray(promises)) {
      reject(allNotPassArrayError$1());
      return;
    }

    var results = [];
    var remaining = 0;

    function resolver (index) {
      remaining++;
      return function (value) {
        results[index] = value;
        if (!--remaining) {
          resolve(results);
        }
      };
    }

    for (var i = 0, promise = (void 0); i < promises.length; i++) {
      promise = promises[i];

      if (promise && typeof promise.then === 'function') {
        promise.then(resolver(i), reject);
      } else {
        results[i] = promise;
      }
    }

    if (!remaining) {
      resolve(results);
    }
  });
};

Promise.race = function (promises) {
  return new Promise(function (resolve, reject) {
    if (!Array.isArray(promises)) {
      reject(raceNotPassArrayError$1());
    }

    if (promises.length === 0) {
      resolve([]);
    }

    for (var i = 0, promise = (void 0); i < promises.length; i++) {
      promise = promises[i];

      if (promise && typeof promise.then === 'function') {
        promise.then(resolve, reject);
      } else {
        resolve(promise);
      }
    }
  });
};

var promise = Promise;

module.exports = promise;
