import './css/toolbar.css';
import React, {Component} from 'react';

import Clock from './Player/Clock';
import ActionMenu from './Toolbar/ActionMenu';
import Flex from 'react-flexview';
import {Link} from 'react-router-dom';

export default class Toolbar extends Component {
  handleBlur = (e) => {
    this.props.onRefocus();
  };

  handleMouseDown = (e) => {
    e.preventDefault();
  };

  handlePencilClick = (e) => {
    e.preventDefault();
    this.props.onTogglePencil();
  };

  handleToggleChat = (e) => {
    e.preventDefault();
    this.props.onToggleChat();
  };

  renderClockControl() {
    const {startTime, onStartClock, onPauseClock} = this.props;
    return startTime ? (
      <button
        className="toolbar--btn pause"
        tabIndex={-1}
        onMouseDown={this.handleMouseDown}
        onClick={onPauseClock}
      >
        Pause Clock
      </button>
    ) : (
      <button
        className="toolbar--btn start"
        tabIndex={-1}
        onMouseDown={this.handleMouseDown}
        onClick={onStartClock}
      >
        Start Clock
      </button>
    );
  }

  renderCheckMenu() {
    return (
      <div className="toolbar--menu check">
        <ActionMenu
          label="Check"
          onBlur={this.handleBlur}
          actions={{
            Square: this.check.bind(this, 'square'),
            Word: this.check.bind(this, 'word'),
            Puzzle: this.check.bind(this, 'puzzle'),
          }}
        />
      </div>
    );
  }

  renderRevealMenu() {
    return (
      <div className="toolbar--menu reveal">
        <ActionMenu
          label="Reveal"
          onBlur={this.handleBlur}
          actions={{
            Square: this.reveal.bind(this, 'square'),
            Word: this.reveal.bind(this, 'word'),
            Puzzle: this.reveal.bind(this, 'puzzle'),
          }}
        />
      </div>
    );
  }

  renderResetMenu() {
    return (
      <ActionMenu
        label="Reset"
        onBlur={this.handleBlur}
        actions={{
          Square: this.reset.bind(this, 'square'),
          Word: this.reset.bind(this, 'word'),
          Puzzle: this.reset.bind(this, 'puzzle'),
          'Puzzle and Timer': this.resetPuzzleAndTimer.bind(this),
        }}
      />
    );
  }

  renderChatButton() {
    return (
      <svg
        onClick={this.handleToggleChat}
        className="toolbar--chat"
        viewBox="0 0 90 90"
        enableBackground="0 0 90 90"
        space="preserve"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <path d="M72.55664,51.2041c3.0874-3.93164,4.87598-8.56836,4.87598-13.53711c0-14.18066-14.52051-25.67578-32.43262-25.67578  S12.56738,23.48633,12.56738,37.66699c0,14.17969,14.52051,25.67578,32.43262,25.67578c2.61572,0,5.15625-0.25195,7.59277-0.71484  v15.38086L72.55664,51.2041z" />
        {this.props.unreads && <circle stroke="none" fill="red" cx="70" cy="20" r="20" />}
      </svg>
    );
  }

  renderPencil() {
    const {pencilMode, onTogglePencil} = this.props;
    return (
      <div
        className={'toolbar--pencil' + (pencilMode ? ' on' : '')}
        onClick={this.handlePencilClick}
        onMouseDown={this.handleMouseDown}
        title={'Shortcut: .'}
      >
        <i className="fa fa-pencil" />
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
    const {mobile, startTime, stopTime, pausedTime, onStartClock, onPauseClock, solved} = this.props;

    if (mobile) {
      return (
        <Flex className="toolbar--mobile" vAlignContent="center">
          <Flex className="toolbar--mobile--top" grow={1} vAlignContent="center">
            <Link to={'/'}>Down for a Cross</Link>{' '}
            <Clock
              v2={this.props.v2}
              startTime={startTime}
              stopTime={stopTime}
              pausedTime={pausedTime}
              isPaused={this.props.isPaused || !startTime}
              onStart={onStartClock}
              onPause={onPauseClock}
            />
            {solved ? null : this.renderCheckMenu()}
            {solved ? null : this.renderRevealMenu()}
            {this.renderChatButton()}
          </Flex>
        </Flex>
      );
    }

    return (
      <div className="toolbar">
        <div className="toolbar--timer">
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
        {solved ? null : this.renderCheckMenu()}
        {solved ? null : this.renderRevealMenu()}
        <div className="toolbar--menu reset">{this.renderResetMenu()}</div>
        {this.renderPencil()}
      </div>
    );
  }
}
