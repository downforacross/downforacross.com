import CandidateGrid from './candidateGrid';
import { getTopMatches } from './common';
import _ from 'lodash';

const BEAM_SEARCH_PARAMS = {
  K: 300,
  C: 20,
};


const isCandidateComplete = (candidate) => {
  return candidate.isComplete();
};

const getChildrenCandidates = (candidate, scoredWordlist) => {
  const cells = _.range(candidate.width * candidate.height).filter(cell => (
    !candidate.isCellComplete(cell)
  ));
  const sortedCells = _.orderBy(cells.map(cell => ({
    cell,
    score: candidate.computeCellHeuristic(cell, scoredWordlist),
  })), ['score'], ['asc']);
  const { cell } = sortedCells[0];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  return letters.map(letter => {
    return candidate.setCell(cell, letter);
  });
}

const takeBestCandidates = (candidates, scoredWordlist, K = BEAM_SEARCH_PARAMS.K) => {
  const sortedCandidates = _.orderBy(candidates.map(candidate => ({
    candidate,
    score: candidate.computeHeuristic(scoredWordlist),
  })), ['score'], ['desc']);
  return sortedCandidates.map(({ candidate, score }) => candidate).slice(0, K);
}

export default (initialState, scoredWordlist) => {
  // generate candidates using beam search
  let candidates = [initialState];
  const NUM_STEPS = 100; // make this big
  let bestCandidate;
  for (let step = 0; step < NUM_STEPS; step += 1) {
    if (!candidates.length) break;
    bestCandidate = candidates[0];
    console.log('step', step, bestCandidate.computeHeuristic(scoredWordlist, true));
    console.log(bestCandidate.gridString.join(''));
    const cells = _.range(bestCandidate.width * bestCandidate.height).filter(cell => (
      !bestCandidate.isCellComplete(cell)
    ));
    const sortedCells = _.orderBy(cells.map(cell => ({
      cell,
      score: bestCandidate.computeCellHeuristic(cell, scoredWordlist),
    })), ['score'], ['asc']);
    console.log(sortedCells[0]);
    console.log(bestCandidate);
    // console.log('candidates', candidates);
    // console.log('scores', _.map(candidates, candidate => candidate.computeHeuristic(scoredWordlist)));
    let done = true;
    const nextCandidates = _.flatten(candidates.map(candidate => {
      if (isCandidateComplete(candidate)) {
        return [candidate];
      }
      done = false;
      const children = takeBestCandidates(getChildrenCandidates(candidate, scoredWordlist), scoredWordlist, BEAM_SEARCH_PARAMS.C);
      return children;
    }));
    if (done) break;
    // console.log('next', nextCandidates);
    candidates = takeBestCandidates(nextCandidates, scoredWordlist, BEAM_SEARCH_PARAMS.K);
  }
  console.log('candidates', candidates);
  const scores = _.map(candidates, candidate => candidate.computeHeuristic(scoredWordlist));
  console.log('scores');
  console.log(scores.filter(score=>score>0).length, 'good candidates');
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
