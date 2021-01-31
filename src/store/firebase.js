import firebase from 'firebase/app';
// eslint-disable-next-line import/no-duplicates
import 'firebase/database';
// eslint-disable-next-line import/no-duplicates
import 'firebase/auth';

const offline = false;
const CONFIGS = {
  production: {
    apiKey: 'AIzaSyCe4BWm9kbjXFwlZcmq4x8DvLD3TDoinhA',
    authDomain: 'crosswordsio.firebaseapp.com',
    databaseURL: 'https://crosswordsio.firebaseio.com',
    projectId: 'crosswordsio',
    storageBucket: 'crosswordsio.appspot.com',
    messagingSenderId: '1021412055058',
  },
  development: {
    apiKey: 'AIzaSyC4Er27aLKgSK4u2Z8aRfD6mr8AvLPA8tA',
    authDomain: 'dfac-fa059.firebaseapp.com',
    databaseURL: 'https://dfac-fa059.firebaseio.com',
    projectId: 'dfac-fa059',
    storageBucket: 'dfac-fa059.appspot.com',
    messagingSenderId: '132564774895',
    appId: '1:132564774895:web:a3bf48cd38c4df81e8901a',
  },
};
const config = CONFIGS[process.env.REACT_APP_ENV || process.env.NODE_ENV];

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
