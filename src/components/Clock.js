import './css/clock.css';
import React, { Component } from 'react';
import { getTime } from '../actions';

export default class Clock extends Component {
  constructor() {
    super();
    this.state = {
      clock: '00:00'
    };
    this._togglePause = this.togglePause.bind(this);
  }

  componentDidMount() {
    if (this.intvl) clearInterval(this.intvl);
    this.intvl = setInterval(this.updateClock.bind(this), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intvl);
  }

  updateClock() {
    function pad2(num) {
      let s = '' + 100 + num;
      s = s.substr(s.length - 2);
      return s;
    }

    const pausedTime = this.props.pausedTime;
    const start = this.props.startTime;
    const stop = this.props.stopTime;
    const now = getTime();

    let clock = 0; // start with pausedTime
    if (pausedTime) {
      clock += pausedTime;
    }

    if (start && !this.props.isPaused) { // not paused
      if (stop) { // finished
        clock += stop - start;
      } else {
        clock += now - start;
      }
    }

    let secs = Math.floor(clock / 1000);
    let mins = Math.floor(secs / 60); secs = secs % 60;
    let hours = Math.floor(mins / 60); mins = mins % 60;

    const str = (hours ? (hours + ':'):'') + pad2(mins) + ':' + pad2(secs);
    this.setState({
      clock: str
    });
  }

  togglePause() {
    const { isPaused, onPause, onStart } = this.props;
    if (isPaused) {
      onStart();
    } else {
      onPause();
    }
  }

  render() {
    const { clock } = this.state;
    const { isPaused } = this.props;
    const clockStr = isPaused
      ? '(' + clock + ')'
      : clock;
    const titleStr = isPaused
      ? 'Click to unpause'
      : 'Click to pause';
    return <div className='clock' onClick={this._togglePause} title={titleStr}>
      {clockStr}
    </div>
  }
};
