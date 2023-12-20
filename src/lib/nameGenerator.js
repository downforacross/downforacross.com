import {nameWords} from './names';

const {
  adjectives: rawAdjectiveList,
  nouns: rawNounList,
  positiveAdjectives: positiveAdjectiveList,
} = nameWords;

function capitalize(s) {
  s = s.toLowerCase();
  s = s.substr(0, 1).toUpperCase() + s.substr(1).toLowerCase();
  return s;
}

function isAlpha(s) {
  return /^[a-zA-Z]+$/.test(s);
}

function sanitize(s) {
  s = s.trim();
  s = s.split(' ').filter(isAlpha).map(capitalize).join(' ');
  return s;
}

function adjFilter(s) {
  const len = s.length;
  return len >= 2 && len <= 13;
}

function nounFilter(s) {
  const len = s.length;
  const numWords = s.split(' ').length;
  return numWords <= 2 && len >= 2 && len <= 13;
}

function sample(lst) {
  return lst[Math.floor(Math.random() * lst.length)];
}

const adjectives = rawAdjectiveList.split(',').map(sanitize).filter(adjFilter);
const positiveAdjectives = positiveAdjectiveList.split('\n').map(sanitize).filter(adjFilter);
const nouns = rawNounList.split('\n').map(sanitize).filter(nounFilter);

export function isFromNameGenerator(name) {
  if (typeof name !== 'string' || name.length > 20) {
    return false;
  }

  const parts = name.split(' ');
  if (parts.length !== 2) {
    return false;
  }

  const [adjective, noun] = parts;

  const adjectiveExists = adjectives.includes(adjective) || positiveAdjectives.includes(adjective);
  const nounExists = nouns.includes(noun);

  return adjectiveExists && nounExists;
}

export default function nameGenerator() {
  function f() {
    const adj = Math.random() < 0.9 ? sample(positiveAdjectives) : sample(adjectives);
    const noun = sample(nouns);
    return `${adj} ${noun}`;
  }

  const max_len = 20;

  let s = f();
  while (s.length > max_len) {
    s = f();
  }
  return s;
}
