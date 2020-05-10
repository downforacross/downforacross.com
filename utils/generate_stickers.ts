// Use https://github.com/yolandaz/stickers to grab urls from messenger
// ex npx babel-node generate_stickers.ts --names pricklypearnames.json --urls pricklypearurls.json
import {ArgumentParser} from 'argparse';
import _ from 'lodash';

const parser = new ArgumentParser({
  description: 'compiles names & urls into a json with shape { [name]: url, ... }',
});
parser.addArgument('--names', {
  action: 'store',
  required: true,
  dest: 'names',
  help: 'The path to names json file (array of strings)',
});
parser.addArgument('--urls', {
  action: 'store',
  required: true,
  dest: 'urls',
  help: 'The path to urls json file (array of strings)',
});
parser.addArgument('--out', {
  action: 'store',
  defaultValue: 'out.json',
  dest: 'out',
  help: 'The path that the output json file should be written',
});
const args = parser.parseArgs();
console.log(args);

import fs from 'fs';
const names = JSON.parse(fs.readFileSync(args.names));
const urls = JSON.parse(fs.readFileSync(args.urls));
console.log(names, urls);
const result = _.fromPairs(names.map((name, i) => [name, urls[i]]));
console.log(`Writing ${_.size(result)} entries to ${args.out}`);
fs.writeFileSync(args.out, JSON.stringify(result, null, 2));
