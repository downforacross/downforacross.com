import React, {Component} from 'react';

export default class ClueText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showClueLengths: false,
    };
  }

  decodeHtml(htmlText) {
    let text = document.createElement('textarea');
    text.innerHTML = htmlText;
    let decodedText = text.value;

    // Check if the text should be italicized and remove double quotes from the start and end if they encase the entire string
    if (this.shouldItalicize(decodedText)) {
      decodedText = decodedText.replace(/^"(.*)"$/, '$1');
    }

    return decodedText;
  }

  shouldItalicize(text) {
    const quotePattern = /"([^"]*)"/g;
    let matches = text.match(quotePattern);
    return matches && matches.length === 2;
  }

  render() {
    let text = this.props.text || ''; // Use text from props
    const isItalic = this.shouldItalicize(text);
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
          <span
            key={i}
            style={{
              fontStyle: ital || isItalic ? 'italic' : 'inherit',
              wordBreak: 'break-word',
            }}
          >
            {this.decodeHtml(text)}
          </span>
        ))}
      </>
    );
  }
}
