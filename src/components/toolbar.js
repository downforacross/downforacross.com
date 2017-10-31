import React, { Component } from 'react';
import './toolbar.css';

import Clock from '../components/clock';
import ActionMenu from '../components/ActionMenu';

export default class Toolbar extends Component {

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
          <div className='toolbar--mobile--bottom'>
            <div className='toolbar--mobile--timer'>
              <Clock
                startTime={startTime}
                stopTime={stopTime}
                pausedTime={pausedTime}
              />
            </div>
            {
              solved
                ? null
                : ( startTime
                  ? ( <button className='toolbar--mobile--btn pause'
                    onClick={onPauseClock} >
                    Pause Clock
                  </button>)
                  : ( <button className='toolbar--mobile--btn start'
                    onClick={onStartClock} >
                    Start Clock
                  </button>)
                )
            }

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
            : ( startTime
              ? ( <button className='toolbar--btn pause'
                onClick={onPauseClock} >
                Pause Clock
              </button>)
              : ( <button className='toolbar--btn start'
                onClick={onStartClock} >
                Start Clock
              </button>)
            )
        }
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
