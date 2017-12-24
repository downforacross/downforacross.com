/*
Desired structure:
user[uid].history[gid]: {
  pid,
  time,
  solved,
  progress,
}

Current structure: user[uid].history[gid]: time
*/

import { db, disconnect } from '../src/actions'

function go(pidMap) {
  let first = true;
  let a = 0, b = 0;
  // db.ref(`user`).once('value', _users => {
  // let users = _users.val();
  db.ref(`user`).transaction(users => {
    if (!users) return users;
    Object.keys(users).forEach(uid => {
      if (!users[uid].history) return;
      Object.keys(users[uid].history).forEach(gid => {
        if (gid === 'solo') {
          a += 1;
          // im an idiot, again
          if (users[uid].history.solo.time) {
            users[uid].history.solo = users[uid].history.solo.time;
          }
          Object.keys(users[uid].history.solo[uid]).forEach(pid => {
            let time = users[uid].history.solo[uid][pid];
            if (time.time) time = time.time;

            users[uid].history.solo[uid][pid] = {
              time: time,
              pid: pid,
            };
          })
          return;
        }
        b += 1;
        let time = users[uid].history[gid];
        let pid = pidMap[gid];
        if (!pid) {
          console.log('missing pid', gid);
          pid = null;
        }
        if (users[uid].history[gid].pid) {
          console.log('already have pid', gid);
          pid = users[uid].history[gid].pid;
        }
        if (time.time) time = time.time;
        // im an idiot, so this might happen lol
        if (time.time) time = time.time;

        users[uid].history[gid] = {
          time: time,
          pid: pid,
        };
      });
    });
    return users;
  }, () => {
    console.log('done', a, b);
  });
}

async function makePidMap() {
  console.log('making pid map');
  let pidMap = {};
  let promises = [];
  for (let gid = 1729; gid < 2730; gid += 1) {
  // for (let gid = 1729; gid < 1735; gid += 1) {
    promises.push(db.ref(`game/${gid}/pid`).once('value', _pid => {
      let pid = _pid.val();
      pidMap[gid] = pid;
    }));
  }

  await Promise.all(promises);

  return pidMap;
};

makePidMap().then(pidMap => {
  console.log('pidMap:', pidMap);
  go(pidMap);
});
