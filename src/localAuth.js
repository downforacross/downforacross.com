const idKey = 'dfac-id';

function genId() {
  return (Math.floor(Math.random() * 1000000000)).toString(16);
}

function genAnonId() {
  return 'anon' + genId();
}

function getLocalId() {
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

export default getLocalId;
