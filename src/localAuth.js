const idKey = 'dfac-id';

function genId() {
  return Math.floor(Math.random() * 1000000000).toString(16);
}

function genAnonId() {
  return `anon${genId()}`;
}

let cachedId = null;
function getLocalId() {
  if (cachedId) return cachedId;
  if (localStorage) {
    if (localStorage.getItem(idKey)) {
      cachedId = localStorage.getItem(idKey);
      return cachedId;
    }
    const id = genId();
    localStorage.setItem(idKey, id);
    cachedId = id;
    return id;
  }
  console.log('local storage not detected , unable to assign dfac-id');
  cachedId = genAnonId();
  return cachedId;
}

export default getLocalId;
