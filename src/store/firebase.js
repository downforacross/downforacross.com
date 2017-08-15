import firebase from 'firebase';

const config = {
  apiKey: "AIzaSyCe4BWm9kbjXFwlZcmq4x8DvLD3TDoinhA",
  authDomain: "crosswordsio.firebaseapp.com",
  databaseURL: "https://crosswordsio.firebaseio.com",
  projectId: "crosswordsio",
  storageBucket: "crosswordsio.appspot.com",
  messagingSenderId: "1021412055058"
};

firebase.initializeApp(config);

export default firebase;