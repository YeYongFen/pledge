
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  var constructorErrorText = 'Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.';
  var resolverErrorText = 'You must pass a resolver function as the first argument to the promise constructor';

  var constructorError = function () { return new TypeError(constructorErrorText); };

  var resolverError = function () { return new TypeError(resolverErrorText); };

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
        }
      );
    } catch (e) {
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
    }
    this.subscribes.length = 0;
  };

  Promise.prototype.invokeCallback = function (settled, child, callback, detail) {
    var hasCallback = isFunction(callback);
    var value; var succeeded;
    if (child['[[PromiseStatus]]'] !== PENDING) {
      return;
    }

    if (hasCallback) {
      try {
        value = callback(detail);
        succeeded = true;
      } catch (e) {
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
      }
    } else {
      if (settled === 'fulfilled') {
        this.fulfill.call(child, value);
      }
    }
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var parent = this;
    var child = new this.constructor(noop);

    var state = this['[[PromiseStatus]]'];

    if (state) ; else {
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
      this.asap(this.publish);
    }
  };

  function mockResolve (promise, value) {
    if (promise === value) ; else if (isObject(value) || isFunction(value)) ; else {
      promise.fulfill(value);
    }
  }

  // import asap from './promise/asap';

  var p = new Promise(function (resolve) {
    setTimeout(function () {
      resolve(1);
    }, 2222);
  }).then(function (n) {
    console.log(n);
  });

}));
//# sourceMappingURL=promise.js.map
