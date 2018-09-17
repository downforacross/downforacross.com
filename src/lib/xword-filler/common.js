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
  }

  makeBuckets(scoredWordlist) {
    this.bigBuckets = [];
    this.buckets = [];
    _.forEach(_.keys(scoredWordlist), word => {
      const length = word.length;
      _.range(length).forEach(idx => {
        const val = word[idx];
        this.buckets[length] = this.buckets[length] || []
        this.buckets[length][idx] = this.buckets[length][idx] || {}
        this.buckets[length][idx][val] = this.buckets[length][idx][val] || []
        const bucket = this.buckets[length][idx][val];
        bucket.push(word);
      });
      this.bigBuckets[length] = this.bigBuckets[length] || []
      const bigBucket = this.bigBuckets[length];
      bigBucket.push(word);
    });
    this.bigBuckets = _.forEach(this.bigBuckets, (bucket, i) => (
      this.bigBuckets[i] = _.sortBy(bucket, word => (
        -scoredWordlist[word]
      ))
    ));
    _.forEach(this.buckets, a => _.forEach(a, b => {
      _.forEach(_.keys(b), val => (
        b[val] = _.sortBy(b[val], word => (
          -scoredWordlist[word]
        ))
      ))
    }));
  }

  getBucket(length, {
    idx = -1,
    val = null,
  } = {}) {
    // if idx === -1, then return all words with length=length
    // otherwise, also ensure word[idx] === val
    if (idx === -1) {
      return this.bigBuckets[length] || []
    }
    return ((this.buckets[length] || [])[idx] || [])[val] || []
  }

  // TODO memoize this function
  getMatches(pattern, limit=-1) {
    console.log('getMatches', pattern, limit);
    const length = pattern.length;
    // get list of indices that are constrained
    const constraints = _.filter(
      _.range(length), idx => (
        pattern[idx] !== ' '
      )
    );
    // check if pattern is all spaces
    if (constraints.length === 0) {
      if (limit === -1) {
        return this.getBucket(length);
      }
      return this.getBucket(length).slice(0, limit);

    }
    const bucket = this.getBucket(length, {
      idx: constraints[0],
      val: pattern[constraints[0]],
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
    console.log('DONE getMatches', result);
    return result;
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

// e.g. sum of top 10 best matches
export const scoreMatches = (pattern, scoredWordlist) => {
}

// e.g. number of matches
export const countMatches = (pattern, scoredWordlist)  =>{
}
