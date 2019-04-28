
export function Promise () {
  this['[[PromiseStatus]]'] = 'pending';
  this['[[PromiseValue]]'] = undefined;
}

function needsResolver () {
  throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}

function needsNew () {
  throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}
