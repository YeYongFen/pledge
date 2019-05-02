const Promise = require('./promise/promise.js');

// import asap from './promise/asap';

// let p = new Promise((resolve) => {
//   setTimeout(() => {
//     resolve(1);
//   }, 2222);
// }).then((n) => {
//   console.log(n);
// });

const p1 = new Promise((resolve) => {
  const obj = {
    then: function (fn) {
      fn(1);
    },
  };

  resolve(obj);
}).then(data => {
  console.log(data);
});
