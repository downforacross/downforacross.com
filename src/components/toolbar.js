import React, { Component } from 'react';
import './toolbar.css';

import Clock from '../components/clock';
import ActionMenu from '../components/ActionMenu';

export default class Toolbar extends Component {
  constructor() {
    super();
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
    return (
      <div className='toolbar'>
        <div className='toolbar--timer'>
          <Clock
            startTime={this.props.startTime}
            stopTime={this.props.stopTime}
            pausedTime={this.props.pausedTime}
          />
        </div>
        {
          this.props.solved
            ? null
            : ( this.props.startTime
              ? ( <button className='toolbar--btn pause'
                onClick={this.props.onPauseClock} >
                Pause Clock
              </button>)
              : ( <button className='toolbar--btn start'
                onClick={this.props.onStartClock} >
                Start Clock
              </button>)
            )
        }
        {
          this.props.solved
            ? null
            : this.renderCheckMenu()
        }
        {
          this.props.solved
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
