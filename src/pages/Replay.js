import './css/replay.css';

import { getId, recordUsername, registerLoginListener } from '../auth'

import GameStore from '../store/gameStore';
import Player from '../components/Player';
import React, { Component } from 'react';
import Nav from '../components/Nav';
import GridObject from '../utils/Grid';
import { db } from '../actions';
import { toArr, lazy, rand_color, pure, isAncestor } from '../jsUtils';
import _ from 'lodash';

const SCRUB_SPEED = 60; // 30 actions per second

const TIMELINE_COLORS = {
  'updateCell': '#9999FF80',
  'updateCursor': '#EEEEEE80',
  'create': '#000000',
};

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
            height: 50,
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
          top: 20,
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
            height: 50,
            width: (this.end - this.begin) * this.units,
            backgroundColor: '#00000005',
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
        this.setState({history, position});
      } else {
        this.setState({
          error: true,
        });
      }
    });
  }

  renderPlayer() {
    if (this.error) {
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

  setDirection = (direction, value) => {
    this.setState({
      [direction]: value,
    });
  }

  handleMouseDownLeft = (e) => {
    e.preventDefault();
    clearInterval(this.interval);
    this.interval = setInterval(this.scrubLeft, 1000 / SCRUB_SPEED);
  }

  handleMouseDownRight = (e) => {
    e.preventDefault();
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
    if (e.key === 'ArrowLeft') {
      this.scrubLeft();
    } else if (e.key === 'ArrowRight') {
      this.scrubRight();
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

  scrubLeft = () => {
    const { position, history } = this.state;
    const index = _.findLastIndex(history, (event) => (
      event.timestamp < position
    ));
    if (!this.state.left) {
      this.setState({
        left: true,
      });
    }
    if (index === -1) return;
    this.setState({
      position: history[index].timestamp,
    });
  }

  scrubRight = () => {
    const { position, history } = this.state;
    const index = _.findIndex(history, (event) => (
      event.timestamp > position
    ));
    if (!this.state.right) {
      this.setState({
        right: true,
      });
    }
    if (index === -1) return;
    this.setState({
      position: history[index].timestamp,
    });
  }

  renderControls() {
    const { position, history, left, right } = this.state;
    const length = history.length;

    // renders the controls / state
    return (
      <div
        style={{
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
          padding: 10,
        }}
      >
        {this.renderControls()}
        {this.renderPlayer()}
        {/*Controls:
      Playback scrubber
      Playback speed toggle
      Skip inactivity checkbox*/}
    </div>
    );
  }
}
