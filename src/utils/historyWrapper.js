import { reduce } from '../utils/GameOperations';
import _ from 'lodash';

const MEMO_RATE = 50;

export default class HistoryWrapper {
  constructor(history = []) {
    this.history = history;
    this.memo = [];
    this.initializeMemo();
  }

  initializeMemo() {
    this.memo = [{
      index: -1,
      game: null,
    }];
    let game = null;
    this.history.forEach((event, i) => {
      game = reduce(game, event);
      const index = i;
      if (index % MEMO_RATE === 0) {
        this.memo.push({
          index,
          game,
        })
      }
    });
  }

  // returns result of [0, index]
  getSnapshotAtIndex(index) {
    const _i = _.sortedLastIndexBy(
      this.memo,
      {index},
      memoItem => memoItem.index
    );
    const memoItem = this.memo[_i - 1];
    let game = memoItem.game;
    for (let i = memoItem.index + 1; i <= index; i += 1) {
      const event = this.history[i];
      game = reduce(game, event);
    }
    return game;
  }

  getSnapshotAt(timestamp) {
    let game = null;
    // compute the number of events that have happened
    const index = _.sortedLastIndexBy(
      this.history,
      {timestamp},
      event => event.timestamp
    );
    if (index <= 0) return null;
    return this.getSnapshotAtIndex(index - 1);
  }

  // the current snapshot
  getSnapshot() {
    return this.getSnapshotAtIndex(this.history.length - 1);
  }

  addEvent(event) {
    this.history.push(event);
  }
}
