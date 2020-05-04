import fs from 'fs';
import _ from 'lodash';

const usersJson = fs.readFileSync('./users.json');
const users = JSON.parse(usersJson);

const allGids = new Set();
for (const user of _.values(users)) {
  // console.log(user);
  const gids = _.keys(user.history);
  for (const gid of gids) {
    allGids.add(gid);
  }
  // if (allGids.size > 100) break;
}

const gidsList = _.sortBy(Array.from(allGids));
console.log(JSON.stringify(gidsList));
