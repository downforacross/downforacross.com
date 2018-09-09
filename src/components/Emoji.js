import React from 'react';
import * as emojiLib from '../lib/emoji';

export default ({emoji}) => {
  const data = emojiLib.get(emoji);
  if (!data) return null;

  // data will be a unicode str, for now
  return (
    <span>{data}</span>
  );
};
