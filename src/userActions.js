import { db, getTime } from './actions';
import { getId } from './localAuth';

const userActions = {
  joinGame: (gid) => { // safe to call this multiple times
    const id = getId();
    db.ref(`user/${id}/history/${gid}`).set(getTime());
  },

  // cbk(time), where time is undefined if never joined game
  joinedGame: (gid, cbk) => {
    const id = getId();
    db.ref(`user/${id}/history/${gid}`).once(time => {
      if (time) {
        cbk(time);
      }
    });
  },

};

export default userActions;
