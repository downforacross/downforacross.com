import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

let offline = true;
offline = false;

const config = {
  apiKey: 'AIzaSyCe4BWm9kbjXFwlZcmq4x8DvLD3TDoinhA',
  authDomain: 'crosswordsio.firebaseapp.com',
  databaseURL: 'https://crosswordsio.firebaseio.com',
  projectId: 'crosswordsio',
  storageBucket: 'crosswordsio.appspot.com',
  messagingSenderId: '1021412055058',
};

firebase.initializeApp(config);
const db = firebase.database();

const SERVER_TIME = firebase.database.ServerValue.TIMESTAMP;

const offsetRef = firebase.database().ref('.info/serverTimeOffset');
let offset = 0;
offsetRef.once('value', (result) => {
  offset = result.val();
});

function getTime() {
  return new Date().getTime() + offset;
}
export {db, SERVER_TIME};

export {offline, getTime};

export default firebase;
