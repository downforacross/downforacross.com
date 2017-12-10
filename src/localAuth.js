const meKey = 'dfac-id';

function genId() {
  return (Math.floor(Math.random() * 1000000000)).toString(16);
}

function getId() {
  if (localStorage) {
    if (localStorage.getItem(meKey)) {
      return localStorage.getItem(meKey);
    } else {
      const id = genId();
      localStorage.setItem(meKey, id);
      return id;
    }
  } else {
    console.log('local storage not detected , unable to assign dfac-id');
    return genId();
  }
}

let result = null;
function me() {
  if (result) return result;
  result = getId();
  return result;
}

console.log('your dfac-id is:', me());
export default me;
