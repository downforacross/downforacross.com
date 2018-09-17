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
    this.makeBuckets(scoredWordlist)
    this.cache = {};
  }

  getKey(length, indices, vals) {
    return `${length}${indices.join('')}${vals.join('')}`
  }

  storeWordInBucket(word, indices) {
    const key = indices.length === 2
      ? word.length.toString() + indices[0].toString() + indices[1].toString() + word[indices[0]] + word[indices[1]]
      : this.getKey(word.length, indices, _.map(indices, idx => word[idx]));
    if (!this.buckets[key]) {
      this.buckets[key] = [];
    }
    this.buckets[key].push(word);
  }

  makeBuckets(scoredWordlist) {
    console.log('make buckets', scoredWordlist.length);
    const time1 = Date.now();
    this.buckets = {};
    const words = _.sortBy(_.keys(scoredWordlist), word => -scoredWordlist[word]);
    _.forEach(_.keys(scoredWordlist), word => {
      const length = word.length;
      this.storeWordInBucket(word, []);
    });
    _.forEach(_.keys(scoredWordlist), word => {
      const length = word.length;
      _.range(length).forEach(i => {
        this.storeWordInBucket(word, [i]);
        _.range(i, length).forEach(j => {
          this.storeWordInBucket(word, [i, j]);
        });
      });
    });
    const time2 = Date.now();
    console.log('done in', (time2 - time1) / 1000);
  }

  getBucket(length, {
    indices = [],
    vals = [],
  } = {}) {
    const key = this.getKey(length, indices, vals);
    return (this.buckets[key] || []);
  }

  _getMatches(pattern, limit) {
    const length = pattern.length;
    // get list of indices that are constrained
    const constraints = _.filter(
      _.range(length), idx => (
        pattern[idx] !== ' '
      )
    );
    const indices = constraints.slice(0, 2);
    const bucket = this.getBucket(length, {
      indices: indices,
      vals: _.map(indices, idx => pattern[idx]),
    });
    const result = [];
    for (let word of bucket) {
      if (_.every(constraints, idx => (
        word[idx] === pattern[idx]
      ))) {
        result.push(word);
      }
      if (limit !== -1 && result.length >= limit) {
        break;
      }
    }
    return result;
  }

  getMatches(pattern, limit=-1) {
    const cacheKey = `${pattern} ${limit}`
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
}

export const getMatches = (pattern, scoredWordlist) => {
  const bucketedWordlist = getBucketedWordlist(scoredWordlist);
  return bucketedWordlist.getMatches(pattern);
}

export const getTopMatches = (pattern, scoredWordlist, C) => {
  const bucketedWordlist = getBucketedWordlist(scoredWordlist);
  return bucketedWordlist.getMatches(pattern, C);
}

export const scoreMatches = (pattern, scoredWordlist) => {
}

export const countMatches = (pattern, scoredWordlist) => {
  const bucketedWordlist = getBucketedWordlist(scoredWordlist);
  return bucketedWordlist.getMatches(pattern).length;
}
