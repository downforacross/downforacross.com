import { db, getTime } from './actions';
import { getId } from './auth';

const userActions = {
  joinGame: (gid, game) => { // safe to call this multiple times
    const id = getId();
    db.ref(`user/${id}/history/${gid}`).set({
      pid: game.pid,
      solved: game.solved || false,
      // progress: game.progress,
      time: getTime(),
    });
  },
  markSolved: (gid) => {
    const id = getId();
    db.ref(`user/${id}/history/${gid}`).transaction(item => {
      if (!item) return null;
      return {
        ...item,
        solved: true,
      }
    });
  },
};

export default userActions;
