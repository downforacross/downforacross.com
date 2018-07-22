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

  for(let gid = 10000; true; gid += 1) {
    const game = await db.ref(`/game/${gid}`).once('value');
    console.log(game);
    break;
  }

}

go();
