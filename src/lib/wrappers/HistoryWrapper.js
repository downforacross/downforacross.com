import _ from 'lodash';
import {reduce as gameReducer} from '../reducers/game';

const MEMO_RATE = 10;

export default class HistoryWrapper {
  constructor(history = [], reducer = gameReducer) {
    window.historyWrapper = this;
    this.reducer = reducer;
    this.history = [];
    this.optimisticEvents = [];
    this.memo = [];
    this.createEvent = null;
    history.forEach((event) => {
      if (event.type === 'create') {
        this.setCreateEvent(event);
      } else {
        this.addEvent(event);
      }
    });
  }

  get reduce() {
    return this.reducer;
  }

  get ready() {
    return !!this.createEvent;
  }

  initializeMemo() {
    if (!this.createEvent) {
      return;
    }
    this.memo = [
      {
        index: -1,
        game: this.reduce(null, this.createEvent),
      },
    ];

    _.range(this.history.length).forEach((index) => {
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
  getSnapshotAtIndex(index, {optimistic = false} = {}) {
    const _i = _.sortedLastIndexBy(this.memo, {index}, (memoItem) => memoItem.index);
    const memoItem = this.memo[_i - 1];
    let {game} = memoItem;
    for (let i = memoItem.index + 1; i <= index; i += 1) {
      const event = this.history[i];
      game = this.reduce(game, event);
    }
    if (optimistic) {
      for (const event of this.optimisticEvents) {
        game = this.reduce(game, event, {
          isOptimistic: true,
        });
      }
    }

    return game;
  }

  // the current snapshot
  getSnapshot() {
    return this.getSnapshotAtIndex(this.history.length - 1, {optimistic: true});
  }

  // this is used for replay
  getSnapshotAt(gameTimestamp) {
    // compute the number of events that have happened
    const index = _.sortedLastIndexBy(this.history, {gameTimestamp}, (event) => event.gameTimestamp);
    return this.getSnapshotAtIndex(index - 1);
  }

  setCreateEvent(event) {
    this.createEvent = event;
    event.gameTimestamp = 0;
    this.initializeMemo();
  }

  addEvent(event) {
    window.timeStampOffset = event.timestamp - Date.now();
    this.optimisticEvents = this.optimisticEvents.filter((ev) => ev.id !== event.id);
    // we must support retroactive updates to the event log
    const insertPoint = _.sortedLastIndexBy(this.history, event, (event) => event.timestamp);
    this.history.splice(insertPoint, 0, event);
    if (!this.createEvent) {
      return;
    }
    while (_.last(this.memo).index >= insertPoint) {
      this.memo.pop();
    }
    _.range(0, this.history.length, MEMO_RATE).forEach((index) => {
      if (index > _.last(this.memo).index) {
        this.memoize(index);
      }
    });
    const snapshot = this.getSnapshotAtIndex(insertPoint);
    if (snapshot.clock) {
      event.gameTimestamp = snapshot.clock.trueTotalTime;
    }
  }

  addOptimisticEvent(event) {
    event = {
      ...event,
      timestamp: (_.last(this.history)?.timestamp ?? 0) + this.optimisticEvents.length + 1000,
    };
    setTimeout(() => {
      if (this.optimisticEvents.includes(event)) {
        console.log('Detected websocket drop, reconnecting...');
        this.optimisticEvents = [];
        alert('disconnected, please refresh');
        window.socket.close();
        window.socket.open();
      }
    }, 5000);
    this.optimisticEvents.push(event);
  }

  clearOptimisticEvents() {
    this.optimisticEvents = [];
  }
}
