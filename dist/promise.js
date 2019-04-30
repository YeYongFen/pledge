
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  var constructorErrorText = 'Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.';
  var resolverErrorText = 'You must pass a resolver function as the first argument to the promise constructor';
  var resolveSelfErrorText = 'You cannot resolve a promise with itself';
  var cannotReturnOwnText = 'A promises callback cannot return that same promise.';

  var constructorError = function () { return new TypeError(constructorErrorText); };

  var resolverError = function () { return new TypeError(resolverErrorText); };

  var resolveSelfError = function () { return new TypeError(resolveSelfErrorText); };

  var cannotReturnOwn = function () { return new TypeError(cannotReturnOwnText); };

  var isObject = function (val) {
    return val !== null && typeof val === 'object';
  };

  var isFunction = function (val) {
    return toString.call(val) === '[object Function]';
  };

  var noop = function () {}
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
    return function () { return setTimeout(callback, 1); };
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

  var PENDING = void 0; // undefined
  var FULFILLED = 1;
  var REJECTED = 2;

  var id = 0;
  function Promise (resolver) {
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
    var this$1 = this;

    try {
      resolver(
        function (value) {
          mockResolve(this$1, value);
        },
        function (reason) {
          mockReject(this$1, reason);
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
    var hasCallback = isFunction(callback);
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
    var this$1 = this;

    var parent = this;
    var child = new this.constructor(noop);

    var state = this['[[PromiseStatus]]'];

    if (state) { // 'pending' Corresponding to   undefined ，'fulfilled' Corresponding to  1，'rejected' Corresponding to  2
      var callback = arguments[state - 1];
      asap(function () { return this$1.invokeCallback(
          this$1['[[PromiseStatus]]'],
          child,
          callback,
          this$1['[[PromiseValue]]']
        ); }
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
      asap(this.publish.bind(this));
    }
  };

  Promise.prototype.handleThenable = function (value) {
    var then;
    try {
      then = value.then;
    } catch (e) {
      mockReject(this, { error: e, });
      return;
    }

    // true Promise
    if (isThenable(value)) {
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
    var this$1 = this;

    asap(function () {
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
            mockResolve(this$1, value);
          } else {
            this$1.fulfill(value);
          }
        },
        function (reason) {
          if (sealed) {
            return;
          }
          sealed = true;
          mockReject(this$1, reason);
        }
      );

      if (!sealed && error) {
        sealed = true;
        mockReject(this$1, error);
      }
    });
  };

  Promise.prototype.handlePromise = function (promise) {
    var this$1 = this;

    var state = promise['[[PromiseStatus]]'];
    var result = promise['[[PromiseValue]]'];

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
      function (value) { return mockResolve(this$1, value); },
      function (reason) { return mockReject(this$1, reason); }
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

  function isThenable (value) {
    var sameConstructor = value.constructor === Promise;
    var sameThen = value.then === Promise.prototype.then;
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

    var promise = new Constructor(noop);
    mockResolve(promise, object);
    return promise;
  };

  Promise.reject = function (reason) {
    var Constructor = this;
    var promise = new Constructor(noop);
    mockReject(promise, reason);
    return promise;
  };

  // import asap from './promise/asap';

  // let p = new Promise((resolve) => {
  //   setTimeout(() => {
  //     resolve(1);
  //   }, 2222);
  // }).then((n) => {
  //   console.log(n);
  // });

  var p1 = new Promise(function (resolve) {
    var obj = {
      then: function (fn) {
        fn(1);
      },
    };

    resolve(obj);
  }).then(function (data) {
    console.log(data);
  });

}));
//# sourceMappingURL=promise.js.map
