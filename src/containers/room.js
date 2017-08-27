import './room.css';
import { db } from '../actions';
import Player from '../components/player';
import Chat from '../components/chat';
import Toolbar from '../components/toolbar';
import GridObject from '../utils/Grid';
import { makeEmptyGame } from '../gameUtils';
import { toArr, lazy, rand_int, rand_color } from '../jsUtils';

import React, { Component } from 'react';

const CURSOR_EXPIRE = 1000 * 60; // 20 seconds

export default class Room extends Component {

  constructor() {
    super();
    this.state = {
      uid: 0,
      game: makeEmptyGame()
    };

    this._sendChatMessage = this.sendChatMessage.bind(this);
    this._focusChat = this.focusChat.bind(this);
    this._focusGame = this.focusGame.bind(this);
    this._updateCursor = this.updateCursor.bind(this);
    this._updateGrid = this.updateGrid.bind(this);
    this._resetClock = this.resetClock.bind(this);
    this._reset = this.reset.bind(this);
    this._reveal = this.reveal.bind(this);
    this._check = this.check.bind(this);
    this._startClock = this.startClock.bind(this);
    this._pauseClock = this.pauseClock.bind(this);
  }

  get grid() {
    return new GridObject(this.state.game.grid);
  }

  componentDidMount() {
    this.color = rand_color();
    this.id = rand_int(1, 1000000000);
    db.ref('game/' + this.props.match.params.gid).on('value', game => {
      lazy('updateGame', () => {
        this.setState({
          game: game.val()
        });
      });
    });
    db.ref('cursors/' + this.props.match.params.gid).on('value', cursors => {
      lazy('updateCursors', () => {
        this.setState({
          cursors: cursors.val()
        });
      });
    });
  }

  componentWillUnmount() {
    db.ref('game/' + this.props.match.params.gid).off();
  }

  transaction(fn, cbk) {
    db.ref('game/' + this.props.match.params.gid).transaction(fn, cbk);
  }

  cellTransaction(r, c, fn, cbk) {
    db.ref('game/' + this.props.match.params.gid + '/grid/' + r + '/' + c).transaction(fn, cbk);
    // TODO: hack to get around setting this.state, but mutates existing grid.
    const grid = this.state.game.grid;
    grid[r][c] = fn(grid[r][c])
    this.setState({
      game: { ...this.state.game, grid }
    });
  }

  cursorTransaction(fn, cbk) {
    db.ref('cursors/' + this.props.match.params.gid).transaction(fn, cbk);
  }

  checkIsSolved() {
    if (this.grid.isSolved(this.state.game.solution)) {
      this.transaction(game => (
        Object.assign(game, {
          solved: true,
          stopTime: game.stopTime || new Date().getTime()
        })
      ));
      return true;
    } else {
      if (this.state.game.solved) {
        this.transaction(game => (
          Object.assign(game, {
            solved: false
          })
        ));
      }
      return false;
    }
  }

  updateCursor({r, c}) {
    if (!this.color || !this.id) return;
    let updateFn = cursors => {
      let updatedAt = new Date().getTime();
      cursors = cursors || [];
      cursors = cursors.filter(({id}) => id !== this.id);
      cursors.push({
        id: this.id,
        color: this.color,
        r: r,
        c: c,
        updatedAt: updatedAt
      });
      cursors = cursors.filter(({updatedAt}) => updatedAt >= new Date().getTime() - CURSOR_EXPIRE);
      return cursors;
    };
    this.setState({
      cursors: updateFn(this.state.cursors)
    });
    this.cursorTransaction(updateFn);
  }

  updateGrid(r, c, value) {
    if (this.checkIsSolved()) {
      return;
    }
    if (this.state.game.grid[r][c].good) {
      return; // good squares are locked
    }

    function takeLast(num, ar) {
      return ar.length > num ? ar.slice(ar.length - num) : ar;
    }

    this.cellTransaction(r, c, cell => (
      Object.assign(cell, {
        edits: takeLast(10, [...(cell.edits || []), {
          time: new Date().getTime(),
          value: value
        }]),
        value: value,
        bad: false,
        good: false,
      })
    ), () => {
      this.checkIsSolved();
    });

    this.startClock();
  }

  sendChatMessage(sender, text) {
    this.transaction(game => {
      game = game || {};
      game.chat = game.chat || {};
      game.chat.messages = game.chat.messages || [];
      return ({
        ...game,
        chat: {
          ...game.chat,
          messages: [
            ...game.chat.messages,
            { sender, text }
          ]
        }
      });
    });
  }

  startClock() {
    if (this.state.game.startTime || this.state.game.stopTime) return;
    this.transaction(game => (
      Object.assign(game, {
        startTime: Math.max(game.startTime || 0,
          new Date().getTime())
      }))
    );
  }

  pauseClock() {
    if (this.state.game.stopTime) return;
    this.transaction(game => (
      Object.assign(game, {
        startTime: null,
        pausedTime: (game.pausedTime || 0) + new Date().getTime() - (game.startTime || 0)
      }))
    );
  }

  stopClock() {
    this.transaction(game => (
      Object.assign(game, {
        stopTime: new Date().getTime()
      })
    ));
  }

  resetClock() {
    this.transaction(game => {
      game.startTime = null;
      game.stopTime = null;
      game.pausedTime = null;
      return game;
    });
  }

  scope(s) {
    if (s === 'square') {
      return this.refs.game.getSelectedSquares();
    } else if (s === 'word') {
      return this.refs.game.getSelectedAndHighlightedSquares();
    } else if (s === 'puzzle') {
      return this.refs.game.getAllSquares();
    } else {
      return [];
    }
  }

  _checkSquare(cell, answer) {
    return Object.assign({}, cell, {
      good: cell.value !== '' && cell.value === answer,
      bad: cell.value !== '' && cell.value !== answer,
    });
  }

  check(scopeString) {
    this.transaction(game => {
      this.scope(scopeString).forEach(({r, c}) => {
        game.grid[r][c] = this._checkSquare(game.grid[r][c], game.solution[r][c]);
      });
      return game;
    }, () => {
    });
  }

  _revealSquare(cell, answer) {
    return Object.assign({}, cell, {
      value: answer,
      good: true,
      revealed: cell.value !== answer
    });
  }

  reveal(scopeString) {
    this.transaction(game => {
      this.scope(scopeString).forEach(({r, c}) => {
        game.grid[r][c] = this._revealSquare(game.grid[r][c], game.solution[r][c]);
      });
      return game;
    }, () => {
      this.checkIsSolved();
    });
  }

  _resetSquare(cell) {
    return Object.assign({}, cell, {
      value: '',
      good: false,
      bad: false,
      revealed: false
    });
  }

  reset(scopeString) {
    this.transaction(game => {
      this.scope(scopeString).forEach(({r, c}) => {
        game.grid[r][c] = this._resetSquare(game.grid[r][c], game.solution[r][c]);
      });
      return game;
    }, () => {
      this.checkIsSolved();
    });
  }

  focusChat() {
    console.log('focus chat');
    this.refs.chat && this.refs.chat.focus();
  }

  focusGame() {
    this.refs.game && this.refs.game.focus();
  }

  // overrided in the Solo component, which extends Room
  shouldRenderChat() {
    return true;
  }

  render() {
    const size = 35 * 15 / this.state.game.grid[0].length;
    return (
      <div className='room'>
        <div className='room--info'>
          {
            this.state.game.pid
              ? (
                <a
                  href={`/puzzle/${this.state.game.pid}`}
                  className='room--info--title'>
                  { this.state.game.info && this.state.game.info.title }
                </a>
              )
              : (
                <div
                  className='room--info--title'>
                  { this.state.game.info && this.state.game.info.title }
                </div>
              )
          }
          <div className='room--info--subtitle'>
            {
              this.state.game.info && (
                this.state.game.info.type + ' | '
                + 'By ' + this.state.game.info.author
              )
            }
          </div>
        </div>

        <div className='room--toolbar'>
          <Toolbar
            startTime={this.state.game.startTime}
            stopTime={this.state.game.stopTime}
            pausedTime={this.state.game.pausedTime}
            solved={this.state.game.solved}
            onPauseClock={this._pauseClock}
            onStartClock={this._startClock}
            onCheck={this._check}
            onReveal={this._reveal}
            onReset={this._reset}
            onResetClock={this._resetClock}
          />
        </div>

        <div className='room--game-and-chat-wrapper'>
          <Player
            ref='game'
            size={size}
            grid={this.state.game.grid}
            circles={this.state.game.circles}
            clues={{
              across: toArr(this.state.game.clues.across),
              down: toArr(this.state.game.clues.down)
            }}
            cursors={(this.state.cursors || []).filter(({id}) => id !== this.id)}
            frozen={this.state.game.solved}
            myColor={this.color}
            updateGrid={this._updateGrid}
            updateCursor={this._updateCursor}
            onPressEnter={this._focusChat}
          />

        { this.shouldRenderChat()
            ? <Chat
              ref='chat'
              chat={this.state.game.chat || {messages: [], users: []}}
              onSendChatMessage={this._sendChatMessage}
              onPressEnter={this._focusGame}
            />
            : null
        }
      </div>
    </div>
    );
  }
};
