import _ from 'lodash';
import defaultPack from './emojiPacks/default';
import pricklyPear from './emojiPacks/pricklyPear.json';
import custom from './emojiPacks/custom';
import partyParrot from './emojiPacks/partyParrot';
import joku from './emojiPacks/joku';
import sugarCubs from './emojiPacks/sugarCubs';
import bun from './emojiPacks/bun';
import yoyo from './emojiPacks/yoyo';

// spread in reverse-order of priority, in case of name collisions
const allEmojiData = {
  ...defaultPack,
  ...partyParrot,
  ...pricklyPear,
  ...joku,
  ...sugarCubs,
  ...bun,
  ...yoyo,
  ...custom,
};
const allEmojis = _.keys(allEmojiData);
const getScore = (emoji, pattern) => {
  if (emoji === pattern) return 60;
  if (emoji.startsWith(pattern)) return 50;
  const idx = emoji.indexOf(pattern);
  if (idx !== -1) {
    const prevChar = emoji[idx - 1];
    if (prevChar === '_') return 40;
    if (prevChar === '-') return 30;
    return 10;
  }
  return 0;
};

export const findMatches = (pattern) =>
  _.orderBy(
    allEmojis
      .map((emoji, i) => ({
        emoji,
        score: getScore(emoji, pattern),
        index: i,
      }))
      .filter(({score}) => score > 0),
    ['score', 'index'],
    ['desc', 'desc']
  ).map(({emoji}) => emoji);

export const get = (emoji) => allEmojiData[emoji];
