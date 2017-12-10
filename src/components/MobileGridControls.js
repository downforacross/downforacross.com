import './css/mobileGridControls.css';

import React from 'react';
import GridControls from './GridControls';

export default class MobileGridControls extends GridControls {
  constructor() {
    super();
    this._handleMobileKeyDown = this.handleMobileKeyDown.bind(this);
    this._handleInput = this.handleInput.bind(this);
    this.prvInput = '';
  }

  handleMobileKeyDown(ev) {
    if (ev.keyCode !== 229) { // skip it on android
      this.handleKeyDown(ev);
    }
  }


  // handle input -- which should only fire on android
  handleInput(ev) {
    const input = this.refs.textarea.value;
    const prvInput = this.prvInput;
    if (input.startsWith(prvInput)) {
      if (input.length === prvInput.length + 1) {
        const letter = input.substring(input.length - 1).toUpperCase();
        this.typeLetter(letter, false); // no rebus for android
      }
    }
    this.prvInput = input;
  }

  render() {
    return (
      <div
        ref='gridControls'
        className='mobile-grid-controls'
        onKeyDown={this._handleMobileKeyDown}
        onInput={this._handleInput}
        onTouchEnd={e=> {
          e.preventDefault();
          this.refs.textarea.focus();
        }}
      >
        <div className='mobile-grid-controls--grid-content'>
          {this.props.children}
        </div>
        <div className='mobile-grid-controls--textarea--wrapper'>
          <textarea
            type="text"
            ref="textarea"
            className='mobile-grid-controls--textarea'
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      </div>
    );
  }
}
