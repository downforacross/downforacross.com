import { db } from './firebase';
import EventEmitter from 'events';

const PAGE_SIZE = 4;
export default class Puzzlelist extends EventEmitter {
  constructor() {
    super();
    this.ref = db.ref('/puzzlelist');
  }

  getPages(pages, cbk) {
    return this.ref
      .orderByKey()
      .limitToLast(pages * PAGE_SIZE)
      .once('value', snapshot => {
        cbk(Object.assign([], snapshot.val()));
      });
  }
}
