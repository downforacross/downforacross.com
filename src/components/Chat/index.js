import './css/index.css';
import React, {Component} from 'react';
import Emoji from '../common/Emoji';
import * as emojiLib from '../../lib/emoji';
import nameGenerator from '../../lib/nameGenerator';
import ChatBar from './ChatBar';
import EditableSpan from '../common/EditableSpan';
import _ from 'lodash';
import MobileKeyboard from '../Player/MobileKeyboard';
import Flex from 'react-flexview';
import {Link} from 'react-router-dom';

const isEmojis = (str) => {
  const res = str.match(/[A-Za-z,.0-9!-]/g);
  return !res;
};

export default class Chat extends Component {
  constructor() {
    super();
    const username = localStorage.getItem(this.usernameKey) || nameGenerator();
    this.state = {
      username,
    };
    this.chatBar = React.createRef();
    this.usernameInput = React.createRef();
  }

  componentDidMount() {
    const battleName = localStorage.getItem(`battle_${this.props.bid}`);
    // HACK
    if (battleName && !localStorage.getItem(this.usernameKey)) {
      this.setState({username: battleName});
    }
  }

  get usernameKey() {
    return `username_${window.location.href}`;
  }

  handleSendMessage = (message) => {
    const {username} = this.state;
    const {id} = this.props;
    this.props.onChat(username, id, message);
    localStorage.setItem(this.usernameKey, username);
  };

  handleChangeUsername = (username) => {
    if (!this.usernameInput.current.focused) {
      username = username || nameGenerator();
    }
    this.setState({username});
  };

  handleUnfocus = () => {
    this.props.onUnfocus();
  };

  handleBlur = () => {
    let {username} = this.state;
    username = username || nameGenerator();
    this.setState({username});
  };

  handleToggleChat = () => {
    this.props.onToggleChat();
  };

  focus = () => {
    const chatBar = this.chatBar.current;
    if (chatBar) {
      chatBar.focus();
    }
  };

  mergeMessages(data, opponentData) {
    if (!opponentData) {
      return data.messages || [];
    }

    const getMessages = (data, isOpponent) => _.map(data.messages, (message) => ({...message, isOpponent}));

    const messages = _.concat(getMessages(data, false), getMessages(opponentData, true));

    return _.sortBy(messages, 'timestamp');
  }

  getMessageColor(senderId, isOpponent) {
    const {colors} = this.props;
    if (isOpponent === undefined) {
      return colors[senderId];
    }
    return isOpponent ? 'rgb(220, 107, 103)' : 'rgb(47, 137, 141)';
  }

  renderGameButton() {
    return (
      <svg
        onClick={this.handleToggleChat}
        className="toolbar--game"
        viewBox="0 0 90 90"
        enableBackground="0 0 90 90"
        space="preserve"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <path d="M72.55664,51.2041c3.0874-3.93164,4.87598-8.56836,4.87598-13.53711c0-14.18066-14.52051-25.67578-32.43262-25.67578  S12.56738,23.48633,12.56738,37.66699c0,14.17969,14.52051,25.67578,32.43262,25.67578c2.61572,0,5.15625-0.25195,7.59277-0.71484  v15.38086L72.55664,51.2041z" />
      </svg>
    );
  }

  renderToolbar() {
    if (!this.props.mobile) return;
    return (
      <Flex className="toolbar--mobile" vAlignContent="center">
        <Link to={'/'}>Down for a Cross</Link> {this.renderGameButton()}
      </Flex>
    );
  }

  renderChatHeader() {
    if (this.props.header) return this.props.header;
    const {info = {}, bid} = this.props;
    const {title, author, type} = info;

    return (
      <div className="chat--header">
        <div className="chat--header--title">{title}</div>

        <div className="chat--header--subtitle">{type && `${type} | By ${author}`}</div>

        {bid && <div className="chat--header--subtitle">Battle {bid}</div>}
      </div>
    );
  }

  renderUsernameInput() {
    return this.props.hideChatBar ? null : (
      <div className="chat--username">
        {'You are '}
        <EditableSpan
          ref={this.usernameInput}
          className="chat--username--input"
          mobile={this.props.mobile}
          value={this.state.username}
          onChange={this.handleChangeUsername}
          onBlur={this.handleBlur}
          onUnfocus={this.focus}
        />
      </div>
    );
  }

  renderUsersPresent() {
    return this.props.hideChatBar ? null : (
      <div className="chat--users-present">
        {messages.map((message, i) => (
          <div key={i}>{this.renderMessage(message)}</div>
        ))}
        {'You are '}
        <EditableSpan
          ref={this.usernameInput}
          className="chat--username--input"
          mobile={this.props.mobile}
          value={this.state.username}
          onChange={this.handleChangeUsername}
          onBlur={this.handleBlur}
          onUnfocus={this.focus}
        />
      </div>
    );
  }

  renderChatBar() {
    if (this.props.hideChatBar) {
      return null;
    }
    return (
      <ChatBar
        ref={this.chatBar}
        mobile={this.props.mobile}
        placeHolder="[Enter] to chat"
        onSendMessage={this.handleSendMessage}
        onUnfocus={this.handleUnfocus}
      />
    );
  }

  renderMessageSender(name, color) {
    const style = color && {
      color,
    };
    return (
      <span className="chat--message--sender" style={style}>
        {name}
      </span>
    );
  }

  renderMessageText(text) {
    const words = text.split(' ');
    const tokens = [];
    words.forEach((word) => {
      if (word.length === 0) return;
      if (word.startsWith(':') && word.endsWith(':')) {
        const emoji = word.substring(1, word.length - 1);
        const emojiData = emojiLib.get(emoji);
        if (emojiData) {
          tokens.push({
            type: 'emoji',
            data: emoji,
          });
          return;
        }
      }

      if (word.startsWith('@')) {
        const pattern = word.substring(1);
        if (pattern.match(/^\d+-?\s?(a(cross)?|d(own)?)$/i)) {
          tokens.push({
            type: 'clueref',
            data: '@' + pattern,
          });
          return;
        }
      }

      if (tokens.length && tokens[tokens.length - 1].type === 'text') {
        tokens[tokens.length - 1].data += ' ' + word;
      } else {
        tokens.push({
          type: 'text',
          data: word,
        });
      }
    });

    const bigEmoji = tokens.length <= 3 && _.every(tokens, (token) => token.type === 'emoji');
    return (
      <span className={'chat--message--text'}>
        {tokens.map((token, i) => (
          <React.Fragment key={i}>
            {token.type === 'emoji' ? (
              <Emoji emoji={token.data} big={bigEmoji} />
            ) : token.type === 'clueref' ? (
              token.data // for now, don't do anything special to cluerefs
            ) : (
              token.data
            )}
            {token.type !== 'emoji' && ' '}
          </React.Fragment>
        ))}
      </span>
    );
  }

  renderMessage(message) {
    const {text, senderId: id, isOpponent} = message;
    const big = text.length <= 10 && isEmojis(text);
    const color = this.getMessageColor(id, isOpponent);

    this.props.updateSeenChatMessage && this.props.updateSeenChatMessage(message);
    return (
      <div className={'chat--message' + (big ? ' big' : '')}>
        {this.renderMessageSender(message.sender, color)}
        {':'}
        {this.renderMessageText(message.text)}
      </div>
    );
  }

  renderMobileKeyboard() {
    if (!this.props.mobile) {
      return;
    }

    return (
      <Flex shrink={0}>
        <MobileKeyboard layout="uppercase" />
      </Flex>
    );
  }

  render() {
    const messages = this.mergeMessages(this.props.data, this.props.opponentData);

    return (
      <Flex column grow={1}>
        {this.renderToolbar()}
        <div className="chat">
          {this.renderChatHeader()}
          {this.renderUsernameInput()}
          {this.renderUsersPresent()}
          <div
            ref={(el) => {
              if (el) {
                el.scrollTop = el.scrollHeight;
              }
            }}
            className="chat--messages"
          >
            {messages.map((message, i) => (
              <div key={i}>{this.renderMessage(message)}</div>
            ))}
          </div>

          {this.renderChatBar()}
        </div>
        {this.renderMobileKeyboard()}
      </Flex>
    );
  }
}
