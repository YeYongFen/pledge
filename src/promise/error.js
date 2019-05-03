const constructorErrorText = 'Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.';
const resolverErrorText = 'You must pass a resolver function as the first argument to the promise constructor';
const resolveSelfErrorText = 'You cannot resolve a promise with itself';
const cannotReturnOwnText = 'A promises callback cannot return that same promise.';
const validationErrorText = 'Array Methods must be provided an Array';
const needsResolverText = 'You must pass a resolver function as the first argument to the promise constructor';

const constructorError = function () { return new TypeError(constructorErrorText); };

const resolverError = function () { return new TypeError(resolverErrorText); };

const resolveSelfError = function () { return new TypeError(resolveSelfErrorText); };

const cannotReturnOwn = function () { return new TypeError(cannotReturnOwnText); };

const validationError = function () { return new Error(validationErrorText); };

const needsResolver = function () { return new TypeError(needsResolverText); };

module.exports = {
  constructorError, resolverError, resolveSelfError, cannotReturnOwn, validationError, needsResolver,
};
