import React from 'react';
import EmojiPicker from '../components/EmojiPicker';
import Emoji from '../components/Emoji';
import * as emojiLib from '../lib/emoji';

const MAX_EMOJIS = 150;
export default class ChatBar extends React.Component {
  constructor() {
    super();
    this.state = {
      message: '',
      escapedEmoji: null,
    };
    this.input = React.createRef();
    this.emojiPicker = React.createRef();
  }

  handleKeyDown = (ev) => {
    if (this.emojiPicker.current) {
      this.emojiPicker.current.handleKeyDown(ev);
      return;
    }
    const {onPressEnter} = this.props;
    const {message, username} = this.state;

    if (ev.key === 'Enter') {
      ev.stopPropagation();
      ev.preventDefault();
      if (message.length > 0) {
        this.props.onSendMessage(message);
        this.setState({message: ''});
      } else {
        this.props.onUnfocus();
      }
    } else if (ev.key === 'Escape') {
      this.props.onUnfocus();
    }
  };

  handleChange = (ev) => {
    const message = ev.target.value;
    this.setState({message});
  };

  handleConfirmEmoji = (emoji) => {
    const {message} = this.state;
    const words = this.state.message.split(' ');
    const newMessage = [...words.slice(0, words.length - 1), `:${emoji}:`, ''].join(' ');
    this.setState({
      message: newMessage,
    });
  };

  handleEscapeEmoji = () => {
    this.setState({
      escapedEmoji: this.emojiPattern,
    });
    setTimeout(() => {
      this.setState({
        escapedEmoji: null,
      });
    }, 5000);
  };

  focus() {
    const input = this.input.current;
    if (input) {
      input.focus();
    }
  }

  get emojiPattern() {
    const words = this.state.message.split(' ');
    const lastWord = words[words.length - 1];
    if (lastWord.startsWith(':')) {
      const pattern = lastWord.substring(1);
      if (pattern.match(/^[a-zA-Z_-]*$/)) {
        if (pattern !== this.state.escapedEmoji) {
          return pattern;
        }
      }
    }
  }

  renderEmojiPicker() {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: 50,
          left: 0,
          right: 0,
          top: 'auto',
        }}
      >
        <EmojiPicker
          disableKeyListener
          ref={this.emojiPicker}
          pattern={this.emojiPattern}
          matches={emojiLib.findMatches(this.emojiPattern).slice(0, MAX_EMOJIS)}
          onConfirm={this.handleConfirmEmoji}
          onEscape={this.handleEscapeEmoji}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="chatv2--bar">
        {this.emojiPattern && this.renderEmojiPicker()}
        <input
          ref={this.input}
          className="chatv2--bar--input"
          placeholder="[Enter] to chat"
          value={this.state.message}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />
      </div>
    );
  }
}
