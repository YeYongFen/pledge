<h1 align="center">
	<br>
	<img width="256" src="logo.png" alt="pledged">
	<br>
	<br>
</h1>

[<img src="https://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo" title="Promises/A+ 1.1 compliant" align="right" />](https://promisesaplus.com)


pledged is a lightweight promise library implementing the P [romises/A+ specification](http://promises-aplus.github.com/promises-spec/) (Version 1.1).



```bash
npm install pledged

```

```javascript
var Promise = require('pledged');

```

## Usage

```js
new Promise(function(resolve, reject){
    doSomething(function(err, result) {
        if (err) {
            reject(err);
        } else {
            resolve(result);
        }
    });
}).then(function (value) {
    //on success
}, function (reason) {
    //on error
}).catch(function (reason) {
    //shortcut for error handling
});

Promise.all([
    //array of promises or values
]).then(function ([/* array of results */]));

Promise.race([
    //array of promises or values
]);
// either resolves or rejects depending on the first value to do so

```

## API

pledged exports bare ES2015 Promise implementation and polyfills  

**Promise.all(iterable)**  
Returns a promise that either fulfills when all of the promises in the iterable argument have fulfilled or rejects as soon as one of the promises in the iterable argument rejects. If the returned promise fulfills, it is fulfilled with an array of the values from the fulfilled promises in the same order as defined in the iterable. If the returned promise rejects, it is rejected with the reason from the first promise in the iterable that rejected. This method can be useful for aggregating results of multiple promises.   

**Promise.race(iterable)**  
Returns a promise that fulfills or rejects as soon as one of the promises in the iterable fulfills or rejects, with the value or reason from that promise.  

**Promise.reject()**  
Returns a Promise object that is rejected with the given reason.  

**Promise.resolve()**  
Returns a Promise object that is resolved with the given value. If the value is a thenable (i.e. has a then method), the returned promise will "follow" that thenable, adopting its eventual state; otherwise the returned promise will be fulfilled with the value. Generally, if you don't know if a value is a promise or not, Promise.resolve(value) it instead and work with the return value as a promise.  

  
	  

**Promise.prototype.catch()**  
Appends a rejection handler callback to the promise, and returns a new promise resolving to the return value of the callback if it is called, or to its original fulfillment value if the promise is instead fulfilled.  
**Promise.prototype.then()**  
Appends fulfillment and rejection handlers to the promise, and returns a new promise resolving to the return value of the called handler, or to its original settled value if the promise was not handled (i.e. if the relevant handler onFulfilled or onRejected is not a function).  
**Promise.prototype.finally()**  
Appends a handler to the promise, and returns a new promise which is resolved when the original promise is resolved. The handler is called when the promise is settled, whether fulfilled or rejected.