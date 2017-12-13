import { db } from './actions';

const idKey = 'dfac-id';

function genId() {
  return (Math.floor(Math.random() * 1000000000)).toString(16);
}

function genAnonId() {
  return 'anon' + genId();
}

function _getId() {
  if (localStorage) {
    if (localStorage.getItem(idKey)) {
      return localStorage.getItem(idKey);
    } else {
      const id = genId();
      localStorage.setItem(idKey, id);
      return id;
    }
  } else {
    console.log('local storage not detected , unable to assign dfac-id');
    return genAnonId();
  }
}

let cachedId = null;
function getId() {
  if (cachedId) return cachedId;
  cachedId = _getId();
  return cachedId;
}

function recordUsername(username) {
  console.log('recordUsername', username);
  const id = getId();
  db.ref(`user/${id}/names/${username}`).transaction((count = 0) => count + 1);
}

console.log('your dfac-id is:', getId());
export { getId, recordUsername };
