/* eslint no-plusplus : "warn", no-continue: "off", no-bitwise: "warn" */
const nyt_words_long = window.nyt_words_long || [];

const reverseIndex = {};

function apply(mask, word) {
  let result = '';
  for (let i = 0; i < word.length; i += 1) {
    if ((mask >> i) & 1) {
      result += word[i];
    } else {
      result += '.';
    }
  }
  return result;
}

function getMasks(length) {
  const res = [];
  for (let i = 0; i < 1 << length; i += 1) {
    res.push(i);
  }
  return res;
}

function distinct(lst) {
  const res = [];
  lst.sort();
  lst.forEach((word) => {
    if (res[res.length - 1] !== word) {
      res.push(word);
    }
  });
  return res;
}

const precomputed = {};
function precompute(len, complete_cbk) {
  if (precomputed[len]) {
    complete_cbk();
    return;
  }
  let all_words = nyt_words_long;
  all_words.sort();
  all_words = distinct(all_words);
  all_words = all_words.filter((word) => word.length === len);

  const limit = 100; // don't work too hard
  const processed = {};
  const doWork = (done_cbk, more_cbk) => {
    // call cbk if there's more work to be done
    let cnt = 0;
    for (const word of all_words) {
      if (word in processed) continue;
      const masks = getMasks(word.length);
      masks.forEach((mask) => {
        const pattern = apply(mask, word);
        if (!(pattern in reverseIndex)) {
          reverseIndex[pattern] = [];
        }
        const lst = reverseIndex[pattern];
        if (lst[lst.length - 1] !== word) {
          lst.push(word);
        }
      });

      processed[word] = true;
      cnt += 1;
      if (cnt >= limit) {
        break;
      }
    }
    if (cnt >= limit) {
      more_cbk(); // not done
    } else {
      done_cbk();
    }
  };

  const loop = (cbk) => {
    requestIdleCallback(() => {
      doWork(cbk, () => {
        loop(cbk);
      });
    });
  };

  loop(() => {
    precomputed[len] = true;
    complete_cbk && complete_cbk();
  });
}

function findMatches(pattern, cbk) {
  if (!pattern) cbk([]);
  else if (!precomputed[pattern.length]) {
    precompute(pattern.length, () => {
      findMatches(pattern, cbk);
    });
  } else {
    cbk(reverseIndex[pattern] || []);
  }
}

function getPatterns(grid) {
  const across = [];
  const down = [];
  grid.forEach((row) => {
    row.forEach((cell) => {
      const ch = !cell.value || cell.value === '' ? '.' : cell.value;
      if (!cell.black) {
        if (cell.parents.across) {
          across[cell.parents.across] = (across[cell.parents.across] || '') + ch;
        }
        if (cell.parents.down) {
          down[cell.parents.down] = (down[cell.parents.down] || '') + ch;
        }
      }
    });
  });
  return {across, down};
}

function heuristic(grid) {
  const {across, down} = getPatterns(grid);
  const patterns = across.concat(down);
  let sum = 1;
  patterns.forEach((pattern) => {
    if (pattern in reverseIndex) {
      sum += 1 - 1 / reverseIndex[pattern].length;
    } else {
      sum -= 100;
    }
  });
  return sum;
}

function evaluate(grid, ori, num, word) {
  let pos = 0;
  const ngrid = grid.map((row) =>
    row.map((cell) => ({...cell, value: !cell.black && cell.parents[ori] === num ? word[pos++] : cell.value}))
  );

  const result = heuristic(ngrid);
  return result;
}

export {evaluate, findMatches, getPatterns, precompute};
