import './css/mobileGridControls.css';

import React from 'react';
import Flex from 'react-flexview';
import Clue from './ClueText';
import GridControls from './GridControls';
import MobileKeyboard from './MobileKeyboard';
import classnames from 'classnames';

export default class MobileGridControls extends GridControls {
  constructor() {
    super();
    this.state = {
      touchingClueBar: false,
    };
    this.prvInput = '';
  }

  handleTouchClueBarMove = (e) => {
    e.preventDefault();
  };

  handleTouchClueBarEnd = (e) => {
    e.preventDefault();
    this.setState({
      touchingClueBar: false,
    });
    this.handleAction('space');
  };

  handleTouchClueBarStart = () => {
    this.setState({
      touchingClueBar: true,
    });
  };

  renderGridContent() {
    return <div className="mobile-grid-controls--grid-content">{this.props.children}</div>;
  }

  renderClueBar() {
    return (
      <Flex className="mobile-grid-controls--clue-bar-container">
        <div className="mobile-grid-controls--intra-clue left">{'<'}</div>
        <Flex
          grow={1}
          vAlignContent="center"
          className={classnames('mobile-grid-controls--clue-bar', {touching: this.state.touchingClueBar})}
          onTouchStart={this.handleTouchClueBarStart}
          onTouchEnd={this.handleTouchClueBarEnd}
          onTouchMove={this.handleTouchClueBarMove}
        >
          <div className="mobile-grid-controls--clue-bar--number">
            <Clue text={this.props.clueBarAbbreviation} />
          </div>
          <Flex className="mobile-grid-controls--clue-bar--text" grow={1}>
            <Clue text={this.props.clueBarText} />
          </Flex>
        </Flex>
        <div className="mobile-grid-controls--intra-clue left">{'>'}</div>
      </Flex>
    );
  }

  renderMobileKeyboard() {
    return (
      <Flex className="mobile-grid-controls--keyboard">
        <MobileKeyboard onKeyDown={this._handleKeyDown} />
      </Flex>
    );
  }

  render() {
    return (
      <div ref="gridControls" className="mobile-grid-controls">
        {this.renderGridContent()}
        {this.renderClueBar()}
        {this.renderMobileKeyboard()}
      </div>
    );
  }
}
