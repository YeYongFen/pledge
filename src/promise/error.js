const constructorErrorText = 'Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.';
const resolverErrorText = 'You must pass a resolver function as the first argument to the promise constructor';
const resolveSelfErrorText = 'You cannot resolve a promise with itself';
const cannotReturnOwnText = 'A promises callback cannot return that same promise.';
const validationErrorText = 'Array Methods must be provided an Array';
const needsResolverText = 'You must pass a resolver function as the first argument to the promise constructor';

export const constructorError = () => new TypeError(constructorErrorText);

export const resolverError = () => new TypeError(resolverErrorText);

export const resolveSelfError = () => new TypeError(resolveSelfErrorText);

export const cannotReturnOwn = () => new TypeError(cannotReturnOwnText);

export const validationError = () => new Error(validationErrorText);

export const needsResolver = () => new TypeError(needsResolverText);
