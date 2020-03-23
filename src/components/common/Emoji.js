import React from 'react';
import * as emojiLib from '../../lib/emoji';

export default ({emoji, big}) => {
  const data = emojiLib.get(emoji);
  if (!data) return null;

  const size = big ? 60 : 22;
  const imgStyle = {
    verticalAlign: 'middle',
    border: 0,
    top: 0,
    left: 0,
    height: size,
    // position: 'absolute',
  };
  const spanStyle = {
    position: 'relative',
    height: size,
    fontSize: `${(size / 22) * 100}%`,
    display: 'inline-block',
    textAlign: 'center',
  };
  if (data.url) {
    return (
      <span title={emoji} style={spanStyle}>
        <img style={imgStyle} src={data.url} alt={emoji} />
      </span>
    );
  }

  // otherwise, expect a web-friendly str
  return (
    <span style={spanStyle} title={emoji}>
      {data}
    </span>
  );
};
