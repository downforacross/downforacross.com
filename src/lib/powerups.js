import moment from 'moment';
import _ from 'lodash';

const transformClues = (game, transformation) => {
  const {clues} = game;
  const across = _.map(clues.across, transformation);
  const down = _.map(clues.down, transformation);
  return {
    ...game,
    clues: {across, down},
  };
};

const reverseClues = (game) => {
  const reverseString = (s) => s && _.reverse(s.split('')).join('');
  return transformClues(game, reverseString);
};

const removeVowels = (game) => {
  const remove = (s) => s && _.filter(s.split(''), (char) => !_.includes('aeiouAEIOU', char)).join('');
  return transformClues(game, remove);
};

const hideSquares = (game) => {
  const {grid, cursors} = game;
  const closeToCursor = (r2, c2) => {
    return _.some(cursors, ({r, c}) => Math.max(Math.abs(r2 - r), Math.abs(c2 - c)) <= 3);
  };

  return {
    ...game,
    grid: grid.map((row, r) => row.map((tile, c) => (closeToCursor(r, c) ? tile : {...tile, value: '🌚'}))),
  };
};

const secondsSince = (t) => parseInt(moment.duration(moment(Date.now()).diff(moment(t))).asSeconds());

export const hasExpired = (powerup) => {
  const {type, used} = powerup;
  const {duration} = powerups[type];
  return used && secondsSince(used) > duration;
};

export const inUse = (powerup) => {
  const {type, used} = powerup;
  const {duration} = powerups[type];
  return used && secondsSince(used) < duration;
};

export const timeLeft = (powerup) => {
  const {type, used} = powerup;
  const {duration} = powerups[type];
  return used && duration - secondsSince(used);
};

export const apply = (ownGame, opponentGame, ownPowerups, opponentPowerups) => {
  if (!ownGame || !opponentGame) {
    return {ownGame, opponentGame};
  }

  const applyOneDirection = (ownGame, opponentGame, currentPowerups) => {
    const inUsePowerups = _.filter(currentPowerups, inUse);
    return _.reduce(inUsePowerups, (g, p) => powerups[p.type].action(g), {ownGame, opponentGame});
  };

  // TODO: better names for these variables / better way to do this.
  const {ownGame: ownGame1, opponentGame: opponentGame1} = applyOneDirection(
    ownGame,
    opponentGame,
    ownPowerups
  );
  const {ownGame: opponentGame2, opponentGame: ownGame2} = applyOneDirection(
    opponentGame1,
    ownGame1,
    opponentPowerups
  );
  return {ownGame: ownGame2, opponentGame: opponentGame2};
};

// There should probably be an enum here with the keys of the following.
// Only image based emojis for now, until I figure out how css works...

const powerups = {
  REVERSE: {
    name: 'Reverse!',
    icon: 'steven',
    duration: 60,
    action: ({ownGame, opponentGame}) => ({ownGame, opponentGame: reverseClues(opponentGame)}),
  },
  DARK_MODE: {
    name: 'Dark Mode',
    icon: 'dark_moon',
    duration: 60,
    action: ({ownGame, opponentGame}) => ({ownGame, opponentGame: hideSquares(opponentGame)}),
  },
  VOWELS: {
    name: 'De-Vowel',
    icon: 'cactus_sweat',
    duration: 60,
    action: ({ownGame, opponentGame}) => ({ownGame, opponentGame: removeVowels(opponentGame)}),
  },
};

export default powerups;
