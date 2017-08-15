import nameGenerator from '../nameGenerator';

import React, { Component } from 'react';

/*
 * Summary of Chat component
 *
 * Props: { chat, onSendChatMessage }
 *
 * State: { message, username }
 *
 * Children: []
 *
 * Potential parents (so far):
 * - Room
 **/

export default class Chat extends Component {
  constructor() {
    super();
    this.state = {
      message: '',
      username: nameGenerator()
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.chat.messages.length !== nextProps.chat.messages.length || this.state.message !== nextState.message || this.state.username !== nextState.username;
  }

  onKeyPress(ev) {
    if (ev.key === 'Enter') {
      ev.stopPropagation();
      ev.preventDefault();
      this.props.onSendChatMessage(this.state.username, this.state.message);
      this.setState({message: ''});
    }
  }

  onChange(ev) {
    this.setState({message: ev.target.value});
  }

  onChangeUsername(ev) {
    this.setState({username: ev.target.value});
  }

  render() {
    return (
      <div className='chat'>
        <div className='chat--header'>
          <div className='chat--title'>
            Chat
          </div>
          <div className='chat--username'>
            Your username:
            <input
              className='chat--username--input'
              value={this.state.username}
              onChange={this.onChangeUsername.bind(this)} />
          </div>
        </div>

        <div
          ref={
            el => {
              if (el) {
                el.scrollTop = el.scrollHeight;
              }
            }
          }
          className='chat--messages'>
          {
            this.props.chat.messages.map((message, i) => (
              <div key={i} className='chat--message'>
                <span className='chat--message--sender'>{message.sender}</span>
                {':'}
                <span className='chat--message--text'>{message.text}</span>
              </div>
            ))
          }
        </div>

        <div className='chat--bar'>
          <input
            className='chat--bar--input'
            placeholder='Send a message'
            value={this.state.message}
            onChange={this.onChange.bind(this)}
            onKeyPress={this.onKeyPress.bind(this)}
          />
        </div>
      </div>
    );
  }
};
