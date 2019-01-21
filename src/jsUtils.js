import React from 'react';

function toArr(a) {
  if (Array.isArray(a)) return a;
  const ret = [];
  Object.keys(a).forEach((i) => {
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
    return Object.keys(shape).every((key) => {
      if (obj[key] === undefined) {
        console.log('hasShape key fail', obj, key);
        return false;
      }
      return hasShape(obj[key], shape[key]);
    });
  } else {
    return true;
  }
}

window.requestIdleCallback =
  window.requestIdleCallback ||
  function(cb) {
    var start = Date.now();
    return setTimeout(function() {
      cb({
        didTimeout: false,
        timeRemaining: function() {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, 1);
  };

window.cancelIdleCallback =
  window.cancelIdleCallback ||
  function(id) {
    clearTimeout(id);
  };

const idleCallbacks = {};
function lazy(id, cbk, minWait = 0) {
  if (idleCallbacks[id]) {
    cancelIdleCallback(idleCallbacks[id]);
  }
  let idleCallback = requestIdleCallback(({didTimeout}) => {
    if (didTimeout) return;
    setTimeout(() => {
      if (idleCallbacks[id] === idleCallback) {
        cbk();
      } else {
        // then this was overriden
      }
    }, minWait);
    // ensure the callback happens at least 200 ms after
    // somehow this makes the rendering look less weird
    // ok this whole thing needs to be redone soon cause it's really hacky and still kinda laggy
  });
  idleCallbacks[id] = idleCallback;
}

function rand_int(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function rand_color() {
  let h = rand_int(1, 360);
  while ((50 <= h && h <= 70) || (190 <= h && h <= 210)) {
    // yellow / blue
    h = rand_int(1, 360);
  }
  let s = rand_int(40, 40);
  let l = rand_int(60, 80);
  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
}

function pure(func) {
  class PureComponentWrap extends React.PureComponent {
    render() {
      return func(this.props, this.context);
    }
  }
  return PureComponentWrap;
}

function isAncestor(a, b) {
  if (!b) return false;
  if (a === b) return true;
  return isAncestor(a, b.parentElement);
}

function isMobile() {
  if (navigator.userAgent.match(/Tablet|iPad/i)) {
    // do tablet stuff
    return true;
  } else if (
    navigator.userAgent.match(
      /Mobile|Windows Phone|Lumia|Android|webOS|iPhone|iPod|Blackberry|PlayBook|BB10|Opera Mini|\bCrMo\/|Opera Mobi/i
    )
  ) {
    // do mobile stuff
    return true;
  } else {
    // do desktop stuff
    return false;
  }
}

// from https://jsfiddle.net/koldev/cW7W5/
function downloadBlob(data, fileName) {
  var a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';
  var blob = new Blob([data]),
    url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

export {hasShape, toArr, lazy, rand_int, rand_color, pure, isAncestor, isMobile, downloadBlob};
