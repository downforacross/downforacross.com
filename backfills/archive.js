// archives replays
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

const credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
AWS.config.credentials = credentials;

const gameWords = 'troff glon yomp bruss jank fress masp smub zint jeft vusk hipt splect sunt phrist dimp bosp zoft yact spluff drid criff jing strod vept luft splob fesp kemp cesk flact thrund clud nund fect swug ust phropt ceft drast fleff scrim omp drap gleck jift jund chand smed noct pron snid vonk trag nept yuft sclack plusk snaff zamp skob glemp besp fress vosk frep jang unt joct thrag plig hect nund sphob blen jisk yasp bisk glaff treb threck plash thrump prash glap thren gaft vesk yeft thrun thomp ont sask trunt blit jemp phrint namp glap prash'.split(
  ' '
);
async function go() {
  const SIZE = 50;
  const startTime = Date.now();
  let work = 0;
  // for (let range = 40000; range < 1000000; range += SIZE) {
  // for (let range = 140000; range > 40000; range -= SIZE) {
  for (let range = 240000; range > 140000; range -= SIZE) {
    await Promise.map(
      _.range(range, range + SIZE),
      async (gid) => {
        await Promise.map(gameWords, async (word) => {
          // console.log('on', gid);
          const history = (await db.ref(`/game/${gid}-${word}/events`).once('value')).val();
          if (!history) {
            return;
          }
          await new AWS.S3({
            apiVersion: '2006-03-01',
          })
            .putObject({
              Bucket: 'downforacross',
              Key: `archive/game/${gid}/events`,
              Body: JSON.stringify(history),
              ACL: 'public-read',
            })
            .promise();
          // console.log('found', gid, word);
          const url = `https://downforacross.s3-us-west-1.amazonaws.com/archive/game/${gid}/events`;
          await db.ref(`/game/${gid}-${word}/archivedEvents`).set({
            archivedAt: new Date(),
            count: _.keys(history).length,
            url,
          });
          await db.ref(`/game/${gid}-${word}/events`).remove();
          work += 1;
        });
      },
      {
        concurrency: 50,
      }
    );
    console.log('done with', work, range, range + SIZE, (Date.now() - startTime) / 1000 / 60, 'mins');
  }
}

go();
