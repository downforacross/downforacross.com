import './css/game.css';

import { getId, recordUsername } from '../auth'
import { Helmet } from 'react-helmet';
import React, { Component } from 'react';

import Player from '../components/Player';
import Chat from '../components/Chat';
import Toolbar from '../components/Toolbar';
import Nav from '../components/Nav';

import { db, getTime } from '../actions';
import userActions from '../userActions';
import GridObject from '../utils/Grid';
import { makeEmptyGame } from '../gameUtils';
import { toArr, lazy, rand_color } from '../jsUtils';

const CURSOR_EXPIRE = 1000 * 60; // 60 seconds


function ToggleMobile({ mobile, onClick }) {
  return (
    <a
      className='toggle-mobile'
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
    >
      <i className={"fa fa-mobile fa-lg" + (mobile
        ? ''
        : ' toggle-mobile--off') }
        aria-hidden="true"
      />
      <span className='separator'>
        |
      </span>
      <i className={"fa fa-desktop" + (!mobile
        ? ''
        : ' toggle-mobile--off') }
        aria-hidden="true"
      />
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
    this.game = makeEmptyGame();

    this.state = {
      uid: 0,
      mobile: isMobile(),
      cursors: {},
      game: this.game,
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
    return new GridObject(this.game.grid);
  }

  computeGid() {
    return this.props.match.params.gid;
  }

  computeColor() {
    return rand_color();
  }

  componentDidMount() {
    this.gid = this.computeGid();
    this.color = this.computeColor();
    this.id = getId();
    db.ref('game/' + this.gid).on('value', _game => {
      lazy('updateGame', () => {
        const game = _game.val() || {};
        if (this.game && game.solved && !this.game.solved) {

          userActions.markSolved(this.gid);
        }
        this.game = game;
        this.setState({ game: this.game });
      }, 200);
    });
    db.ref('cursors/' + this.gid).on('value', _cursors => {
      const cursors = _cursors.val() || {};
      lazy('updateCursors', () => {
        this.setState({ cursors });
      });
    });
  }

  componentWillUnmount() {
    db.ref('game/' + this.gid).off();
  }

  transaction(fn) {
    db.ref('game/' + this.gid).transaction(fn);
    this.game = fn(this.game);
    // do this whenever game changes
    this.setState({ game: this.game });
    userActions.joinGame(this.gid, this.game);
  }

  cellTransaction(r, c, fn) {
    db.ref('game/' + this.gid + '/grid/' + r + '/' + c).transaction(fn);
    this.game.grid[r][c] = fn(this.game.grid[r][c])
    // do this whenever game changes
    this.setState({ game: this.game });
    userActions.joinGame(this.gid, this.game);
  }

  checkIsSolved() {
    console.log('checkIsSolved', this.game);
    if (this.grid.isSolved(this.game.solution)) {
      this.transaction(game => (
        Object.assign(game, {
          grid: this.game.grid,
          solved: true,
          stopTime: game.stopTime || getTime(),
        })
      ));
      return true;
    } else {
      if (this.game.solved) {
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
    const id = this.id;
    const { cursors } = this.state;
    const color = this.color;
    const postGame = this.game.solved ? true : false;
    let updatedAt = getTime();
    if (this.game.solved) {
      updatedAt = cursors[id] && cursors[id].updatedAt;
    }
    console.log({color, r, c, updatedAt, postGame});
    if (cursors[id] || !this.game.solved) {
      db.ref(`cursors/${this.gid}/${this.id}`).set({ color, r, c, updatedAt, postGame });
    }
  }

  updateGrid(r, c, value) {
    if (this.game.solved) {
      return;
    }
    if (this.game.grid[r][c].good) {
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
    ));
    this.checkIsSolved();
    this.startClock();
  }

  sendChatMessage(username, text) {
    recordUsername(username);
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
            {
              senderId: getId(),
              sender: username,
              text,
            }
          ]
        }
      });
    });
  }

  startClock() {
    if (this.game.startTime || this.game.stopTime) return;
    this.transaction(game => (
      Object.assign(game, {
        startTime: Math.max(game.startTime || 0,
          getTime())
      }))
    );
  }

  pauseClock() {
    if (this.game.stopTime) return;
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
    });
  }

  _revealSquare(cell, answer) {
    return Object.assign({}, cell, {
      value: answer,
      good: true,
      revealed: cell.revealed || (cell.value !== answer)
    });
  }

  reveal(scopeString) {
    this.transaction(game => {
      this.scope(scopeString).forEach(({r, c}) => {
        game.grid[r][c] = this._revealSquare(game.grid[r][c], game.solution[r][c]);
      });
      return game;
    });
    this.checkIsSolved();
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
    });
    this.checkIsSolved();
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
    if (!this.game || !this.game.info) return '';
    return this.game.info.title;
  }

  toggleMobile() {
    const { mobile } = this.state;
    this.setState({
      mobile: !mobile,
    }, () => {
      window.scrollTo(0, 0);
    });
  }

  getCursors() {
    const { cursors } = this.state;
    if (Array.isArray(cursors)) return [];
    let cursorArray = Object.keys(cursors || {})
      .map(id => ({
        ...cursors[id],
        id,
      }));
    if (cursorArray.length > 0) {
      const lastTime = Math.max(...cursorArray.map(({updatedAt = 0}) => updatedAt));
      cursorArray = cursorArray.filter(({ updatedAt, postGame }) => (
        postGame || updatedAt > lastTime - CURSOR_EXPIRE
      ));
    }
    cursorArray = cursorArray.filter(({id}) => id !== this.id);
    return cursorArray;
  }


  render() {
    const {
      game,
      mobile,
    } = this.state;

    if (!game || !game.grid) {
      this.gameDoesNotExist();
      return (
        <div className='room'>
          <Nav
            mobile={mobile}
          />
          <div
            style={{
            }}
          >
            Loading your puzzle...
          </div>
        </div>
      );
    }

    const { grid } = game;
    const screenWidth = this.screenWidth;
    const width = Math.min(35 * 15, screenWidth);
    let size = width / grid[0].length;

    return (
      <div className={'room ' + (mobile ? 'mobile' : '')}>
        <Nav
          mobile={mobile}
        />
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
            startTime={this.game.startTime}
            stopTime={this.game.stopTime}
            pausedTime={this.game.pausedTime}
            solved={this.game.solved}
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
            grid={this.game.grid}
            circles={this.game.circles}
            shades={this.game.shades}
            clues={{
              across: toArr(this.game.clues.across),
              down: toArr(this.game.clues.down)
            }}
            cursors={this.getCursors()}
            frozen={this.game.solved}
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
                  chat={this.game.chat || {messages: [], users: []}}
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
