import { db } from './actions';

import getLocalId from './localAuth';
import firebase from 'firebase';

let fbuser = null;
let fbid = null;
let authStateLoaded = false;

function recordUsername(username) {
  const id = getId();
  db.ref(`user/${id}/names/${username}`).transaction((count = 0) => count + 1);
}

function migrateUserHistory() {
  const localId = getLocalId();
  const id = getFacebookId();
  if (!id) {
    console.log('cannot migrate, not signed in');
    return;
  }
  db.ref(`user/${id}`).once('value', _user => {
    let user = _user.val() || {};
    if (user.migration) {
      // console.log('user already has history, skipping migration');
      return;
    }
    db.ref(`user/${localId}/history`).transaction(history => {
      if (!history) return history; // don't migrate empty guy
      if (history.migrated) {
        console.log('this browser\'s history has already been migrated');
        return history;
      }
      let date = new Date();
      let newUserVal = {
        migration: { date, localId },
        history: history,
      };
      db.ref(`user/${id}`).set(newUserVal).then(() => {
        fireLoginCallbacks();
      });
      return {
        ...history,
        migrated: true,
      };
    });
  });

}

var provider = new firebase.auth.FacebookAuthProvider();

var authLoaded = false;

firebase.auth().onAuthStateChanged(function(user) {
  authLoaded = true;
  authStateLoaded = true;
  if (user) {
    fbuser = user;
    fbid = fbuser.uid;
    console.log('your dfac-id is', fbid);
    // User is signed in.
    migrateUserHistory();
  } else {
    // No user is signed in.
  }
});

function logIn(cbk) {
  // copied from https://firebase.google.com/docs/auth/web/facebook-login
  firebase.auth().signInWithPopup(provider).then(function(result) {
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

function getId() {
  return getFacebookId() || getLocalId();
}

function getUser() {
  return fbuser;
}

let loginCbks = [];
function registerLoginListener(cbk) {
  if (authLoaded) {
    cbk();
  } else {
    loginCbks.push(cbk);
  }
}

function fireLoginCallbacks() {
  loginCbks.forEach(cbk => {
    cbk();
  });
}

firebase.auth().onAuthStateChanged(fireLoginCallbacks);

export { getId, getUser, recordUsername, logIn, loggedIn, logOut, registerLoginListener, authStateLoaded };
