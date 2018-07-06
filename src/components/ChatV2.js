import './css/chatv2.css';

import React, { Component } from 'react';

import nameGenerator from '../nameGenerator';

export default class Chat extends Component {
  constructor() {
    super();
    this.state = {
      username: nameGenerator(),
      message: '',
    };
  }

  get game() {
    if (!this.props.historyWrapper) return;
    return this.props.historyWrapper.getSnapshot();
  }

  get messages() {
    if (!this.game) return [];
    if (!this.game.chat) return [];
    return this.game.chat.messages || [];
  }

  sendChatMessage() {
    const { username, message } = this.state;
    const { id } = this.props;
    this.props.gameModel.chat(username, id, message);
  }

  handleKeyPress = (ev) => {
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
        this.sendChatMessage();
        this.setState({message: ''});
      } else {
        onPressEnter();
      }
    }
  }

  handleUsernameInputKeyPress = (ev) => {
    if (ev.key === 'Enter') {
      ev.stopPropagation();
      ev.preventDefault();
      this.focus();
    }
  }

  handleChange = (ev) => {
    this.setState({message: ev.target.value});
  }

  handleChangeUsername = (ev) => {
    const username = ev.target.value;
    this.setState({ username });
  }

  focus() {
    this.refs.input && this.refs.input.focus();
  }

  renderChatHeader() {
    if (!this.game) return null;
    const { title, author, type } = this.game.info || {};

    const header = (
      <div className='header'>
        <div className='header--title'>
          { title }
        </div>

        <div className='header--subtitle'>
          {
            type && (
              type + ' | '
              + 'By ' + author
            )
          }
        </div>
      </div>
    );

    return (
      <div className='chatv2--header'>
        {header}
      </div>
    );
  }

  renderUsernameInput() {
    return (this.props.hideChatBar
      ? null
      : <div className='chatv2--username'>
          {'You are '}
          <input
            style={{
              textAlign: 'center',
            }}
            className='chatv2--username--input'
            value={this.state.username}
            onChange={this.handleChangeUsername}
            onKeyPress={this.handleUsernameInputKeyPress}
          />
        </div>
    );
  }


  renderChatBar() {
    if (this.props.hideChatBar) {
      return null;
    }
    return (
      <div className='chatv2--bar'>
        <input
          ref='input'
          className='chatv2--bar--input'
          placeholder='[Enter] to chat'
          value={this.state.message}
          onChange={this.handleChange}
          onKeyPress={this.handleKeyPress}
        />
      </div>
    );
  }

  render() {
    return (
      <div className='chatv2'>
        {this.renderChatHeader()}
        {this.renderUsernameInput()}
        <div
          ref={
            el => {
              if (el) {
                el.scrollTop = el.scrollHeight;
              }
            }
          }
          className='chatv2--messages'>
          {
            this.messages.map((message, i) => (
              <div key={i} className='chatv2--message'>
                <span className='chatv2--message--sender'>{message.sender}</span>
                {':'}
                <span className='chatv2--message--text'>{message.text}</span>
              </div>
            ))
          }
        </div>

        {this.renderChatBar()}
      </div>
    );
  }
};

