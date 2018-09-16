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
        this.buckets[length][idx] = this.buckets[length][idx] || []
        this.buckets[length][idx][val] = this.buckets[length][idx][val] || []
        const bucket = this.buckets[length][idx][val];
        bucket.push(word);
      });
      this.bigBuckets[length] = this.bigBuckets[length] || []
      const bigBucket = this.bigBuckets[length];
      bigBucket.push(word);
    });
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
  getMatches(pattern) {
    console.log('getMatches', pattern);
    const length = pattern.length;
    // get list of indices that are constrained
    const constraints = _.filter(
      _.range(length), idx => (
        pattern[idx] !== ' '
      )
    );
    // check if pattern is all spaces
    if (constraints.length === 0) {
      return this.getBucket(length)
    }
    const bucket = this.getBucket(length, {
      idx: constraints[0],
      val: pattern[constraints[0]],
    });
    const result = _.filter(bucket, word => (
      _.every(constraints, idx => (
        word[idx] === pattern[idx]
      ))
    ));
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

// e.g. sum of top 10 best matches
export const scoreMatches = (pattern, scoredWordlist) => {
}

// e.g. number of matches
export const countMatches = (pattern, scoredWordlist)  =>{
}
