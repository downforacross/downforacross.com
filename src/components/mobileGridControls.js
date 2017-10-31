import './mobileGridControls.css';

import React from 'react';
import GridControls from './gridControls';

function MovementArrow({ dir, onClick }) {
  return (
    <div
      className={'movement-arrow ' + dir}
      tabIndex={-1}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      onTouchStart={function(e) {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      { dir }
    </div>
  );
}

export default class MobileGridControls extends GridControls {
  render() {
    return (
      <div
        ref='gridControls'
        className='mobile-grid-controls'
        onKeyDown={this.handleKeyDown.bind(this)}
      >
          <div className='grid--content'>
            {this.props.children}
          </div>
        <div className='mobile-grid-controls--buttons'>
          {
            // ['left', 'right', 'up', 'down'].map((dir, i) => (
            [].map((dir, i) => (
              <MovementArrow
                key={i}
                dir={dir}
                onClick={() => {
                  this.handleAction(dir)
                }}
              />
            ))
          }
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
        <button
          className='mobile-grid-controls--focus-button'
          onTouchStart={(e) => {
          this.refs.textarea.focus();
        }}
        onTouchEnd={e=> {
          e.preventDefault();
        }}
      >
        Type
      </button>
    </div>
    );
  }
}
