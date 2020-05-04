// lists games
import admin from 'firebase-admin';
const serviceAccount = require('./serviceAccountKey.json');

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://crosswordsio.firebaseio.com',
});
const db = admin.database();
import _ from 'lodash';
import AWS from 'aws-sdk';
import Promise from 'bluebird';

const credentials = new AWS.SharedIniFileCredentials({profile: 'sven'});
AWS.config.credentials = credentials;

async function go() {
  const SIZE = 50;
  const startTime = Date.now();
  const history = (await db.ref(`/user`).once('value')).val();
  console.log(JSON.stringify(history, null, 2));
  process.exit(0);
}

go();
