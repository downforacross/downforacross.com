// saves a json snapshot of the puzzle list
// INSTRUCTIONS
// 1.  npx babel-node dumpPuzzles.js
// 2.  json2csv -i puzzles.json -f uid,pid,is_public,uploaded_at,content > ../server/sql/adhoc/data/puzzles.csv
//   2.5.  json2csv -i puzzlesHead.json -f uid,pid,is_public,uploaded_at,content > ../server/sql/adhoc/data/puzzles.csv # for testing
// 3.  see sql/adhoc/load_puzzles_1_24_21.sql for next steps
import admin from 'firebase-admin';
const serviceAccount = require('./serviceAccountKey.json');

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://crosswordsio.firebaseio.com',
});
const db = admin.database();
import _, {transform} from 'lodash';
import AWS from 'aws-sdk';
import Promise from 'bluebird';
import fs from 'fs';

const credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
AWS.config.credentials = credentials;

/**
 * Returns a list of raw puzzles
 * A raw puzzles is an object with keys: [
  "clues",
  "grid",
  "info",
  "pid",
  "private"
  ]
 */
const getRawPuzzles = async () => {
  try {
    return JSON.parse(fs.readFileSync('rawPuzzles.json'));
  } catch (e) {
    console.log('raw puzzles missing! performing firebase query...');
    const rawPuzzles = (await db.ref(`/puzzle`).once('value')).val();
    // const rawPuzzles = ['hello']; //(await db.ref(`/puzzle`).once('value')).val();
    fs.writeFileSync('rawPuzzles.json', JSON.stringify(rawPuzzles));
    return rawPuzzles;
  }
};

/**
 * Takes a raw puzzle and returns a puzzle ready to be loaded into db
 * Output keys:
 * [uid, pid, is_public, uploaded_at, content ]
 */
const transformPuzzle = (rawPuzzle) => ({
  uid: '', // imported puzzles lack a uid
  pid: rawPuzzle.pid,
  is_public: !rawPuzzle.private,
  uploaded_at: new Date().toISOString(),
  content: {
    grid: rawPuzzle.grid,
    info: rawPuzzle.info,
    circles: rawPuzzle.circles || [],
    shades: rawPuzzle.shades || [],
    clues: rawPuzzle.clues,
    private: !!rawPuzzle.private,
  },
});

async function go() {
  // todo: read all the puzzles (up to a limit -- for development purposes)

  const rawPuzzles = await getRawPuzzles();
  const puzzles = rawPuzzles.filter((p) => p && p.pid).map(transformPuzzle);

  // puzzles is an array of {uid,pid,is_public,uploaded_at,content}
  fs.writeFileSync('puzzles.json', JSON.stringify(puzzles));
  fs.writeFileSync('puzzlesHead.json', JSON.stringify(puzzles.filter(_.identity).slice(0, 10)));
}
console.log('start script');
go().then(() => {
  console.log('done');
  process.exit(0);
});
