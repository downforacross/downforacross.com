const meKey = 'dfac-id';

function genId() {
  return (Math.floor(Math.random() * 1000000000)).toString(16);
}

function me() {
  if (localStorage) {
    if (localStorage.getItem(meKey)) {
      return localStorage.getItem(meKey);
    } else {
      const id = genId();
      localStorage.setItem(meKey, id);
      return id;
    }
  } else {
    return 'public';
  }
}

console.log('your dfac-id is:', me());
export default me;
