import { db } from './actions';

import getLocalId from './localAuth';
import firebase from 'firebase';

let fbuser = null;
let fbid = null;

function recordUsername(username) {
  console.log('recordUsername', username);
  const id = getId();
  db.ref(`user/${id}/names/${username}`).transaction((count = 0) => count + 1);
}

function signUp() {
  // 
}

var provider = new firebase.auth.FacebookAuthProvider();


firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    fbuser = user;
    fbid = fbuser.uid;
    console.log('auth changed', user);
    // User is signed in.
  } else {
    // No user is signed in.
  }
});

function logIn(cbk) {
  // copied from https://firebase.google.com/docs/auth/web/facebook-login
  firebase.auth().signInWithPopup(provider).then(function(result) {
    console.log('authed');
    cbk();
    // success.
    // handled in authstatechanged
  }).catch(function(error) {
    console.log('error logging in');
    // var errorCode = error.code;
    // var errorMessage = error.message;
    // var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    // var credential = error.credential;
  });
}

function logOut() {
}

function loggedIn() {
  return fbid !== null;
}

function getFacebookId() {
  return fbid;
}

let cachedId = null;
function getId() {
  if (cachedId) return cachedId;
  cachedId = getFacebookId();
  if (!cachedId) {
    cachedId = getLocalId();
  }
  return cachedId;
}

function getUser() {
  return fbuser;
}

console.log('your dfac-id is:', getId());

export { getId, getUser, recordUsername, logIn, loggedIn, logOut };
