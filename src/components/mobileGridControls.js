import './css/mobileGridControls.css';

import React from 'react';
import GridControls from './gridControls';

export default class MobileGridControls extends GridControls {
  render() {
    return (
      <div
        ref='gridControls'
        className='mobile-grid-controls'
        onKeyDown={this.handleKeyDown.bind(this)}
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
