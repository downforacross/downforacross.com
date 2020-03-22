import EventEmitter from 'events';
import firebase, {db, SERVER_TIME, getTime} from './firebase';
import getLocalId from '../localAuth';
import {rand_color} from '../lib/jsUtils';

export default class User extends EventEmitter {
  constructor() {
    super();
    this.auth = firebase.auth();
    this.attached = false;
    this.color = rand_color();
  }

  attach() {
    this.auth.onAuthStateChanged((user) => {
      this.attached = true;
      this.fb = user;
      this.emit('auth');
      console.log('Your id is', this.id);
    });
  }

  logIn() {
    const provider = new firebase.auth.FacebookAuthProvider();
    this.auth.signInWithPopup(provider);
  }

  get ref() {
    return db.ref(`user/${this.id}`);
  }

  offAuth(cbk) {
    this.removeListener('auth', cbk);
  }

  onAuth(cbk) {
    this.addListener('auth', cbk);
    if (this.attached) {
      cbk();
    }
  }

  // read methods
  get id() {
    if (!this.attached) {
      return undefined;
    }
    if (this.fb) {
      return this.fb.uid;
    }
    return getLocalId();
  }

  listUserHistory() {
    return this.ref
      .child('history')
      .once('value')
      .then((snapshot) => snapshot.val());
  }

  listCompositions() {
    return this.ref
      .child('compositions')
      .once('value')
      .then((snapshot) => snapshot.val());
  }

  // write methods
  joinComposition(cid, {title, author, published = false}) {
    // safe to call this multiple times
    return this.ref
      .child('compositions')
      .child(cid)
      .set({
        title,
        author,
        published,
        updateTime: SERVER_TIME,
      });
  }

  joinGame(gid, {pid = -1, solved = false, v2 = false}) {
    const time = getTime();
    // safe to call this multiple times
    return this.ref
      .child('history')
      .child(gid)
      .set({
        pid,
        solved,
        // progress: game.progress,
        time,
        v2,
      });
  }

  markSolved(gid) {
    this.ref
      .child('history')
      .child(gid)
      .transaction((item) => {
        if (!item) {
          // don't mark un-joined games as solved
          return null;
        }
        return {
          ...item,
          solved: true,
        };
      });
  }

  recordUsername(username) {
    this.ref
      .child('names')
      .child(username)
      .transaction((count = 0) => count + 1);
  }
}

let globalUser;
export const getUser = () => {
  if (!globalUser) {
    globalUser = new User();
    globalUser.attach();
  }
  return globalUser;
};
