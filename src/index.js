const Promise = require('./promise/promise.js');

// import asap from './promise/asap';

let p = new Promise((resolve) => {
  const p2 = new Promise((resolve, reject) => {

  });

  resolve(p2);
}).then((n) => {

});

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
