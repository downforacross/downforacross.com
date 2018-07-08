import { reduce } from '../utils/GameOperations';
import _ from 'lodash';

const MEMO_RATE = 10;

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

    _.range(this.history.length).forEach(index => {
      this.memoize(index);
    });
  }

  memoize(index) {
    if (index <= _.last(this.memo).index) {
      console.error('tried to memoize out of order');
      return;
    }
    const game = this.getSnapshotAtIndex(index);
    this.memo.push({
      game,
      index,
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

  // the current snapshot
  getSnapshot() {
    return this.getSnapshotAtIndex(this.history.length - 1);
  }

  // this is used for replay
  getSnapshotAt(timestamp) {
    // compute the number of events that have happened
    const index = _.sortedLastIndexBy(
      this.history,
      {timestamp},
      event => event.timestamp
    );
    if (index <= 0) return null;
    return this.getSnapshotAtIndex(index - 1);
  }

  addEvent(event) {
    // we must support retroactive updates to the event log
    const insertPoint =  _.sortedLastIndexBy(
      this.history,
      event,
      event => event.timestamp,
    );
    this.history.splice(insertPoint, 0, event);
    while (_.last(this.memo).index >= insertPoint) {
      this.memo.pop();
    }
    _.range(0, this.history.length, MEMO_RATE).forEach(index => {
      if (index > _.last(this.memo).index) {
        this.memoize(index);
      }
    });
  }
}
