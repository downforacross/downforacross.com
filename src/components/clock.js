import React, { Component } from 'react';

export default class Clock extends Component {
  constructor() {
    super();
    this.state = {
      clock: '00:00'
    };
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
    const now = new Date().getTime();

    let clock = 0; // start with pausedTime
    if (pausedTime) {
      clock += pausedTime;
    }

    if (start) { // not paused
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

  render() {
    return <div className='clock'>
      {this.state.clock}
    </div>
  }
};
