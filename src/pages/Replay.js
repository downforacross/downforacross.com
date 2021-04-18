/* eslint react/no-string-refs: "warn" */
// eslint-disable-next-line max-classes-per-file
import './css/replay.css';
import React, {Component} from 'react';
import Flex from 'react-flexview';
import {Helmet} from 'react-helmet';
import _ from 'lodash';
import {GameModel} from '../store';

import HistoryWrapper from '../lib/wrappers/HistoryWrapper';
import Player from '../components/Player';
import Chat from '../components/Chat';
import Nav from '../components/common/Nav';
import {toArr, pure, isAncestor} from '../lib/jsUtils';

const SCRUB_SPEED = 50; // 30 actions per second

const TIMELINE_COLORS = {
  updateCell: '#9999FFC0',
  updateCursor: '#00000030',
  reveal: '#EE0000C0',
  check: '#EE000050',
  updateClock: '#0000EE80',
  chat: '#00EEEE80',
  create: '#00000080',
};
const TIMELINE_BACKGROUND_COLOR = '#00000005';

const TimelineBar = ({type}) => {
  const color = TIMELINE_COLORS[type];
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: color,
      }}
    />
  );
};

// a pure arrow function component, so bars aren't re-computed every time
const TimelineBars = pure(({history, begin, units}) => (
  <div>
    {history.map(({timestamp, type}, i) => (
      <div
        key={i}
        style={{
          left: (timestamp - begin) * units,
          position: 'absolute',
          width: 2,
          height: 40,
        }}
      >
        <TimelineBar type={type} />
      </div>
    ))}
  </div>
));

class Timeline extends React.PureComponent {
  get begin() {
    const {history} = this.props;
    return history[0].timestamp;
  }

  get end() {
    const {history} = this.props;
    return history[history.length - 1].timestamp;
  }

  get units() {
    const length = this.end - this.begin;
    const maxWidth = 10000;
    const minWidth = 400;
    return Math.min(
      maxWidth / length,
      Math.max(
        0.01, // 1 second = 10 pixel
        minWidth / length
      )
    );
  }

  componentDidUpdate() {
    this.updateScroll();
  }

  renderCursor() {
    const {position} = this.props;
    return (
      <div
        ref="cursor"
        style={{
          position: 'absolute',
          left: (position - this.begin) * this.units - 5,
          top: 15,
          backgroundColor: '#000000',
          borderRadius: 5,
          width: 10,
          height: 10,
        }}
      />
    );
  }

  handleMouse = (e) => {
    const {onSetPosition} = this.props;
    if (!this.refs.timeline) return;
    e = e.nativeEvent;
    let x = e.offsetX;
    let node = e.target;
    while (node !== this.refs.timeline) {
      x += node.offsetLeft;
      node = node.parentElement;
    }

    let position = x / this.units + this.begin;
    position = Math.min(this.end, Math.max(this.begin, position));
    onSetPosition(position);
  };

  handleMouseDown = (e) => {
    this.down = true;
    this.handleMouse(e);
  };

  handleMouseOut = (e) => {
    if (!isAncestor(this.refs.timeline, e.nativeEvent.relatedTarget)) {
      this.down = false;
    }
  };

  handleMouseUp = () => {
    this.down = false;
  };

  handleMouseMove = (e) => {
    if (!this.down) {
      return;
    }

    this.handleMouse(e);
  };

  updateScroll = _.throttle(() => {
    if (!this.refs.scrollContainer || !this.refs.cursor || !this.refs.timeline) {
      return;
    }
    const center = this.refs.cursor.offsetLeft;

    // scroll minimally so that the center is visible with 5px padding
    const padding = 5;
    const lo = Math.min(
      this.refs.timeline.clientWidth - this.refs.scrollContainer.clientWidth,
      center - this.refs.scrollContainer.clientWidth + padding
    );
    const hi = Math.max(0, center - padding);

    let scrollLeft = this.refs.scrollContainer.scrollLeft;
    scrollLeft = Math.max(lo, Math.min(hi, scrollLeft));
    this.refs.scrollContainer.scrollLeft = scrollLeft;
  }, 50);

  render() {
    const {history} = this.props;

    return (
      <div
        key="abc"
        ref="scrollContainer"
        style={{
          overflowX: 'auto',
          width: 600,
        }}
      >
        <div
          ref="timeline"
          style={{
            position: 'relative',
            height: 40,
            width: (this.end - this.begin) * this.units,
            backgroundColor: TIMELINE_BACKGROUND_COLOR,
            cursor: 'pointer',
          }}
          onMouseDown={this.handleMouseDown}
          onMouseOut={this.handleMouseOut}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
        >
          <TimelineBars history={history} begin={this.begin} units={this.units} />
          {this.renderCursor()}
        </div>
      </div>
    );
  }
}

export default class Replay extends Component {
  constructor() {
    super();
    this.state = {
      history: [],
      filteredHistory: [],
      position: 0,
    };
    this.followCursor = -1;
    this.historyWrapper = null;
  }

  handleSetPosition = (position) => {
    this.setState({position});
  };

  get gid() {
    return this.props.match.params.gid;
  }

  get game() {
    // compute the game state corresponding to current playback time
    const {position} = this.state;
    if (!this.historyWrapper || !this.historyWrapper.ready) return null;
    return this.historyWrapper.getSnapshotAt(position);
  }

  recomputeHistory = () => {
    const history = [this.historyWrapper.createEvent, ...this.historyWrapper.history];
    const filteredHistory = history.filter((event) => event.type !== 'updateCursor' && event.type !== 'chat');
    const position = this.state.position || history[0].timestamp;
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
    this.screenWidth = window.innerWidth;
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

  scrubLeft = ({shift = false} = {}) => {
    const {position, history, filteredHistory} = this.state;
    const events = shift ? filteredHistory : history;
    const index = _.findLastIndex(events, (event) => event.timestamp < position);
    if (!this.state.left) {
      this.setState({
        left: true,
      });
    }
    if (index === -1) return;
    this.setState({
      position: events[index].timestamp,
    });
  };

  scrubRight = ({shift = false} = {}) => {
    const {position, history, filteredHistory} = this.state;
    const events = shift ? filteredHistory : history;
    const index = _.findIndex(events, (event) => event.timestamp > position);
    if (!this.state.right) {
      this.setState({
        right: true,
      });
    }
    if (index === -1) return;
    this.setState({
      position: events[index].timestamp,
    });
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
    if (!this.game || this.state.error) {
      return null;
    }

    const {clock} = this.game;

    function pad2(num) {
      let s = `${100}${num}`;
      s = s.substr(s.length - 2);
      return s;
    }
    const millis = clock.totalTime;
    let secs = Math.floor(millis / 1000);
    let mins = Math.floor(secs / 60);
    secs %= 60;
    const hours = Math.floor(mins / 60);
    mins %= 60;
    const str = `${(hours ? `${hours}:` : '') + pad2(mins)}:${pad2(secs)}`;

    return (
      <div
        style={{
          marginLeft: 260,
        }}
      >
        {str}
      </div>
    );
  }

  renderPlayer() {
    if (this.state.error) {
      return <div>Error loading replay</div>;
    }
    if (!this.game) {
      return <div>Loading...</div>;
    }

    const {grid, circles, shades, cursors, clues, solved} = this.game;
    const screenWidth = this.screenWidth;
    const cols = grid[0].length;
    const rows = grid.length;
    const width = Math.min((35 * 15 * cols) / rows, screenWidth);
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
        mobile={false}
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
    const {position, history, left, right} = this.state;

    // renders the controls / state
    return (
      <div
        ref="controls"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          padding: 5,
          outline: 'none',
        }}
        tabIndex="1"
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
      >
        <div className="scrub--container">
          <div
            ref="scrubLeft"
            className={`scrub ${left ? 'active' : ''}`}
            onMouseDown={this.handleMouseDownLeft}
            onMouseUp={this.handleMouseUpLeft}
            onMouseLeave={this.handleMouseUpLeft}
          >
            {'<<'}
          </div>
        </div>
        {history.length > 0 ? (
          <Timeline history={history} position={position} onSetPosition={this.handleSetPosition} />
        ) : null}
        <div className="scrub--container">
          <div
            ref="scrubRight"
            className={`scrub ${right ? 'active' : ''}`}
            onMouseDown={this.handleMouseDownRight}
            onMouseUp={this.handleMouseUpRight}
            onMouseLeave={this.handleMouseUpRight}
          >
            {'>>'}
          </div>
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
        <Nav v2 />
        <Helmet>
          <title>{`Replay ${this.gid}: ${this.getPuzzleTitle()}`}</title>
        </Helmet>
        <div
          style={{
            paddingLeft: 30,
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          {this.renderHeader()}
        </div>
        <div
          style={{
            padding: 10,
            border: '1px solid #E2E2E2',
          }}
        >
          {this.renderToolbar()}
          <div
            style={
              {
                // flex: 1,
              }
            }
          >
            {this.renderControls()}
          </div>
        </div>
        <Flex style={{padding: 20}}>
          {this.renderPlayer()}
          {/* {this.renderChat()} */}
        </Flex>
        {/* Controls:
      Playback scrubber
      Playback speed toggle
      Skip inactivity checkbox */}
      </Flex>
    );
  }
}
