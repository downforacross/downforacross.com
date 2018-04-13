import './css/replay.css';

import { getId, recordUsername, registerLoginListener } from '../auth'

import GameStore from '../store/gameStore';
import Player from '../components/Player';
import Chat from '../components/Chat';
import React, { Component } from 'react';
import Nav from '../components/Nav';
import GridObject from '../utils/Grid';
import { db } from '../actions';
import { toArr, lazy, rand_color, pure, isAncestor } from '../jsUtils';
import _ from 'lodash';

const SCRUB_SPEED = 50; // 30 actions per second

const TIMELINE_COLORS = {
  'updateCell'  : '#9999FFC0',
  'updateCursor': '#00000030',
  'reveal'      : '#EE0000C0',
  'check'       : '#EE000050',
  'updateClock' : '#0000EE80',
  'chat'        : '#00EEEE80',
  'create'      : '#00000080',
};
const TIMELINE_BACKGROUND_COLOR = '#00000005';

const TimelineBar = ({
  type,
}) => {
  const color = TIMELINE_COLORS[type];
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: color,
    }}/>
  );
};

// a pure arrow function component, so bars aren't re-computed every time
const TimelineBars = pure(({
  history,
  begin,
  units,
}) => {
  return (
    <div>
      {history.map(({
        timestamp,
        type,
      }, i) => (
        <div
          key={i}
          style={{
            left: (timestamp - begin) * units,
            position: 'absolute',
            width: 2,
            height: 40,
          }}
        >
          <TimelineBar
            type={type}
          />
        </div>
      ))}
    </div>
  );
});

class Timeline extends React.PureComponent {
  get begin() {
    const { history } = this.props;
    return history[0].timestamp;
  }
  get end() {
    const { history } = this.props;
    return history[history.length - 1].timestamp;
  }
  get units() {
    const length = this.end - this.begin;
    const maxWidth = 10000;
    const minWidth = 400;
    return Math.min(
      maxWidth / length, Math.max(
        0.01, // 1 second = 10 pixel
        minWidth / length,
      ));
  }

  componentDidUpdate() {
    this.updateScroll();
  }

  renderCursor() {
    const {
      position,
    } = this.props;
    return (
      <div
        ref='cursor'
        style={{
          position: 'absolute',
          left: (position - this.begin) * this.units - 5,
          top: 15,
          backgroundColor: '#000000',
          borderRadius: 5,
          width: 10,
          height: 10,
        }}>
      </div>
    );
  }

  handleMouse = (e) => {
    const { onSetPosition } = this.props;
    if (!this.refs.timeline) return;
    e = e.nativeEvent;
    let x = e.offsetX;
    let node = e.target;
    while (node !== this.refs.timeline) {
      x += node.offsetLeft;
      node = node.parentElement;
    }

    let position = x / this.units + this.begin;
    position = Math.min(
      this.end, Math.max(
        this.begin,
        position,
      ));
    onSetPosition(position);
  }

  handleMouseDown = (e) => {
    this.down = true;
    this.handleMouse(e);
  }

  handleMouseOut = (e) => {
    if (!isAncestor(this.refs.timeline, e.nativeEvent.relatedTarget)) {
      this.down = false;
    }
  }

  handleMouseUp = (e) => {
    this.down = false;
  }

  handleMouseMove = (e) => {
    if (!this.down) {
      return;
    }

    this.handleMouse(e);
  }

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
    const hi = Math.max(
      0,
      center - padding
    );

    let scrollLeft = this.refs.scrollContainer.scrollLeft;
    scrollLeft = Math.max(
      lo, Math.min(
        hi,
        scrollLeft,
      )
    );
    this.refs.scrollContainer.scrollLeft = scrollLeft;
  }, 50)

  render() {
    const {
      history,
      position,
      onSetPosition,
    } = this.props;

    let rootEl;
    return (
      <div
        key='abc'
        ref='scrollContainer'
        style={{
          overflowX: 'auto',
          width: 600,
        }}>
        <div
          ref='timeline'
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
          <TimelineBars
            history={history}
            begin={this.begin}
            units={this.units}
          />
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
      history: [
      ],
      filteredHistory: [
      ],
      position: 0,
    };
    this.gameStore = new GameStore([]);
  }

  handleSetPosition = position => {
    this.setState({position});
  }

  get gid() {
    return this.props.match.params.gid;
  }

  get game() {
    // compute the game state corresponding to current playback time
    const { history, position } = this.state;
    console.log('get game');
    return this.gameStore.getSnapshotAt(position);
  }

  componentDidMount() {
    this.historyRef = db.ref(`history/${this.gid}`)
    // compute it here so the grid doesn't go crazy
    this.screenWidth = window.innerWidth;

    this.historyRef.once('value', snapshot => {
      const history = _.values(snapshot.val());
      if (history.length > 0 && history[0].type === 'create') {
        const position = history[0].timestamp;
        this.gameStore = new GameStore(history);

        const filteredHistory = history.filter(event => (
          event.type !== 'updateCursor' &&
          event.type !== 'chat'
        ));
        this.setState({history, filteredHistory, position});
      } else {
        this.setState({
          error: true,
        });
      }
    });
  }
  setDirection = (direction, value) => {
    this.setState({
      [direction]: value,
    });
  }

  focus = () => {
    if (this.refs.controls) {
      this.refs.controls.focus();
    }
  }

  handleMouseDownLeft = (e) => {
    e.preventDefault();
    this.focus();
    clearInterval(this.interval);
    this.interval = setInterval(this.scrubLeft, 1000 / SCRUB_SPEED);
  }

  handleMouseDownRight = (e) => {
    e.preventDefault();
    this.focus();
    clearInterval(this.interval);
    this.interval = setInterval(this.scrubRight, 1000 / SCRUB_SPEED);
  }

  handleMouseUpLeft = () => {
    clearInterval(this.interval);
    this.setState({ left: false });
  }

  handleMouseUpRight = () => {
    clearInterval(this.interval);
    this.setState({ right: false });
  }

  handleKeyDown = (e) => {
    e.preventDefault();
    const shift = e.shiftKey
    if (e.key === 'ArrowLeft') {
      this.scrubLeft({shift});
    } else if (e.key === 'ArrowRight') {
      this.scrubRight({shift});
    }
  }

  handleKeyUp = (e) => {
    e.preventDefault();
    if (e.key === 'ArrowLeft') {
      this.setState({ left: false });
    } else if (e.key === 'ArrowRight') {
      this.setState({ right: false });
    }
  }

  scrubLeft = ({shift = false} = {}) => {
    const { position, history, filteredHistory } = this.state;
    const events = shift
      ? filteredHistory
      : history;
    const index = _.findLastIndex(events, (event) => (
      event.timestamp < position
    ));
    if (!this.state.left) {
      this.setState({
        left: true,
      });
    }
    if (index === -1) return;
    this.setState({
      position: events[index].timestamp,
    });
  }

  scrubRight = ({shift = false} = {}) => {
    const { position, history, filteredHistory } = this.state;
    const events = shift
      ? filteredHistory
      : history;
    const index = _.findIndex(events, (event) => (
      event.timestamp > position
    ));
    if (!this.state.right) {
      this.setState({
        right: true,
      });
    }
    if (index === -1) return;
    this.setState({
      position: events[index].timestamp,
    });
  }

  renderHeader() {
    if (!this.game || this.state.error) {
      return null;
    }
    const { title, author, type } = this.game.info;
    return (
      <div>
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

  renderToolbar() {
    if (!this.game || this.state.error) {
      return null;
    }

    const { clock } = this.game;

    function pad2(num) {
      let s = '' + 100 + num;
      s = s.substr(s.length - 2);
      return s;
    }
    const millis = clock.totalTime;
    let secs = Math.floor(millis / 1000);
    let mins = Math.floor(secs / 60); secs = secs % 60;
    let hours = Math.floor(mins / 60); mins = mins % 60;
    const str = (hours ? (hours + ':'):'') + pad2(mins) + ':' + pad2(secs);

    return (
      <div style={{
        marginLeft: 260,
      }}>
       {str}
      </div>
    );
  }

  renderPlayer() {
    if (this.state.error) {
      return (
        <div>
          Error loading replay
        </div>
      );
    }
    if (!this.game) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    console.log('render player', this.game);
    const { grid, circles, shades, cursors, clues, solved, } = this.game;
    const screenWidth = this.screenWidth;
    let cols = grid[0].length;
    let rows = grid.length;
    const width = Math.min(35 * 15 * cols / rows, screenWidth);
    let size = width / cols;
    return (
      <Player
        ref='game'
        size={size}
        grid={grid}
        circles={circles}
        shades={shades}
        clues={{
          across: toArr(clues.across),
          down: toArr(clues.down)
        }}
        cursors={cursors}
        frozen={solved}
        myColor={this.color}
        updateGrid={_.noop}
        updateCursor={_.noop}
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
      <div className='replay--chat'>
        <Chat
          ref='chat'
          chat={this.game.chat}
          hideChatBar={true}
        />
      </div>
    );
  }

  renderControls() {
    const { position, history, left, right } = this.state;
    const length = history.length;

    // renders the controls / state
    return (
      <div
        ref='controls'
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          padding: 5,
          outline: 'none',
        }}
        tabIndex='1'
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
      >
        <div className='scrub--container'>
          <div
            ref='scrubLeft'
            className={'scrub ' + (left ? 'active' : '')}
            onMouseDown={this.handleMouseDownLeft}
            onMouseUp={this.handleMouseUpLeft}
            onMouseLeave={this.handleMouseUpLeft}
          >
            {'<<'}
          </div>
        </div>
        {history.length > 0
            ? <Timeline
              history={history}
              position={position}
              onSetPosition={this.handleSetPosition}
            />
            : null
        }
        <div className='scrub--container'>
          <div
            ref='scrubRight'
            className={'scrub ' + (right ? 'active' : '')}
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

  render() {
    return (
      <div
        className='replay'
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Nav mobile={false} />
        <div style={{
          paddingLeft: 30,
          paddingTop: 20,
          paddingBottom: 20,
        }}>
          {this.renderHeader()}
        </div>
        <div style={{
          padding: 10,
          border: '1px solid #E2E2E2',
        }}>
          {this.renderToolbar()}
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          padding: 20,
        }}>
          {this.renderPlayer()}
          {this.renderChat()}
        </div>
        <div style={{
          // flex: 1,
        }}>
          {this.renderControls()}
        </div>
        {/*Controls:
      Playback scrubber
      Playback speed toggle
      Skip inactivity checkbox*/}
    </div>
    );
  }
}
