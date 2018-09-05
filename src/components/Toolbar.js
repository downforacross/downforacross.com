import './css/toolbar.css';
import React, { Component } from 'react';

import Clock from './Clock';
import ActionMenu from './ActionMenu';

export default class Toolbar extends Component {

  handleBlur = (e) => {
    this.props.onRefocus();
  }

  handleMouseDown = (e) => {
    e.preventDefault();
  }

  handlePencilClick = (e) => {
    e.preventDefault();
    this.props.onTogglePencil();
  }

  handleToggleChat = (e) => {
    e.preventDefault();
    this.props.onToggleChat();
  }

  renderClockControl() {
    const {
      startTime,
      onStartClock,
      onPauseClock,
    } = this.props;
    return (
      startTime
      ? <button className='toolbar--btn pause'
        onMouseDown={this.handleMouseDown}
        onClick={onPauseClock} >
        Pause Clock
      </button>
      : <button className='toolbar--btn start'
        onMouseDown={this.handleMouseDown}
        onClick={onStartClock} >
        Start Clock
      </button>
    );
  }

  renderCheckMenu() {
    return (
      <div className='toolbar--menu check'>
        <ActionMenu label='Check'
          onBlur={this.handleBlur}
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
          onBlur={this.handleBlur}
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
        onBlur={this.handleBlur}
        actions={{
          'Square': this.reset.bind(this, 'square'),
          'Word': this.reset.bind(this, 'word'),
          'Puzzle': this.reset.bind(this, 'puzzle'),
          'Puzzle and Timer': this.resetPuzzleAndTimer.bind(this)
        }} />
    );
  }

  renderChatButton() {
    return (
      <button onClick={this.handleToggleChat}>Chat</button>
    );
  }

  renderPencil() {
    const { pencilMode, onTogglePencil } = this.props;
    return (
      <div
        className={'toolbar--pencil' + (
          pencilMode ? ' on' : ''
        )}
        onClick={this.handlePencilClick}
        onMouseDown={this.handleMouseDown}
        title={'Shortuct: .'}
      >
        <i className='fa fa-pencil'/>
      </div>
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
              v2={this.props.v2}
              startTime={startTime}
              stopTime={stopTime}
              pausedTime={pausedTime}
              isPaused={this.props.isPaused || !startTime}
              onStart={onStartClock}
              onPause={onPauseClock}
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
            {
              solved
                ? this.renderResetMenu()
                : null
            }
            { this.renderChatButton() }
          </div>
        </div>
      );


    }

    return (
      <div className='toolbar'>
        <div className='toolbar--timer'>
          <Clock
            v2={this.props.v2}
            startTime={startTime}
            stopTime={stopTime}
            pausedTime={pausedTime}
            isPaused={this.props.isPaused || !startTime}
            onStart={onStartClock}
            onPause={onPauseClock}
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
        {
          this.renderPencil()
        }
      </div>
    );

  }
};
