import './css/game.css';
import { db, getTime } from '../actions';
import Player from '../components/player';
import Chat from '../components/chat';
import Toolbar from '../components/toolbar';
import GridObject from '../utils/Grid';
import { makeEmptyGame } from '../gameUtils';
import { toArr, lazy, rand_int, rand_color } from '../jsUtils';

import { Helmet } from 'react-helmet';
import React, { Component } from 'react';

const CURSOR_EXPIRE = 1000 * 60; // 20 seconds

function ToggleMobile({ mobile, onClick }) {
  return (
    <a
      className='toggle-mobile'
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
    >
      { mobile
          ? <i className="fa fa-mobile fa-lg" aria-hidden="true"/>
          : <i className="fa fa-desktop" aria-hidden="true"/>
      }
    </a>
  );
}

function Header({ mobile, info }) {
  const { title, author, type } = info || {};
  if (mobile) {
    return (
      <div className='header'>
      </div>
    );
  }
  return (
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
}

function isMobile() {
  if (navigator.userAgent.match(/Tablet|iPad/i))
  {
    // do tablet stuff
    return true;
  } else if(navigator.userAgent.match(/Mobile|Windows Phone|Lumia|Android|webOS|iPhone|iPod|Blackberry|PlayBook|BB10|Opera Mini|\bCrMo\/|Opera Mobi/i) )
  {
    // do mobile stuff
    return true;
  } else {
    // do desktop stuff
    return false;
  }
}


export default class Game extends Component {

  constructor() {
    super();
    // window.innerWidth changes when pinch-zooming on mobile.
    // compute it here so the grid doesn't go crazy
    this.screenWidth = window.innerWidth;

    this.state = {
      uid: 0,
      game: makeEmptyGame(),
      mobile: isMobile(),
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
    this._toggleMobile = this.toggleMobile.bind(this);
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
          stopTime: game.stopTime || getTime(),
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
    const { game } = this.state;
    let updateFn = cursors => {
      let updatedAt = getTime();
      cursors = cursors || [];
      cursors = cursors.filter(({id}) => id !== this.id);
      cursors.push({
        id: this.id,
        color: this.color,
        r: r,
        c: c,
        updatedAt: updatedAt
      });
      if (!game.solved) {
        // don't expire anyone's cursors after game over
        cursors = cursors.filter(({updatedAt}) => updatedAt >= getTime() - CURSOR_EXPIRE);
      }
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
          time: getTime(),
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
          getTime())
      }))
    );
  }

  pauseClock() {
    if (this.state.game.stopTime) return;
    this.transaction(game => (
      Object.assign(game, {
        startTime: null,
        pausedTime: (game.pausedTime || 0) + getTime() - (game.startTime || 0)
      }))
    );
  }

  stopClock() {
    this.transaction(game => (
      Object.assign(game, {
        stopTime: getTime()
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
    this.refs.chat && this.refs.chat.focus();
  }

  focusGame() {
    this.refs.game && this.refs.game.focus();
  }

  // overrided in the Solo component, which extends Room
  shouldRenderChat() {
    return true;
  }

  getPuzzleTitle() {
    if (!this.state.game || !this.state.game.info) return '';
    return this.state.game.info.title;
  }

  toggleMobile() {
    const { mobile } = this.state;
    this.setState({
      mobile: !mobile,
    });
  }

  render() {

    const {
      game,
      mobile,
    } = this.state;
    const { grid } = game;
    const screenWidth = this.screenWidth;
    const width = Math.min(35 * 15, screenWidth);
    let size = width / grid[0].length;

    return (
      <div className={'room ' + (mobile ? 'mobile' : '')}>
        <Helmet>
          <title>{this.getPuzzleTitle()}</title>
        </Helmet>
        <div className='room--header'>
          <Header
            mobile={mobile}
            info={game.info}
          />
        </div>

        <div className='room--toolbar'>
          <Toolbar
            mobile={mobile}
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
            shades={this.state.game.shades}
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
            mobile={mobile}
          />
          <div className='room--chat'>
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

          <ToggleMobile
            mobile={mobile}
            onClick={this._toggleMobile}
          />

      </div>
    </div>
    );
  }
};
