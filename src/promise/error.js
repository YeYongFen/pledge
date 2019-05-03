const constructorErrorText = 'Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.';
const resolverErrorText = 'You must pass a resolver function as the first argument to the promise constructor';
const resolveSelfErrorText = 'You cannot resolve a promise with itself';
const cannotReturnOwnText = 'A promises callback cannot return that same promise.';
const validationErrorText = 'Array Methods must be provided an Array';
const needsResolverText = 'You must pass a resolver function as the first argument to the promise constructor';
const allNotPassArrayErrorText = 'You must pass an array to Promise.all()';
const raceNotPassArrayErrorText = 'You must pass an array to Promise.race()';

const constructorError = function () { return new TypeError(constructorErrorText); };

const resolverError = function () { return new TypeError(resolverErrorText); };

const resolveSelfError = function () { return new TypeError(resolveSelfErrorText); };

const cannotReturnOwn = function () { return new TypeError(cannotReturnOwnText); };

const validationError = function () { return new Error(validationErrorText); };

const needsResolver = function () { return new TypeError(needsResolverText); };

const allNotPassArrayError = function () { return new TypeError(allNotPassArrayErrorText); };

const raceNotPassArrayError = function () { return new TypeError(raceNotPassArrayErrorText); };

module.exports = {
  constructorError, resolverError, resolveSelfError, cannotReturnOwn, validationError, needsResolver, allNotPassArrayError, raceNotPassArrayError,
};
