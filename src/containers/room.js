import './room.css';
import actions, { db } from '../actions';
import Player from '../components/player';
import Chat from '../components/chat';
import Toolbar from '../components/toolbar';
import { isSolved } from '../gameUtils';
import { toArr, lazy, rand_int, rand_color } from '../jsUtils';

import React, { Component } from 'react';

const CURSOR_EXPIRE = 1000 * 60; // 20 seconds
export default class Room extends Component {
  constructor() {
    super();
    this.state = {
      uid: 0,
      game: {
        gid: undefined,
        name: undefined,
        info: undefined,
        clues: {
          across: [],
          down: [],
        },
        solution: [['']],
        grid: [[{
          black: false,
          number: 1,
          edits: [],
          value: '',
          parents: {
            across: 1,
            down: 1
          }
        }]],
        createTime: undefined,
        startTime: undefined,
        chat: {
          users: [],
          messages: [],
        },
        circles: []
      }
    };
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
    this.state.game.grid[r][c] = fn(this.state.game.grid[r][c]);
    //this.forceUpdate();
  }

  cursorTransaction(fn, cbk) {
    db.ref('cursors/' + this.props.match.params.gid).transaction(fn, cbk);
  }

  checkIsSolved() {
    if (isSolved(this.state.game.grid, this.state.game.solution)) {
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
    this.transaction(game => (
      Object.assign(game, {
        chat: Object.assign(game && game.chat || {}, {
          messages: (game.chat && game.chat.messages || []).concat([
            {
              sender: sender,
              text: text
            }
          ])
        })
      })
    ));
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

  renderChat() {
    return (
      <Chat
        chat={this.state.game.chat || {messages: [], users: []}}
        onSendChatMessage={this.sendChatMessage.bind(this)} />
    );
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
            onPauseClock={this.pauseClock.bind(this)}
            onStartClock={this.startClock.bind(this)}
            onCheck={this.check.bind(this)}
            onReveal={this.reveal.bind(this)}
            onReset={this.reset.bind(this)}
            onResetClock={this.resetClock.bind(this)}
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
            updateGrid={this.updateGrid.bind(this)}
            updateCursor={this.updateCursor.bind(this)} />

          {this.renderChat()}
        </div>
      </div>
    );
  }
};
