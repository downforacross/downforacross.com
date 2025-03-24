import React from 'react';
import _ from 'lodash';
import leftPad from 'left-pad';

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
  }
  return true;
}

const hexToRgb = (hex) =>
  _.map([hex.substring(1, 3), hex.substring(3, 5), hex.substring(5, 7)], (x) => Number(x, 16));

const rgbToHex = (r, g, b) => {
  const [R, G, B] = _.map([r, g, b], (x) => leftPad(x.toString(16, 2), '0', 2).substring(0, 2));
  return `#${R}${G}${B}`;
};

export function colorAverage(hex1, hex2, weight) {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const r = r1 * (1 - weight) + r2 * weight;
  const g = g1 * (1 - weight) + g2 * weight;
  const b = b1 * (1 - weight) + b2 * weight;
  return rgbToHex(r, g, b);
}

if (typeof window !== 'undefined') {
  window.requestIdleCallback =
    window.requestIdleCallback ||
    function(cb) {
      const start = Date.now();
      return setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining() {
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
}

const idleCallbacks = {};
function lazy(id, cbk, minWait = 0) {
  if (idleCallbacks[id]) {
    cancelIdleCallback(idleCallbacks[id]);
  }
  const idleCallback = requestIdleCallback(({didTimeout}) => {
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
  while ((h >= 50 && h <= 70) || (h >= 190 && h <= 210)) {
    // yellow / blue
    h = rand_int(1, 360);
  }
  const s = rand_int(40, 40);
  const l = rand_int(60, 80);
  return `hsl(${h},${s}%,${l}%)`;
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
  }
  if (
    navigator.userAgent.match(
      /Mobile|Windows Phone|Lumia|Android|webOS|iPhone|iPod|Blackberry|PlayBook|BB10|Opera Mini|\bCrMo\/|Opera Mobi/i
    )
  ) {
    // do mobile stuff
    return true;
  }
  // do desktop stuff
  return false;
}

// from https://jsfiddle.net/koldev/cW7W5/
function downloadBlob(data, fileName) {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';
  const blob = new Blob([data]);
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

export {hasShape, toArr, lazy, rand_int, rand_color, pure, isAncestor, isMobile, downloadBlob};
