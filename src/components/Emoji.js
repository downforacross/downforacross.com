import React from 'react';
import * as emojiLib from '../lib/emoji';

export default ({emoji}) => {
  const data = emojiLib.get(emoji);
  if (!data) return null;

  const imgStyle = {
    verticalAlign: 'middle',
    border: 0,
    top: 0,
    left: 0,
    height: 22,
    // position: 'absolute',
  };
  const spanStyle = {
    position: 'relative',
    height: 22,
    width: 22,
    display: 'inline-block',
    textAlign: 'center',
  };
  if (data.url) {
    return (
      <span style={spanStyle}><img style={imgStyle} src={data.url}/></span>
    );
  }

  // otherwise, expect a web-friendly str
  return (
    <span style={spanStyle}>{data}</span>
  );
};
