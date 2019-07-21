// archives replays
import {db, disconnect} from '../src/actions';
import _ from 'lodash';
import AWS from 'aws-sdk';

const credentials = new AWS.SharedIniFileCredentials({profile: 'sven'});
AWS.config.credentials = credentials;

async function go() {
  for (let gid = 50000; gid < 50011; ++gid) {
    const history = (await db.ref(`/game/${gid}/events`).once('value')).val();
    if (!history) {
      console.log('skipping', gid);
      continue;
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
    console.log('done with', gid);
  }
}

go();
