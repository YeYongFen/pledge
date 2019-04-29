export const isObject = (val) => {
  return val !== null && typeof val === 'object';
};

export const isFunction = (val) => {
  return toString.call(val) === '[object Function]';
};

export const noop = () => {}
;
