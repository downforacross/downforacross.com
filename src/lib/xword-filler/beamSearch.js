import CandidateGrid from './candidateGrid';
import { getTopMatches } from './common';
import _ from 'lodash';

const BEAM_SEARCH_PARAMS = {
  K: 100,
  C: 3,
};


const isCandidateComplete = (candidate) => {
  return candidate.isComplete();
};

const getChildrenCandidates = (candidate, scoredWordlist) => {
  const entries = candidate.entries;
  const sortedEntries = _.orderBy(entries.map(entry => ({
    entry,
    score: candidate.computeEntryHeuristic(entry, scoredWordlist),
  })), ['score'], ['desc']);
  console.log(sortedEntries);
  const { entry } = sortedEntries[0];
  const pattern = candidate.getPattern(entry);
  const matches = getTopMatches(pattern, scoredWordlist, BEAM_SEARCH_PARAMS.C);
  return matches.map(word => {
    return candidate.setEntry(entry, word);
  });
}

const takeBestCandidates = (candidates, scoredWordlist) => {
  const sortedCandidates = _.orderBy(candidates.map(candidate => ({
    candidate,
    score: candidate.computeHeuristic(scoredWordlist),
  })), ['score'], ['desc']);
  console.log(sortedCandidates);
  return sortedCandidates.map(({ candidate, score }) => candidate);
}

export default (initialState, scoredWordlist) => {
  // generate candidates using beam search
  let candidates = [initialState];
  let bestCandidate = initialState;
  const NUM_STEPS = 10; // make this big
  for (let step = 0; step < NUM_STEPS; step += 1) {
    console.log('step', step);
    console.log('candidates', candidates);
    const nextCandidates = _.flatten(candidates.map(candidate => {
      if (isCandidateComplete(candidate)) {
        return [candidate];
      }
      const children = getChildrenCandidates(candidate, scoredWordlist);
      console.log(children);
      return children;
    }));
    console.log('next', nextCandidates);
    candidates = takeBestCandidates(nextCandidates, scoredWordlist);
  }
    /*
  entries.across.forEach((entry) => {
    const pattern = candidate.getPattern(entry);
    const matches = getMatches(pattern, scoredWordlist);
    if (matches.length > 0) {
      const nextCandidate = candidate.setEntry(entry, matches[0]);
      bestCandidate = nextCandidate;
    }
  });
  */

  return bestCandidate;
}
