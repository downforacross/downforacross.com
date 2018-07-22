/*
Desired structure:
game[gid] {
  pid,
  events: {
    ...events
  },
}

Current structure:
game[gid] {
  ...events
}

*/

// npx babel-node backfills/v2pid.js
import { db, disconnect } from '../src/actions'

async function go() {

  for(let gid = 10400; gid < 10980; gid += 1) {
    const pid = (await db.ref(`/game/${gid}/pid`).once('value')).val();
    console.log(gid, pid);
    if (!pid) {
      console.log('migrating', gid);
      const game = (await db.ref(`/game/${gid}`).once('value')).val();
      await db.ref(`/game/${gid}`).set({
        pid,
        events: {
          ...game,
        }
      });
    }
  }
  process.exit(0);

}

go();
