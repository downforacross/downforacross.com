import './css/mobileGridControls.css';

import React from 'react';
import Flex from 'react-flexview';
import Clue from './ClueText';
import GridControls from './GridControls';
import MobileKeyboard from './MobileKeyboard';
import classnames from 'classnames';
import _ from 'lodash';

export default class MobileGridControls extends GridControls {
  constructor() {
    super();
    this.state = {
      touchingClueBar: false,
      anchors: [],
      transform: {scale: 1, translateX: 0, translateY: 0},
    };
    this.prvInput = '';
    this.zoomContainer = React.createRef();
  }

  handlClueBarTouchMove = (e) => {
    e.preventDefault();
  };

  handlClueBarTouchEnd = (e) => {
    e.preventDefault();
    this.setState({
      touchingClueBar: false,
    });
    this.handleAction('space');
  };

  handlClueBarTouchStart = () => {
    this.setState({
      touchingClueBar: true,
    });
  };

  handleTouchStart = (e) => {
    this.handleTouchMove(e);
  };

  handleTouchMove = (e) => {
    e.preventDefault(); // annoying -- https://www.chromestatus.com/features/5093566007214080
    e.stopPropagation();

    const transform = this.state.transform;
    const rect = this.zoomContainer.current.getBoundingClientRect();
    const previousAnchors = e.touches.length >= this.state.anchors.length && this.state.anchors;
    const anchors = _.map(e.touches, ({pageX, pageY}, i) => {
      const x = pageX - rect.x;
      const y = pageY - rect.y;
      return {
        pixelPosition: {
          x: (x - transform.translateX) / transform.scale,
          y: (y - transform.translateY) / transform.scale,
        },
        ...previousAnchors[i],
        touchPosition: {x, y},
      };
    });
    const dbgstr = JSON.stringify(_.map(anchors, ({touchPosition}) => touchPosition), null, 2);
    this.setState({
      anchors,
      transform: this.getTransform(anchors, transform),
      dbgstr,
    });
  };

  handleTouchEnd = (e) => {
    e.preventDefault();
    this.handleTouchMove(e);
  };

  handleRightArrowTouchEnd = (e) => {
    this.handleAction('right');
  };

  handleLeftArrowTouchEnd = (e) => {
    this.handleAction('left');
  };

  getTransform(anchors, {scale, translateX, translateY}) {
    const getCenterAndDistance = (point1, point2) => {
      if (!point1) {
        return {
          center: {x: 1, y: 1},
          distance: 1,
        };
      }
      if (!point2) {
        return {
          center: point1,
          distance: 1,
        };
      }
      return {
        center: {
          x: (point1.x + point2.x) / 2,
          y: (point1.y + point2.y) / 2,
        },
        distance: Math.sqrt(
          (point1.x - point2.x) * (point1.x - point2.x) + (point1.y - point2.y) * (point1.y - point2.y)
        ),
      };
    };
    const {center: pixelCenter, distance: pixelDistance} = getCenterAndDistance(
      ..._.map(anchors, ({pixelPosition}) => pixelPosition)
    );
    const {center: touchCenter, distance: touchDistance} = getCenterAndDistance(
      ..._.map(anchors, ({touchPosition}) => touchPosition)
    );
    if (anchors.length >= 2) {
      scale = touchDistance / pixelDistance;
    }

    if (anchors.length >= 1) {
      translateX = touchCenter.x - scale * pixelCenter.x;
      translateY = touchCenter.y - scale * pixelCenter.y;
    }

    return {
      scale,
      translateX,
      translateY,
    };
  }

  renderGridContent() {
    const {scale, translateX, translateY} = this.state.transform;
    const style = {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
    };
    return (
      <Flex
        grow={1}
        shrink={1}
        basis={1}
        className="mobile-grid-controls--grid-content"
        onTouchStart={this.handleTouchStart}
        onTouchMove={this.handleTouchMove}
        onTouchEnd={this.handleTouchEnd}
      >
        <div
          style={{display: 'flex', flexGrow: 1}}
          className="mobile-grid-controls--zoom-container"
          ref={this.zoomContainer}
        >
          <Flex grow={1} className="mobile-grid-controls--zoom-content" style={style}>
            {this.props.children}
          </Flex>
        </div>
      </Flex>
    );
  }

  renderClueBar() {
    return (
      <Flex className="mobile-grid-controls--clue-bar-container">
        <div className="mobile-grid-controls--intra-clue left" onTouchEnd={this.handleLeftArrowTouchEnd}>
          {'<'}
        </div>
        <Flex
          grow={1}
          vAlignContent="center"
          className={classnames('mobile-grid-controls--clue-bar', {touching: this.state.touchingClueBar})}
          onTouchStart={this.handlClueBarTouchStart}
          onTouchEnd={this.handlClueBarTouchEnd}
          onTouchMove={this.handlClueBarTouchMove}
        >
          <div className="mobile-grid-controls--clue-bar--number">
            <Clue text={this.props.clueBarAbbreviation} />
          </div>
          <Flex className="mobile-grid-controls--clue-bar--text" grow={1}>
            <Clue text={this.props.clueBarText} />
          </Flex>
        </Flex>
        <div
          className="mobile-grid-controls--intra-clue left"
          onTouchStart={this.handleRightArrowTouchStart}
          onTouchEnd={this.handleRightArrowTouchEnd}
        >
          {'>'}
        </div>
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
        {/*this.state.dbgstr*/}
      </div>
    );
  }
}
