import './css/chatv2.css';

import React, { Component } from 'react';
import emoji from 'node-emoji';
import nameGenerator from '../nameGenerator';
import ChatBar from './ChatBar';

const isEmojis = str => {
  const res = str.match(/[A-Za-z,.0-9!-]/g);
  return !res;
};

export default class Chat extends Component {
  constructor() {
    super();
    this.state = {
      username: nameGenerator(),
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

  handleSendMessage = (message) => {
    const { username } = this.state;
    const { id } = this.props;
    this.props.gameModel.chat(username, id, message);
  }

  handleUsernameInputKeyPress = (ev) => {
    if (ev.key === 'Enter') {
      ev.stopPropagation();
      ev.preventDefault();
      this.focus();
    }
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

    return (
      <div className='chatv2--header'>
        <div className='chatv2--header--title'>
          { title }
        </div>

        <div className='chatv2--header--subtitle'>
          {
            type && (
              type + ' | '
              + 'By ' + author
            )
          }
        </div>
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
      <ChatBar ref={this.chatBar}
        placeHolder='[Enter] to chat'
        onSendMessage={this.handleSendMessage}
        onUnfocus={this.onUnfocus}/>
    );
  }

  renderMessage(message) {
    const { sender, text } = message;
    const big = text.length <= 10 && isEmojis(text);
    return (
      <div className={'chatv2--message' + (big ? ' big' : '')}>
        <span className='chatv2--message--sender'>{message.sender}</span>
        {':'}
        <span className={'chatv2--message--text'}>{emoji.emojify(message.text)}</span>
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
              <div key={i}>{this.renderMessage(message)}</div>
            ))
          }
        </div>

        {this.renderChatBar()}
      </div>
    );
  }
};

