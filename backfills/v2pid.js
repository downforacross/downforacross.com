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
import {db, disconnect} from '../src/actions';
import _ from 'lodash';

async function go() {
  for (let gid = 10400; gid < 10980; gid += 1) {
    const pid = (await db.ref(`/game/${gid}/pid`).once('value')).val();
    if (!pid) {
      console.log('migrating', gid);
      const game = (await db.ref(`/game/${gid}`).once('value')).val();
      if (!game) continue; // for some reason 10428 is missing
      const events = game.events || game;
      let pid = null;
      const ev = _.values(events);
      if (ev.length && ev[0].params.pid) {
        pid = ev[0].params.pid;
      }
      await db.ref(`/game/${gid}`).set({
        pid,
        events: {
          ...events,
        },
      });
    }
  }
  process.exit(0);
}

go();
