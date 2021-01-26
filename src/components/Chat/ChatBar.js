import React from 'react';
import EmojiPicker from './EmojiPicker';
import * as emojiLib from '../../lib/emoji';

const MAX_EMOJIS = 150;
export default class ChatBar extends React.Component {
  constructor() {
    super();
    this.state = {
      message: '',
      escapedEmoji: null,
      enters: 0,
    };
    this.input = React.createRef();
    this.emojiPicker = React.createRef();
  }

  handlePressEnter = () => {
    const {message} = this.state;
    if (message.length > 0) {
      this.props.onSendMessage(message);
      this.setState((prevState) => ({message: '', enters: prevState.enters + 1}));
    } else {
      this.props.onUnfocus();
    }
  };

  handleKeyDown = (ev) => {
    if (this.emojiPicker.current) {
      this.emojiPicker.current.handleKeyDown(ev);
      return;
    }

    if (ev.key === 'Enter') {
      ev.stopPropagation();
      ev.preventDefault();
      this.handlePressEnter();
    } else if (ev.key === 'Escape') {
      this.props.onUnfocus();
    }
  };

  handleChangeMobile = (message) => {
    this.setState({message});
  };

  handleChange = (ev) => {
    const message = ev.target.value;
    this.setState({message});
  };

  handleConfirmEmoji = (emoji) => {
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
      const pattern = lastWord.substring(1).toLowerCase();
      if (pattern.match(/^[a-zA-Z_-]*$/)) {
        if (pattern !== this.state.escapedEmoji) {
          return pattern;
        }
      }
    }
    return undefined;
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

  renderInput() {
    return (
      <input
        ref={this.input}
        className={this.props.mobile ? 'chat--bar--input--mobile' : 'chat--bar--input'}
        placeholder="[Enter] to chat"
        value={this.state.message}
        onChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
      />
    );
  }

  render() {
    return (
      <div className="chat--bar">
        {this.emojiPattern && this.renderEmojiPicker()}
        {this.renderInput()}
      </div>
    );
  }
}
