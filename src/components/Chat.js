import './css/chat.css';

import React, { Component } from 'react';

import nameGenerator from '../nameGenerator';

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
      username: nameGenerator(),
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.chat.messages.length !== nextProps.chat.messages.length || this.state.message !== nextState.message || this.state.username !== nextState.username;
  }

  onKeyPress = (ev) => {
    const {
      onSendChatMessage,
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
        onSendChatMessage(username, message);
        this.setState({message: ''});
      } else {
        onPressEnter();
      }
    }
  }

  onUsernameInputKeyPress = (ev) => {
    if (ev.key === 'Enter') {
      ev.stopPropagation();
      ev.preventDefault();
      this.focus();
    }
  }

  onChange = (ev) => {
    this.setState({message: ev.target.value});
  }

  onChangeUsername = (ev) => {
    const username = ev.target.value;
    this.setState({ username });
  }

  focus() {
    this.refs.input && this.refs.input.focus();
  }

  renderChatHeader() {
    const usernameInput = (this.props.hideChatBar
      ? null
      : <div className='chat--username'>
          {'You are '}
          <input
            style={{
              textAlign: 'center',
            }}
            className='chat--username--input'
            value={this.state.username}
            onChange={this.onChangeUsername}
            onKeyPress={this.onUsernameInputKeyPress}
          />
        </div>
    );
    return (
      <div className='chat--header'>
        <div className='chat--title'>
          Chat
        </div>
        {usernameInput}
      </div>
    );
  }

  renderChatBar() {
    if (this.props.hideChatBar) {
      return null;
    }
    return (
      <div className='chat--bar'>
        <input
          ref='input'
          className='chat--bar--input'
          placeholder='[Enter] to chat'
          value={this.state.message}
          onChange={this.onChange}
          onKeyPress={this.onKeyPress}
        />
      </div>
    );
  }

  render() {
    return (
      <div className='chat'>
        {this.renderChatHeader()}
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

        {this.renderChatBar()}
      </div>
    );
  }
};
