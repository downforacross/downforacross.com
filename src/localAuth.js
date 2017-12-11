import nameGenerator from './nameGenerator';
import { db } from './actions';

const idKey = 'dfac-id';
const usernameKey = 'dfac-username';

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

function getUsername() {
  if (localStorage) {
    const result = localStorage.getItem(usernameKey);
    if (!result) {
      const username = nameGenerator();
      localStorage.setItem(usernameKey, username);
      return username;
    } else {
      return result;
    }
  } else {
    return nameGenerator();
  }
}

function setUsername(username) {
  if (localStorage) {
    localStorage.setItem(usernameKey, username);
  }
  const id = getId();
  db.ref(`user/${id}/name`).set(username);
}

console.log('your dfac-id is:', getId());
console.log('your dfac-username is:', getUsername());
export { getId, getUsername, setUsername };
