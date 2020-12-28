import EventEmitter from 'events';
import {db} from './firebase';

const DEFAULT_PAGE_SIZE = 40;
export default class Puzzlelist extends EventEmitter {
  constructor(pageSize = DEFAULT_PAGE_SIZE) {
    super();
    this.ref = db.ref('/puzzlelist');
    this.pageSize = pageSize;
  }

  getPages(pages, cbk) {
    pages = Math.min(pages, 50);
    return this.ref
      .orderByKey()
      .limitToLast(pages * this.pageSize)
      .once('value', (snapshot) => {
        cbk(Object.assign([], snapshot.val()));
      });
  }
}
