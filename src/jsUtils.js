function toArr(a) {
  if (Array.isArray(a)) return a;
  const ret = [];
  Object.keys(a).forEach(i => {
    ret[i] = a[i];
  });
  return ret;
}

function hasShape(obj, shape) {
  if (typeof obj !== typeof shape) {
    console.log('hasShape type fail: ', obj, typeof shape);
    return false;
  }
  if (typeof obj === 'object') {
    return Object.keys(shape).every(key => {
      if (obj[key] === undefined) {
        console.log('hasShape key fail', obj, key);
        return false;
      }
      return hasShape(obj[key], shape[key])
    });
  } else {
    return true;
  }
}

window.requestIdleCallback =
  window.requestIdleCallback ||
  function (cb) {
    var start = Date.now();
    return setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        }
      });
    }, 1);
  };

window.cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id) {
    clearTimeout(id);
  };


const idleCallbacks = {};
let lastAction1 = 0;
let lastAction2 = 0;
function lazy(id, cbk) {
  if (idleCallbacks[id]) {
    cancelIdleCallback(idleCallbacks[id]);
  }

  // allow some instant actions, if at least 1 sec apart
  // may be bad...
  var now = new Date().getTime();
  var thres = now - 1000;
  if (lastAction1 < thres) {
    cbk();
    lastAction1 = now;
    return;
  }
  if (lastAction2 < thres) {
    cbk();
    lastAction2 = now;
    return;
  }
  idleCallbacks[id] = requestIdleCallback(({didTimeout}) => {
    console.log('idleCallback', id);
    if (didTimeout) return;
    cbk();
  });
}

function rand_int(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function rand_color() {
  let h = rand_int(1, 360);
  while (
    (50 <= h && h <= 70) ||
    (190 <= h && h <= 210)) { // yellow / blue
      h = rand_int(1, 360);
  }
  let s = rand_int(40, 40);
  let l = rand_int(60, 80);
  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

export { hasShape, toArr, lazy, rand_int, rand_color };
