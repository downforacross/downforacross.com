import { getId, recordUsername, registerLoginListener } from '../auth'

import Player from '../components/Player';
import React, { Component } from 'react';
import Nav from '../components/Nav';
import GridObject from '../utils/Grid';
import { db } from '../actions';
import { toArr, lazy, rand_color } from '../jsUtils';
import _ from 'lodash';

import { reduce } from '../utils/GameOperations';
const TIMELINE_COLORS = {
  'updateCell': '#9999FF',
  'updateCursor': '#EEEEEE',
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
   return 0.003; // 1 second = 3 pixels wide
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
    onSetPosition(x / this.units + this.begin);
  }

  handleMouseDown = (e) => {
    this.down = true;
    this.handleMouse(e);
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
          width: 900,
          height: 50,
        }}>
        <div
          ref='timeline'
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            position: 'relative',
            height: 50,
            width: (this.end - this.begin) * this.units,
          }}
          onMouseDown={this.handleMouseDown}
          onMouseMove={this.handleMouseMove}
          onMouseUp={this.handleMouseUp}
        >
          {history.map(({
            timestamp,
            type,
          }, i) => (
            <div
              key={i}
              style={{
                left: (timestamp - this.begin) * this.units,
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
    return this.getSnapshotAt(history, position);
  }

  // returns the result of history[0:position]
  // this fn will eventually live in its own module
  getSnapshotAt(history, position) {
    let game = null;
    history.forEach(event => {
      if (event.timestamp <= position) {
        console.log('reduce', event);
        game = reduce(game, event);
      }
    });
    console.log('game at', position, game);
    return game;
  }

  componentDidMount() {
    this.historyRef = db.ref(`history/${this.gid}`)
    // compute it here so the grid doesn't go crazy
    this.screenWidth = window.innerWidth;

    this.historyRef.once('value', snapshot => {
      const history = _.values(snapshot.val());
      if (history.length > 0) {
        const position = history[0].timestamp;
        this.setState({history, position});
      } else {
        this.setState({
          error: true,
        });
      }
    });
  }

  renderPlayer() {
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

  renderControls() {
    const { position, history } = this.state;
    const length = history.length;

    // renders the controls / state
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}>
      {history.length > 0
        ? <Timeline
          history={history}
          position={position}
          onSetPosition={this.handleSetPosition}
        />
        : null
      }
    </div>
    );
  }

  render() {
    return (
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 10,
      }}>
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
