import './css/toolbar.css';
import React, { Component } from 'react';

import Clock from '../components/clock';
import ActionMenu from '../components/ActionMenu';

export default class Toolbar extends Component {

  renderClockControl() {
    const {
      startTime,
      onStartClock,
      onPauseClock,
    } = this.props;
    return ( 
      startTime
        ? <button className='toolbar--btn pause'
            onClick={onPauseClock} >
            Pause Clock
          </button>
        : <button className='toolbar--btn start'
            onClick={onStartClock} >
            Start Clock
          </button>
    );
  }

  renderCheckMenu() {
    return (
      <div className='toolbar--menu check'>
        <ActionMenu label='Check'
          actions={{
            'Square': this.check.bind(this, 'square'),
            'Word': this.check.bind(this, 'word'),
            'Puzzle': this.check.bind(this, 'puzzle'),
          }} />

      </div>
    );
  }

  renderRevealMenu() {
    return (
      <div className='toolbar--menu reveal'>
        <ActionMenu label='Reveal'
          actions={{
            'Square': this.reveal.bind(this, 'square'),
            'Word': this.reveal.bind(this, 'word'),
            'Puzzle': this.reveal.bind(this, 'puzzle'),
          }} />
      </div>
    );
  }

  renderResetMenu() {
    return (
      <ActionMenu label='Reset'
        actions={{
          'Square': this.reset.bind(this, 'square'),
          'Word': this.reset.bind(this, 'word'),
          'Puzzle': this.reset.bind(this, 'puzzle'),
          'Puzzle and Timer': this.resetPuzzleAndTimer.bind(this)
        }} />
    );
  }

  check(scopeString) {
    this.props.onCheck(scopeString);
  }

  reveal(scopeString) {
    this.props.onReveal(scopeString);
  }

  reset(scopeString) {
    this.props.onReset(scopeString);
  }

  resetPuzzleAndTimer() {
    this.reset('puzzle');
    this.props.onResetClock();
  }

  render() {
    const {
      mobile,
      startTime,
      stopTime,
      pausedTime,
      onStartClock,
      onPauseClock,
      solved,
    } = this.props;

    if (mobile) {
      return (
        <div className='toolbar--mobile'>
          <div className='toolbar--mobile--top'>
            <Clock
              startTime={startTime}
              stopTime={stopTime}
              pausedTime={pausedTime}
            />
            {
              solved
                ? null
                : this.renderCheckMenu()
            }
            {
              solved
                ? null
                : this.renderRevealMenu()
            }
            <div className='toolbar--menu reset'>
              {
                this.renderResetMenu()
              }
            </div>
          </div>
        </div>
      );


    }

    return (
      <div className='toolbar'>
        <div className='toolbar--timer'>
          <Clock
            startTime={startTime}
            stopTime={stopTime}
            pausedTime={pausedTime}
          />
        </div>
        {
          solved
            ? null
            : this.renderCheckMenu()
        }
        {
          solved
            ? null
            : this.renderRevealMenu()
        }
        <div className='toolbar--menu reset'>
          {
            this.renderResetMenu()
          }
        </div>
      </div>
    );

  }
};
