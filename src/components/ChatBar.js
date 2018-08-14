import React from 'react';
import emoji from 'node-emoji';

export default class ChatBar extends React.Component {
  constructor() {
    super();
    this.state = {
      message: '',
    };
    this.input = React.createRef();
  }

  handleKeyDown = (ev) => {
    const {
      onPressEnter,
    } = this.props;
    const {
      message,
      username,
    } = this.state;

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
  }

  handleChange = (ev) => {
    const value = ev.target.value;
    const message = emoji.emojify(value);
    this.setState({ message });
  }

  focus() {
    const input = this.input.current;
    if (input) {
      input.focus();
    }
  }

  render() {
    return (
      <div className='chatv2--bar'>
        <input
          ref={this.input}
          className='chatv2--bar--input'
          placeholder='[Enter] to chat'
          value={this.state.message}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />
      </div>
    );
  }
}
