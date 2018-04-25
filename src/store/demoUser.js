import getLocalId from '../localAuth';
import EventEmitter from 'events';
import { rand_color } from '../jsUtils';

export default class DemoUser extends EventEmitter {
  constructor(fb) {
    super();
    this.fb = fb;
    this.attached = false;
  }

  attach() {
    setTimeout(() => {
      this.attached = true;
      this.emit('auth');
    }, 0);
  }

  detach() {
  }

  logIn() {
    this.fb = {
      id: 'demo-fb-id',
    };
    this.emit('auth');
  }

  get id() {
    if (!this.attached) {
      return undefined;
    }
    if (this.fb) {
      return this.fb.id;
    }
    return getLocalId();
  }

  get color() {
    return rand_color();
  }

  onAuth(cbk) {
    this.addListener('auth', cbk);
    if (this.attached) {
      cbk();
    }
  }

  joinGame(gid, game) {
  }

  markSolved(gid) {
  }

  recordUsername(username) {
  }


}
