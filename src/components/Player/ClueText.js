import React from 'react';

function decodeHtml(htmlText) {
  let text = document.createElement("textarea");
  text.innerHTML = htmlText;
  return text.value;
}

export default ({text = ''}) => {
  const parts = [];
  while (text.length > 0) {
    const s = text.indexOf('<i>');
    const e = text.indexOf('</i>');
    if (s === 0 && e !== -1) {
      parts.push({
        text: text.substring(3, e),
        ital: true,
      });
      text = text.substring(e + 4);
    } else if (s !== -1) {
      parts.push({
        text: text.substring(0, s),
      });
      text = text.substring(s);
    } else {
      parts.push({
        text,
      });
      text = '';
    }
  }
  return (
    <>
      {parts.map(({text, ital}, i) => (
        <span key={i} style={{
          fontStyle: ital ? 'italic' : 'inherit',
          wordBreak: 'break-word'
        }}>
          {decodeHtml(text)}
        </span>
      ))}
    </>
  );
};
