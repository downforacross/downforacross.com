/*
A bunch of games (gid 11449...14460) are empty (all mistakenly created by steven)
They are all created with the same pid (2961)
This backfill resets their pid so they don't show up on /replays/2961

*/

// npx babel-node backfills/deleteGames.js
import {db, disconnect} from '../src/actions';
import _ from 'lodash';

async function go() {
  for (let gid = 11455; gid <= 14460; gid += 1) {
    const pid = (await db.ref(`/game/${gid}/pid`).once('value')).val();
    if (pid === 2961) {
      console.log('clearing', gid);
      await db.ref(`/game/${gid}/pid`).set(-1);
    } else {
      console.log('skipping', gid);
    }
  }
}

go();
