// archives replays
import {db, disconnect} from '../src/actions';
import _ from 'lodash';
import AWS from 'aws-sdk';
import Promise from 'bluebird';

const credentials = new AWS.SharedIniFileCredentials({profile: 'sven'});
AWS.config.credentials = credentials;

async function go() {
  const SIZE = 50;
  const startTime = Date.now();
  // for (let range = 40000; range < 1000000; range += SIZE) {
  for (let range = 60000; range < 100000; range += SIZE) {
    await Promise.map(_.range(range, range + SIZE), async (gid) => {
      const history = (await db.ref(`/game/${gid}/events`).once('value')).val();
      if (!history) {
        console.log('skipping', gid);
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
      const url = `https://downforacross.s3-us-west-1.amazonaws.com/archive/game/${gid}/events`;
      await db.ref(`/game/${gid}/archivedEvents`).set({
        archivedAt: new Date(),
        count: _.keys(history).length,
        url,
      });
      await db.ref(`/game/${gid}/events`).remove();
    });
    console.log('done with', range, range + SIZE, (Date.now() - startTime) / 1000 / 60, 'mins');
  }
}

go();
