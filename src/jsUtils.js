function toArr(a) {
  if (Array.isArray(a)) return a;
  const ret = [];
  Object.keys(a).forEach(i => {
    ret[i] = a[i];
  });
  return ret;
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
function lazy(id, cbk) {
  if (idleCallbacks[id]) {
    cancelIdleCallback(idleCallbacks[id]);
  }
  idleCallbacks[id] = requestIdleCallback(({didTimeout}) => {if (didTimeout) return; cbk();});

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

export { toArr, lazy, rand_int, rand_color };
