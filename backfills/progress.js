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
// npx babel-node backfills/progress.js
import { db, disconnect } from '../src/actions'

function go(pidMap, solvedMap) {
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
          if (!users[uid].history.solo[uid]) return; // new history format might be a bit weird...
          Object.keys(users[uid].history.solo[uid]).forEach(pid => {
            let time = users[uid].history.solo[uid][pid];
            let solved = solvedMap[gid] || false;
            if (time.time) time = time.time;

            users[uid].history.solo[uid][pid] = {
              time: time,
              solved: solved,
              pid: pid,
            };
          })
          return;
        } else {
          b += 1;
          let time = users[uid].history[gid];
          let pid = pidMap[gid];
          if (!pid) {
            console.log('missing pid', gid);
            pid = null;
          }
          let solved = solvedMap[gid];
          if (!solved) {
            solved = false;
          }
          if (users[uid].history[gid].pid) {
            console.log('already have pid', gid);
            pid = users[uid].history[gid].pid;
          }
          if (users[uid].history[gid].solved) {
            console.log('already have solved', gid);
            solved = users[uid].history[gid].solved;
          }
          if (time.time) time = time.time;
          // im an idiot, so this might happen lol
          if (time.time) time = time.time;

          users[uid].history[gid] = {
            time: time,
            pid: pid,
            solved: solved,
          };
        }
      });
    });
    return users;
  }, () => {
    console.log('done', a, b);
  });
}

async function makePidAndSolvedMap() {
  console.log('making pid map');
  let pidMap = {};
  let solvedMap = {};
  let promises = [];
  for (let gid = 1729; gid < 2861; gid += 1) {
    // for (let gid = 1729; gid < 1735; gid += 1) {
    promises.push(db.ref(`game/${gid}/pid`).once('value', _pid => {
      let pid = _pid.val();
      pidMap[gid] = pid;
    }));
    promises.push(db.ref(`game/${gid}/solved`).once('value', _solved => {
      let solved = _solved.val();
      solvedMap[gid] = solved;
    }));
  }

  // just dl the whole thing
  promises.push(db.ref(`game/solo`).once('value', _solo => {
    let solo = _solo.val();
    Object.keys(solo).forEach(uid => {
      Object.keys(solo[uid]).forEach(pid => {
        let gid = `solo/${uid}/${pid}`;
        solvedMap[gid] = solo[uid][pid].solved;
      });
    });
  }));

  await Promise.all(promises);

  return { pidMap, solvedMap };
};

makePidAndSolvedMap().then(({ pidMap, solvedMap }) => {
  console.log('pidMap:', pidMap, solvedMap);
  go(pidMap, solvedMap);
});
