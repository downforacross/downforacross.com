import { db, getTime } from './actions';
import { getId } from './auth';

const userActions = {
  joinGame: (gid, game) => { // safe to call this multiple times
    console.log('joinGame');
    const id = getId();
    db.ref(`user/${id}/history/${gid}`).set({
      pid: game.pid,
      solved: game.solved || false,
      // progress: game.progress,
      time: getTime(),
    });
  },
};

export default userActions;
