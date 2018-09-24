import {db} from './firebase';
import EventEmitter from 'events';

const DEFAULT_PAGE_SIZE = 40;
export default class Puzzlelist extends EventEmitter {
  constructor(pageSize = DEFAULT_PAGE_SIZE) {
    super();
    this.ref = db.ref('/puzzlelist');
    this.pageSize = pageSize;
  }

  getPages(pages, cbk) {
    return this.ref
      .orderByKey()
      .limitToLast(pages * this.pageSize)
      .once('value', (snapshot) => {
        cbk(Object.assign([], snapshot.val()));
      });
  }
}
