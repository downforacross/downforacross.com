import CandidateGrid from './candidateGrid';
import { getTopMatches } from './common';
import _ from 'lodash';

const BEAM_SEARCH_PARAMS = {
  K: 100,
  C: 20,
};


const isCandidateComplete = (candidate) => {
  return candidate.isComplete();
};

const getChildrenCandidates = (candidate, scoredWordlist) => {
  const entries = _.filter(candidate.entries, entry => (
    !candidate.isEntryComplete(entry)
  ));
  const sortedEntries = _.orderBy(entries.map(entry => ({
    entry,
    score: candidate.computeEntryHeuristic(entry, scoredWordlist),
  })), ['score'], ['asc']);
  const { entry } = sortedEntries[0];
  const pattern = candidate.getPattern(entry);
  const matches = getTopMatches(pattern, scoredWordlist, BEAM_SEARCH_PARAMS.C);
  if (!matches) {
    // TODO handle the case where you're screwed
    return [candidate];
  }
  return matches.map(word => {
    return candidate.setEntry(entry, word);
  });
}

const takeBestCandidates = (candidates, scoredWordlist) => {
  const sortedCandidates = _.orderBy(candidates.map(candidate => ({
    candidate,
    score: candidate.computeHeuristic(scoredWordlist),
  })), ['score'], ['desc']);
  return sortedCandidates.map(({ candidate, score }) => candidate).slice(0, BEAM_SEARCH_PARAMS.K);
}

export default (initialState, scoredWordlist) => {
  // generate candidates using beam search
  let candidates = [initialState];
  const NUM_STEPS = 100; // make this big
  for (let step = 0; step < NUM_STEPS; step += 1) {
    console.log('step', step);
    // console.log('candidates', candidates);
    // console.log('scores', _.map(candidates, candidate => candidate.computeHeuristic(scoredWordlist)));
    let done = true;
    const nextCandidates = _.flatten(candidates.map(candidate => {
      if (isCandidateComplete(candidate)) {
        return [candidate];
      }
      done = false;
      const children = getChildrenCandidates(candidate, scoredWordlist);
      return children;
    }));
    if (done) break;
    // console.log('next', nextCandidates);
    candidates = takeBestCandidates(nextCandidates, scoredWordlist);
  }
  const bestCandidate = candidates[0];
  console.log('final candidate', bestCandidate);
  console.log('final candidate score', bestCandidate.computeHeuristic(scoredWordlist));
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
