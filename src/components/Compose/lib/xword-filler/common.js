import _ from 'lodash';

// word lists are ~100k words.
// in a single execution of "fillGrid", we might call scoreMatches / countMatches 30k times

// bucketing by length of word
// => 30k words per bucket
// bucket by i-th char for each i
// => 5k words per bucket

// returns all matches for pattern
// getMatches(' A  E') = [
//   "HASTE",
//   "PASTE",
//   "LATHE"
// ]

class BucketedWordlist {
  constructor(scoredWordlist) {
    this.makeBuckets(scoredWordlist); // this grows to size 28889
    this.cache = {}; // this grows to size 7142
    window.b = this;
  }

  getKey(length, indices, vals) {
    return `${length}${indices.join('')}${vals.join('')}`;
  }

  storeWordInBucket(word, indices) {
    const key = this.getKey(
      word.length,
      indices,
      _.map(indices, (idx) => word[idx])
    );
    if (!this.buckets[key]) {
      this.buckets[key] = [];
    }
    this.buckets[key].push(word);
  }

  makeBuckets(scoredWordlist) {
    this.buckets = {};
    const words = _.sortBy(_.keys(scoredWordlist), (word) => -scoredWordlist[word]);
    _.forEach(words, (word) => {
      this.storeWordInBucket(word, []);
    });
    _.forEach(_.keys(scoredWordlist), (word) => {
      const {length} = word;
      for (let i = 0; i < length; i += 1) {
        this.storeWordInBucket(word, [i]);
        for (let j = i; j < length; j += 1) {
          // inlining for speed
          const key = length.toString() + i.toString() + j.toString() + word[i] + word[j];
          if (!this.buckets[key]) this.buckets[key] = [];
          this.buckets[key].push(word);
        }
      }
    });
  }

  getBucket(length, {indices = [], vals = []} = {}) {
    const key = this.getKey(length, indices, vals);
    return this.buckets[key] || [];
  }

  _getMatches(pattern, limit) {
    const {length} = pattern;
    // get list of indices that are constrained
    const constraints = _.filter(_.range(length), (idx) => pattern[idx] !== ' ');
    const indices = constraints.slice(0, 2);
    const bucket = this.getBucket(length, {
      indices,
      vals: _.map(indices, (idx) => pattern[idx]),
    });
    const result = [];
    for (const word of bucket) {
      if (_.every(constraints, (idx) => word[idx] === pattern[idx])) {
        result.push(word);
      }
      if (limit !== -1 && result.length >= limit) {
        break;
      }
    }
    return result;
  }

  getMatches(pattern, limit = -1) {
    const cacheKey = `${pattern} ${limit}`;
    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] = this._getMatches(pattern, limit);
    }
    return this.cache[cacheKey];
  }
}

const cache = new Map();
const getBucketedWordlist = (scoredWordlist) => {
  if (!cache.get(scoredWordlist)) {
    cache.set(scoredWordlist, new BucketedWordlist(scoredWordlist));
  }
  return cache.get(scoredWordlist);
};

export const getMatches = (pattern, scoredWordlist) => {
  const bucketedWordlist = getBucketedWordlist(scoredWordlist);
  return bucketedWordlist.getMatches(pattern);
};

export const getTopMatches = (pattern, scoredWordlist, C) => {
  const bucketedWordlist = getBucketedWordlist(scoredWordlist);
  return bucketedWordlist.getMatches(pattern, C);
};

export const scoreMatches = () => {};

export const countMatches = (pattern, scoredWordlist) => {
  const bucketedWordlist = getBucketedWordlist(scoredWordlist);
  return bucketedWordlist.getMatches(pattern).length;
};
