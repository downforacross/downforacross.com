import React from 'react';

function decodeHtml(htmlText) {
  let text = document.createElement('textarea');
  text.innerHTML = htmlText;
  let decodedText = text.value;

  // Check if the text should be italicized and remove double quotes from the start and end if they encase the entire string
  if (shouldItalicize(decodedText)) {
    decodedText = decodedText.replace(/^"(.*)"$/, '$1');
  }

  return decodedText;
}

function shouldItalicize(text) {
  const doubleQuotePattern = /^"{2}.*"{2}$/;
  return doubleQuotePattern.test(text);
}

export default ({text = ''}) => {
  const isItalic = shouldItalicize(text);
  const parts = [];
  if (shouldItalicize(text)) {
    parts.push({
      text: text,
      ital: true,
    });
  } else {
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
  }

  return (
    <>
      {parts.map(({text, ital}, i) => (
        <span
          key={i}
          style={{
            fontStyle: ital ? 'italic' : 'inherit',
            wordBreak: 'break-word',
          }}
        >
          {decodeHtml(text)}
        </span>
      ))}
    </>
  );
};
