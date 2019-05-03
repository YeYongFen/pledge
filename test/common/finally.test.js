const p = global.adapter.Promise;


const someRejectionReason = { message: 'some rejection reason' };
const anotherReason = { message: 'another rejection reason' };
const assert = require('assert');


describe('onFinally', function () {
	describe('no callback', function () {
		specify('from resolved', function () {
			return adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally()
				.then(function onFulfilled(x) {
					assert.strictEqual(x, 3);
				}, function onRejected() {
					throw new Error('should not be called');
				});
		});

		specify('from rejected', function () {
			return adapter.rejected(someRejectionReason)
				.catch(function (e) {
					assert.strictEqual(e, someRejectionReason);
					throw e;
				})
				.finally()
				.then(function onFulfilled() {
					throw new Error('should not be called');
				}, function onRejected(reason) {
					assert.strictEqual(reason, someRejectionReason);
				});
		});
	});

	describe('throws an exception', function () {
		specify('from resolved', function () {
			return adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
				  throw someRejectionReason;
				}).then(function onFulfilled() {
					throw new Error('should not be called');
				}, function onRejected(reason) {
					assert.strictEqual(reason, someRejectionReason);
				});
		});

		specify('from rejected', function () {
			return adapter.rejected(anotherReason).finally(function onFinally() {
				assert(arguments.length === 0);
				throw someRejectionReason;
			}).then(function onFulfilled() {
				throw new Error('should not be called');
			}, function onRejected(reason) {
				assert.strictEqual(reason, someRejectionReason);
			});
		});
	});

	describe('returns a non-promise', function () {
		specify('from resolved', function () {
			return adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					return 4;
				}).then(function onFulfilled(x) {
					assert.strictEqual(x, 3);
				}, function onRejected() {
					throw new Error('should not be called');
				});
		});

		specify('from rejected', function () {
			return adapter.rejected(anotherReason)
				.catch(function (e) {
					assert.strictEqual(e, anotherReason);
					throw e;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					throw someRejectionReason;
				}).then(function onFulfilled() {
					throw new Error('should not be called');
				}, function onRejected(e) {
					assert.strictEqual(e, someRejectionReason);
				});
		});
	});

	describe('returns a pending-forever promise', function () {
		specify('from resolved', function (done) {
			adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					setTimeout(done, 0.1e3);
					return new P(function () {}); // forever pending
				}).then(function onFulfilled(x) {
					throw new Error('should not be called');
				}, function onRejected() {
					throw new Error('should not be called');
				});
		});

		specify('from rejected', function (done) {
			adapter.rejected(someRejectionReason)
				.catch(function (e) {
					assert.strictEqual(e, someRejectionReason);
					throw e;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					setTimeout(done, 0.1e3);
					return new P(function () {}); // forever pending
				}).then(function onFulfilled(x) {
					throw new Error('should not be called');
				}, function onRejected() {
					throw new Error('should not be called');
				});
		});
	});

	describe('returns an immediately-fulfilled promise', function () {
		specify('from resolved', function () {
			return adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					return adapter.resolved(4);
				}).then(function onFulfilled(x) {
					assert.strictEqual(x, 3);
				}, function onRejected() {
					throw new Error('should not be called');
				});
		});

		specify('from rejected', function () {
			return adapter.rejected(someRejectionReason)
				.catch(function (e) {
					assert.strictEqual(e, someRejectionReason);
					throw e;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					return adapter.resolved(4);
				}).then(function onFulfilled() {
					throw new Error('should not be called');
				}, function onRejected(e) {
					assert.strictEqual(e, someRejectionReason);
				});
		});
	});

	describe('returns an immediately-rejected promise', function () {
		specify('from resolved ', function () {
			return adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					return adapter.rejected(4);
				}).then(function onFulfilled(x) {
					throw new Error('should not be called');
				}, function onRejected(e) {
					assert.strictEqual(e, 4);
				});
		});

		specify('from rejected', function () {
			var newReason = {};
			return adapter.rejected(someRejectionReason)
				.catch(function (e) {
					assert.strictEqual(e, someRejectionReason);
					throw e;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					return adapter.rejected(newReason);
				}).then(function onFulfilled(x) {
					throw new Error('should not be called');
				}, function onRejected(e) {
					assert.strictEqual(e, newReason);
				});
		});
	});

	describe('returns a fulfilled-after-a-second promise', function () {
		specify('from resolved', function (done) {
			adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					setTimeout(done, 1.5e3);
					return new P(function (resolve) {
						setTimeout(function () {resolve(4)}, 1e3);
					});
				}).then(function onFulfilled(x) {
					assert.strictEqual(x, 3);
				}, function onRejected() {
					throw new Error('should not be called');
				});
		});

		specify('from rejected', function (done) {
			adapter.rejected(3)
				.catch(function (e) {
					assert.strictEqual(e, 3);
					throw e;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					setTimeout(done, 1.5e3);
					return new P(function (resolve) {
						setTimeout(function () {resolve(4)}, 1e3);
					});
				}).then(function onFulfilled() {
					throw new Error('should not be called');
				}, function onRejected(e) {
					assert.strictEqual(e, 3);
				});
		});
	});

	describe('returns a rejected-after-a-second promise', function () {
		specify('from resolved', function (done) {
			adapter.resolved(3)
				.then(function (x) {
					assert.strictEqual(x, 3);
					return x;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					setTimeout(done, 1.5e3);
					return new P(function (resolve, reject) {
						setTimeout(function (){ reject(4)}, 1e3);
					});
				}).then(function onFulfilled(x) {
					assert.strictEqual(x, 3);
				}, function onRejected() {
					throw new Error('should not be called');
				});
		});

		specify('from rejected', function (done) {
			adapter.rejected(someRejectionReason)
				.catch(function (e) {
					assert.strictEqual(e, someRejectionReason);
					throw e;
				})
				.finally(function onFinally() {
					assert(arguments.length === 0);
					setTimeout(done, 1.5e3);
					return new P(function (resolve, reject) {
						setTimeout(function (){ reject(anotherReason)}, 1e3);
					});
				}).then(function onFulfilled() {
					throw new Error('should not be called');
				}, function onRejected(e) {
					assert.strictEqual(e, anotherReason);
				});
		});
	});
});