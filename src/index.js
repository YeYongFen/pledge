import Promise from './promise/promise.js';

// import asap from './promise/asap';

let p = new Promise((resolve) => {
  setTimeout(() => {
    resolve(1);
  }, 2222);
}).then((n) => {
  console.log(n);
});
