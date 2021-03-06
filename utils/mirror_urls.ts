// ex npx babel-node mirror_urls.ts --input pricklypearurls.json
import {ArgumentParser} from 'argparse';
import _ from 'lodash';
import Promise from 'bluebird';
import * as uuid from 'uuid';
import rp from 'request-promise';
const parser = new ArgumentParser({
  description: 'mirrors images onto an s3 bucket and writes resulting urls to a json',
});
parser.addArgument('--input', {
  action: 'store',
  required: true,
  dest: 'input',
  help: 'The path to input json file (array of strings)',
});
parser.addArgument('--out', {
  action: 'store',
  defaultValue: 'mirroredUrls.json',
  dest: 'out',
  help: 'The path that the output json file should be written',
});
const args = parser.parseArgs();
console.log(args);

import fs from 'fs';
import AWS from 'aws-sdk';
const credentials = new AWS.SharedIniFileCredentials({profile: 'sven'});
AWS.config.credentials = credentials;
async function go() {
  const input = JSON.parse(fs.readFileSync(args.input));
  const result = await Promise.map(input, async (url) => {
    const id = uuid.v4();
    const res = await rp({
      url,
      encoding: null,
      resolveWithFullResponse: true,
    });
    console.log(url);
    console.log(res.headers);
    fs.writeFileSync('abc', res.body);
    // console.log(res);
    //
    if (true) {
      await new AWS.S3({
        ApiVersion: '2006-03-01',
      })
        .putObject({
          Bucket: 'downforacross',
          Key: `stickers/${id}`,
          ACL: 'public-read',
          Body: res.body,
          ContentType: res.headers['content-type'],
        })
        .promise();
      console.log(id);
      return {url: `https://downforacross.s3-us-west-1.amazonaws.com/stickers/${id}`};
    }
  });

  console.log(`Writing ${_.size(result)} entries to ${args.out}`);
  fs.writeFileSync(args.out, JSON.stringify(result, null, 2));
}
go();
