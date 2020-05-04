// archives replays
import admin from 'firebase-admin';
import fs from 'fs';
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

const allGids = JSON.parse(fs.readFileSync('./gids.json'));
console.log(`Archiving ${allGids.length} games...`);

async function go() {
  const SIZE = 1000;
  const startTime = Date.now();
  for (let range = 0; range < 300000; range += SIZE) {
    let count = 0;
    let countEvents = 0;
    await Promise.map(
      _.range(range, range + SIZE),
      async (pos) => {
        const startTime = Date.now();
        const gid = allGids[pos];
        if (!gid) return;
        const history = (await db.ref(`/game/${gid}/events`).once('value')).val();
        if (!history) {
          return;
        }
        count += 1;
        countEvents += _.keys(history).length;
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
        const url = `https://downforacross.s3-us-west-1.amazonaws.com/archive/game/${gid}/events`;
        await db.ref(`/game/${gid}/archivedEvents`).set({
          archivedAt: new Date(),
          count: _.keys(history).length,
          url,
        });
        await db.ref(`/game/${gid}/events`).remove();
        const endTime = Date.now();
        console.log(gid, (endTime - startTime) * 0.001, 'secs');
      },
      {
        concurrency: 50,
      }
    );
    console.log('done with', range, range + SIZE, (Date.now() - startTime) / 1000 / 60, 'mins', {
      count,
      countEvents,
    });
  }
  process.exit(0);
}

go();
