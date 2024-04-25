import React from 'react';
import _ from 'lodash';
import {pure, isAncestor} from '../../lib/jsUtils';
import './timeline.css';

const TIMELINE_COLORS = {
  updateCell: '#9999FFC0',
  updateCursor: '#00000030',
  reveal: '#EE0000C0',
  check: '#EE000050',
  updateClock: '#0000EE80',
  chat: '#00EEEE80',
  create: '#00000080',
};

const TIMELINE_BACKGROUND_COLOR = '#00000032';

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
    {history.map(({gameTimestamp, type}, i) => (
      <div
        key={i}
        className="timeline--bar"
        style={{
          left: (gameTimestamp - begin) * units,
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
    return history[0].gameTimestamp;
  }

  get end() {
    const {history} = this.props;
    return history[history.length - 1].gameTimestamp;
  }

  get units() {
    const length = this.end - this.begin;
    return this.props.width / length;
  }

  componentDidMount() {
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  componentDidUpdate() {
    this.updateScroll();
  }

  renderCursor() {
    const {position} = this.props;
    return (
      <div
        ref="cursor"
        className="timeline--cursor"
        style={{
          position: 'absolute',
          left: (position - this.begin) * this.units - 5,
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
    e.preventDefault();
    e.stopPropagation();
  };

  handleMouseDown = (e) => {
    if (e.button) return;
    this.down = true;
    this.handleMouse(e);
  };

  handleMouseOut = (e) => {
    if (!isAncestor(this.refs.timeline, e.nativeEvent.relatedTarget)) {
      // this.down = false;
    }
  };

  handleMouseUp = () => {
    this.down = false;
    this.forceUpdate();
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
        ref="timeline"
        className="timeline"
        style={{
          position: 'relative',
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
        {this.down && this.refs.timeline && (
          <div
            className="mouse--target"
            style={{
              position: 'absolute',
              left: -this.refs.timeline.getBoundingClientRect().left,
              top: -this.refs.timeline.getBoundingClientRect().top,
            }}
          ></div>
        )}
      </div>
    );
  }
}
export {Timeline};
