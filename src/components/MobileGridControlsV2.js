import './css/mobileGridControls.css';

import React from 'react';
import Flex from 'react-flexview';
import Clue from './ClueText';
import GridControls from './GridControls';

export default class MobileGridControls extends GridControls {
  constructor() {
    super();
    this.state = {
      typing: false,
    };
    this._handleMobileKeyDown = this.handleMobileKeyDown.bind(this);
    this._handleInput = this.handleInput.bind(this);
    this.prvInput = '';
  }

  handleMobileKeyDown(ev) {
    if (ev.keyCode !== 229) {
      // skip it on android
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

  renderMobileKeyboard() {}

  renderClueBar() {
    return (
      <Flex className="mobile-grid-controls--clue-bar">
        <div className="mobile-grid-controls--clue-bar--number">
          <Clue text={this.props.clueBarAbbreviation} />
        </div>
        <Flex className="mobile-grid-controls--clue-bar--text" grow={1}>
          <Clue text={this.props.clueBarText} />
        </Flex>
      </Flex>
    );
  }

  renderGridContent() {
    return <div className="mobile-grid-controls--grid-content">{this.props.children}</div>;
  }

  render() {
    const {typing} = this.state;
    return (
      <div
        ref="gridControls"
        className={'mobile-grid-controls ' + (typing ? ' typing' : '')}
        onKeyDown={this._handleMobileKeyDown}
        onInput={this._handleInput}
        onTouchEnd={(e) => {
          e.preventDefault();
          this.refs.textarea.focus();
        }}
      >
        {this.renderGridContent()}
        {this.renderClueBar()}
      </div>
    );
  }
}
