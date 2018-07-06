import firebase from 'firebase';

let offline = true;
// offline = false;

const config = {
  apiKey: "AIzaSyCe4BWm9kbjXFwlZcmq4x8DvLD3TDoinhA",
  authDomain: "crosswordsio.firebaseapp.com",
  databaseURL: "https://crosswordsio.firebaseio.com",
  projectId: "crosswordsio",
  storageBucket: "crosswordsio.appspot.com",
  messagingSenderId: "1021412055058"
};

firebase.initializeApp(config);
const db = firebase.database();

console.log(db);
const SERVER_TIME = firebase.database.ServerValue.TIMESTAMP;

export {
  db,
  SERVER_TIME,
};

export { offline };

export default firebase;
