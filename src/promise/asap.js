
let queue = [];
let index = 0;
// let flushing = false;
let capacity = 1024;

const browserWindow = (typeof window !== 'undefined') ? window : undefined;
const browserGlobal = browserWindow || {};
const BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;

const requestFlush = (function () {
  if (BrowserMutationObserver) {
    return makeMutationObserver(flush);
  } else {
    return makeMutationTimeout(flush);
  }
})();

function makeMutationObserver (callback) {
  let toggle = 1;
  const observer = new BrowserMutationObserver(callback);
  const node = document.createTextNode('');
  observer.observe(node, { characterData: true, });
  return () => {
    node.data = --toggle;
  };
};

function makeMutationTimeout (callback) {
  return () => setTimeout(callback, 1);
};

function flush () {
  while (index < queue.length) {
    let currentIndex = index;
    index = index + 1;
    queue[currentIndex].call();

    if (index > capacity) {
      for (let scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
        queue[scan] = queue[scan + index];
      }
      queue.length -= index;
      index = 0;
    }
  }
  queue.length = 0;
  index = 0;
  // flushing = false;
}

export default function asap (task) {
  if (!queue.length) {
    requestFlush();
    // flushing = true;
  }
  // Equivalent to push, but avoids a function call.
  queue[queue.length] = task;
}
