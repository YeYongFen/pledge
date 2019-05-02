const isObject = function (val) {
  return val !== null && typeof val === 'object';
};

const isFunction = function (val) {
  return toString.call(val) === '[object Function]';
};

const noop = function () {}
;

module.exports = {
  isObject, isFunction, noop,
}
;
