import defaultEmojis from './emojiPackDefault';
import _ from 'lodash';

const allEmojis = _.keys(defaultEmojis);

const getScore = (emoji, pattern) => {
  if (emoji === pattern) return 60;
  if (emoji.startsWith(pattern)) return 50;
  const idx = emoji.indexOf(pattern);
  if (idx !== -1) {
    const prevChar = emoji[idx - 1];
    if (prevChar === '_') return 40;
    return 10;
  }
  return 0;
};


export const findMatches = (pattern) => {
  return _.orderBy(
    (allEmojis
      .map(emoji => ({
        emoji,
        score: getScore(emoji, pattern)
      }))
      .filter(({score}) => score > 0)
    ),
    ['score', 'emoji'],
    ['desc', 'asc'],
  )
    .map(({emoji}) => emoji);
}

export const get = (emoji) => {
  return defaultEmojis[emoji];
}
