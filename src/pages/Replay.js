/* eslint react/no-string-refs: "warn" */
// eslint-disable-next-line max-classes-per-file
import './css/replay.css';
import React, {Component} from 'react';
import Flex from 'react-flexview';
import {Helmet} from 'react-helmet';
import {MdPlayArrow, MdPause, MdFastForward, MdFastRewind} from 'react-icons/md';
import _ from 'lodash';

import {GameModel} from '../store';

import HistoryWrapper from '../lib/wrappers/HistoryWrapper';
import Player from '../components/Player';
import Chat from '../components/Chat';
import Nav from '../components/common/Nav';
import {Timeline} from '../components/Timeline/Timeline';
import {isMobile, toArr} from '../lib/jsUtils';
import Toolbar from '../components/Toolbar';

const SCRUB_SPEED = 50; // 30 actions per second
const AUTOPLAY_SPEEDS = localStorage.premium ? [1, 10, 100, 1000] : [1, 10, 100];

const formatTime = (seconds) => {
  const hr = Math.floor(seconds / 3600);
  const min = Math.floor((seconds - hr * 3600) / 60);
  const sec = Math.floor(seconds - hr * 3600 - min * 60);
  if (hr) {
    return `${hr}:${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
  }
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};
export default class Replay extends Component {
  constructor() {
    super();
    this.state = {
      history: [],
      filteredHistory: [],
      position: 0,
      positionToRender: 0,
      autoplayEnabled: false,
      autoplaySpeed: 10,
      colorAttributionMode: false,
      listMode: false,
    };
    this.followCursor = -1;
    this.historyWrapper = null;
  }

  handleSetPosition = (position, isAutoplay = false) => {
    this.setState({position});
    this.setPositionToRender(position);
    if (!isAutoplay && this.state.autoplayEnabled) {
      this.setState({
        autoplayEnabled: false,
      });
    }
  };

  setPositionToRender = _.throttle((positionToRender) => {
    this.setState({positionToRender});
    this.refs.controls.focus();
  }, 200);

  get gid() {
    return this.props.match.params.gid;
  }

  get game() {
    // compute the game state corresponding to current playback time
    const {positionToRender} = this.state;
    if (!this.historyWrapper || !this.historyWrapper.ready) return null;
    return this.historyWrapper.getSnapshotAt(positionToRender);
  }

  recomputeHistory = () => {
    const history = [this.historyWrapper.createEvent, ...this.historyWrapper.history];
    const filteredHistory = history.filter((event) => event.type !== 'updateCursor' && event.type !== 'chat');
    const position = this.state.position || history[0].gameTimestamp;
    this.setState({
      history,
      filteredHistory,
      position,
    });
  };

  debouncedRecomputeHistory = _.debounce(this.recomputeHistory);

  componentDidMount() {
    this.gameModel = new GameModel(`/game/${this.gid}`);
    this.historyWrapper = new HistoryWrapper();
    this.gameModel.on('wsEvent', (event) => {
      this.historyWrapper.addEvent(event);
      this.debouncedRecomputeHistory();
    });
    this.gameModel.on('wsCreateEvent', (event) => {
      this.historyWrapper.setCreateEvent(event);
      this.debouncedRecomputeHistory();
    });
    this.gameModel.attach();

    // compute it here so the grid doesn't go crazy
    this.screenWidth = window.innerWidth - 1;
    if (this.refs.controls) {
      setTimeout(() => {
        this.refs.controls.focus();
      }, 100);
    }

    this.autoplayInterval = setInterval(() => {
      if (this.state.autoplayEnabled && this.state.history.length > 0) {
        if (this.state.position < this.state.history[this.state.history.length - 1].gameTimestamp) {
          this.handleSetPosition(this.state.position + 100 * this.state.autoplaySpeed, true);
        } else {
          this.setState({autoplayEnabled: false});
        }
      }
    }, 100);
  }

  componentWillUnmount() {
    clearInterval(this.autoplayInterval);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.position !== this.state.position) {
      if (!this.refs.game) return;
      if (!this.game.cursors) return;
      const gameCursors = this.game.cursors;
      if (this.followCursor === -1) {
        // follow a random cursor in the beginning
        if (gameCursors.length > 0) {
          this.followCursor = gameCursors[0].id;
        }
      }

      if (this.followCursor !== undefined) {
        const gameCursors = this.game.cursors;
        const cursor = _.find(gameCursors, (cursor) => cursor.id === this.followCursor);
        if (cursor) {
          this.refs.game.setSelected({
            r: cursor.r,
            c: cursor.c,
          });
        }
      }
    }
  }

  setDirection = (direction, value) => {
    this.setState({
      [direction]: value,
    });
  };

  focus = () => {
    if (this.refs.controls) {
      this.refs.controls.focus();
    }
  };

  handleUpdateCursor = ({r, c}) => {
    const gameCursors = this.game.cursors;
    const cursor = _.find(gameCursors, (cursor) => cursor.r === r && cursor.c === c);
    if (cursor !== undefined) {
      this.followCursor = cursor.id;
    } else {
      this.followCursor = undefined;
    }
  };

  handleMouseDownLeft = (e) => {
    e.preventDefault();
    this.focus();
    clearInterval(this.interval);
    this.interval = setInterval(this.scrubLeft, 1000 / SCRUB_SPEED);
  };

  handleMouseDownRight = (e) => {
    e.preventDefault();
    this.focus();
    clearInterval(this.interval);
    this.interval = setInterval(this.scrubRight, 1000 / SCRUB_SPEED);
  };

  handleMouseUpLeft = () => {
    clearInterval(this.interval);
    this.setState({left: false});
  };

  handleMouseUpRight = () => {
    clearInterval(this.interval);
    this.setState({right: false});
  };

  handleKeyDown = (e) => {
    e.preventDefault();
    const shift = e.shiftKey;
    if (e.key === 'ArrowLeft') {
      this.scrubLeft({shift});
    } else if (e.key === 'ArrowRight') {
      this.scrubRight({shift});
    } else if (e.key === ' ') {
      this.setState({
        autoplayEnabled: !this.state.autoplayEnabled,
      });
    }
  };

  handleKeyUp = (e) => {
    e.preventDefault();
    if (e.key === 'ArrowLeft') {
      this.setState({left: false});
    } else if (e.key === 'ArrowRight') {
      this.setState({right: false});
    }
  };

  handleToggleAutoplay = (e) => {
    this.setState({
      autoplayEnabled: !this.state.autoplayEnabled,
    });
  };

  scrubLeft = ({shift = false} = {}) => {
    const {position, history, filteredHistory} = this.state;
    const events = shift ? filteredHistory : history;
    const index = _.findLastIndex(events, (event) => event.gameTimestamp < position);
    if (!this.state.left) {
      this.setState({
        left: true,
      });
    }
    if (index === -1) return;
    this.handleSetPosition(events[index].gameTimestamp);
  };

  scrubRight = ({shift = false} = {}) => {
    const {position, history, filteredHistory} = this.state;
    const events = shift ? filteredHistory : history;
    const index = _.findIndex(events, (event) => event.gameTimestamp > position);
    if (!this.state.right) {
      this.setState({
        right: true,
      });
    }
    if (index === -1) return;
    this.handleSetPosition(events[index].gameTimestamp);
    // this.setState({
    //   position: events[index].gameTimestamp,
    // });
  };

  renderHeader() {
    if (!this.game || this.state.error) {
      return null;
    }
    const {title, author, type} = this.game.info;
    return (
      <div>
        <div className="header--title">{title}</div>

        <div className="header--subtitle">{type && `${type} | By ${author}`}</div>
      </div>
    );
  }

  renderToolbar() {
    if (!this.game) return;
    const {clock, solved} = this.game;
    const {totalTime} = clock;
    return (
      <Toolbar
        v2
        replayMode
        gid={this.props.gid}
        mobile={isMobile()}
        pausedTime={totalTime}
        colorAttributionMode={this.state.colorAttributionMode}
        listMode={this.state.listMode}
        onToggleColorAttributionMode={() => {
          this.setState((prevState) => ({colorAttributionMode: !prevState.colorAttributionMode}));
        }}
        onToggleListView={() => {
          this.setState((prevState) => ({
            listMode: !prevState.listMode,
          }));
        }}
      />
    );
  }

  renderPlayer() {
    if (this.state.error) {
      return <div>Error loading replay</div>;
    }
    if (!this.game) {
      return <div>Loading...</div>;
    }

    const {grid, circles, shades, cursors, clues, solved, users} = this.game;
    const screenWidth = this.screenWidth;
    const cols = grid[0].length;
    const rows = grid.length;
    const width = Math.min((35 * 15 * cols) / rows, screenWidth - 20);
    const size = width / cols;
    return (
      <Player
        ref="game"
        size={size}
        grid={grid}
        circles={circles}
        shades={shades}
        clues={{
          across: toArr(clues.across),
          down: toArr(clues.down),
        }}
        cursors={cursors}
        frozen={solved}
        myColor={this.color}
        updateGrid={_.noop}
        updateCursor={this.handleUpdateCursor}
        onPressEnter={_.noop}
        mobile={isMobile()}
        users={users}
        colorAttributionMode={this.state.colorAttributionMode}
        listMode={this.state.listMode}
      />
    );
  }

  renderChat() {
    if (this.state.error || !this.game) {
      return null;
    }

    return (
      <div className="replay--chat">
        <Chat ref="chat" info={this.game.info} data={this.game.chat} colors={this.game.colors} hideChatBar />
      </div>
    );
  }

  renderControls() {
    const {position, history, left, right, autoplayEnabled} = this.state;
    const width = isMobile() ? this.screenWidth - 20 : 1000;

    // renders the controls / state
    return (
      <div
        ref="controls"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 10,
          outline: 'none',
          width,
        }}
        tabIndex="1"
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
      >
        {history.length > 0 ? (
          <Timeline
            width={width}
            history={history}
            position={position}
            onSetPosition={this.handleSetPosition}
          />
        ) : null}
        <div className="replay--control-icons">
          <MdFastRewind
            ref="scrubLeft"
            className={`scrub ${left ? 'active' : ''}`}
            onMouseDown={this.handleMouseDownLeft}
            onMouseUp={this.handleMouseUpLeft}
            onMouseLeave={this.handleMouseUpLeft}
          />
          <div className="scrub--autoplay" onClick={this.handleToggleAutoplay}>
            {autoplayEnabled && <MdPause />}
            {!autoplayEnabled && <MdPlayArrow />}
          </div>
          <MdFastForward
            ref="scrubRight"
            className={`scrub ${right ? 'active' : ''}`}
            onMouseDown={this.handleMouseDownRight}
            onMouseUp={this.handleMouseUpRight}
            onMouseLeave={this.handleMouseUpRight}
          />
        </div>
        <div className="replay--time">
          {history.length > 0 && (
            <div>
              {formatTime(position / 1000)} / {formatTime(_.last(history).gameTimestamp / 1000)}
            </div>
          )}
        </div>
        <div className="scrub--speeds">
          {AUTOPLAY_SPEEDS.map((speed) => (
            <div
              className={`scrub--speed--option${speed === this.state.autoplaySpeed ? ' selected' : ''}`}
              onClick={() => {
                this.setState({autoplaySpeed: speed});
              }}
              key={speed}
            >
              {speed}x
            </div>
          ))}
        </div>
      </div>
    );
  }

  getPuzzleTitle() {
    const game = this.game;
    if (!game || !game.info) return '';
    return game.info.title;
  }

  render() {
    return (
      <Flex column className="replay">
        {!isMobile() && <Nav v2 />}
        <Helmet>
          <title>{`Replay ${this.gid}: ${this.getPuzzleTitle()}`}</title>
        </Helmet>
        {!isMobile() && (
          <div
            style={{
              paddingLeft: 30,
              paddingTop: 20,
              paddingBottom: 20,
            }}
          >
            {this.renderHeader()}
          </div>
        )}
        {this.renderToolbar()}
        <Flex
          grow={1}
          column
          style={{
            padding: isMobile() ? 0 : 10,
            border: '1px solid #E2E2E2',
          }}
        >
          <Flex grow={1} style={{padding: isMobile() ? 0 : 20}}>
            {this.renderPlayer()}
          </Flex>
          <div
            style={{
              zIndex: 1,
              // flex: 1,
            }}
          >
            {this.renderControls()}
          </div>
        </Flex>
        {/* Controls:
      Playback scrubber
      Playback speed toggle
      Skip inactivity checkbox */}
      </Flex>
    );
  }
}
