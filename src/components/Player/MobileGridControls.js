import './css/mobileGridControls.css';

import React from 'react';
import Flex from 'react-flexview';
import {MdKeyboardArrowLeft, MdKeyboardArrowRight} from 'react-icons/md';
// eslint-disable-next-line import/no-extraneous-dependencies
import classnames from 'classnames';
import _ from 'lodash';
import Clue from './ClueText';
import GridControls from './GridControls';
import GridObject from '../../lib/wrappers/GridWrapper';
import * as gameUtils from '../../lib/gameUtils';

const CLUE_ANIMATION_TIME = 0.3; // in seconds

export default class MobileGridControls extends GridControls {
  constructor() {
    super();
    this.state = {
      touchingClueBar: false,
      anchors: [],
      transform: {scale: 1, translateX: 0, translateY: 0},
      dbgstr: undefined,
    };
    this.prvInput = '';
    this.inputRef = React.createRef();
    this.zoomContainer = React.createRef();
    this.wasUnfocused = Date.now() - 1000;
    this.lastTouchMove = Date.now();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.transform !== this.state.transform) {
      if (this.state.anchors.length === 0) {
        this.fitOnScreen();
      }
    }
    if (prevProps.selected.r !== this.props.selected.r || prevProps.selected.c !== this.props.selected.c) {
      this.fitOnScreen(true);
    }
  }

  fitOnScreen(fitCurrentClue) {
    if (!fitCurrentClue && this.state.lastFitOnScreen > Date.now() - 100) return;

    const rect = this.zoomContainer.current.getBoundingClientRect();
    let {scale, translateX, translateY} = this.state.transform;
    if (scale < 1) scale = 1;
    const minTranslateX = -rect.width * (scale - 1);
    const maxTranslateX = 0;
    const minTranslateY = translateY; // never auto-pan back up, because iOS soft keyboard is insane
    // https://blog.opendigerati.com/the-eccentric-ways-of-ios-safari-with-the-keyboard-b5aa3f34228d
    const maxTranslateY = 0;
    translateX = _.clamp(translateX, minTranslateX, maxTranslateX);
    translateY = _.clamp(translateY, minTranslateY, maxTranslateY);

    if (fitCurrentClue) {
      const {selected, size} = this.props;
      const posX = selected.c * size;
      const posY = selected.r * size;
      const paddingX = (rect.width - this.grid.cols * size) / 2;
      const paddingY = (rect.height - this.grid.rows * size) / 2;
      const tX = (posX + paddingX) * scale;
      const tY = (posY + paddingY) * scale;
      translateX = _.clamp(translateX, -tX, rect.width - tX - size * scale);
      translateY = _.clamp(translateY, -tY, rect.height - tY - size * scale);
    }

    this.setState({
      transform: {
        scale,
        translateX,
        translateY,
      },
      lastFitOnScreen: Date.now(),
    });
  }

  handleClueBarTouchMove = (e) => {
    if (!this.props.enableClueBarGestures) return;
    e.preventDefault();
    const touch = e.touches[0];
    this.setState({
      touchingClueBarCurrent: touch,
    });
  };

  handleClueBarTouchEnd = (e) => {
    if (!this.props.enableClueBarGestures) {
      this.flipDirection();
      this.keepFocus();
      return;
    }
    e.preventDefault();
    const clueBarGesture = this.clueBarGesture;
    let stateUpdates = {
      touchingClueBarStart: null,
      touchingClueBarCurrent: null,
    };

    if (!this.previewClue) {
      // nothing to do if cannot perform action :|
    } else if (Math.abs(clueBarGesture.x) > 50) {
      this.selectNextClue(clueBarGesture.x > 0);
      stateUpdates = {
        ...stateUpdates,
        previousGesture: {
          x: clueBarGesture.x > 0 ? 1 : -1,
        },
        previousClue: this.mainClue,
      };
    } else if (!clueBarGesture.x && (Math.abs(clueBarGesture.y) > 20 || Math.abs(clueBarGesture.y) <= 3)) {
      this.flipDirection();
      stateUpdates = {
        ...stateUpdates,
        previousGesture: {
          y: clueBarGesture.y > 0 ? 1 : -1,
        },
        previousClue: this.mainClue,
      };
    }
    this.setState(stateUpdates);
  };

  handleClueBarTouchStart = (e) => {
    if (!this.props.enableClueBarGestures) return;
    e.preventDefault();
    const touch = e.touches[0];
    this.setState({
      touchingClueBarStart: touch,
      touchingClueBarCurrent: touch,
      previousGesture: null,
    });
  };

  handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      this.props.onSetCursorLock(true);
    }
    this.lastTouchStart = Date.now();
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
    const nTransform = this.getTransform(anchors, transform);
    if (nTransform) {
      this.lastTouchMove = Date.now();
    }

    this.setState({
      anchors,
      transform: nTransform ?? this.state.transform,
    });
  };

  handleTouchEnd = (e) => {
    if (e.touches.length === 0 && this.state.anchors.length === 1 && this.lastTouchStart > Date.now() - 100) {
      this.props.onSetCursorLock(false);
      let el = e.target; // a descendant of grid for sure
      let rc;
      for (let i = 0; el && i < 20; i += 1) {
        if (el.className.includes('grid--cell')) {
          rc = el.getAttribute('data-rc');
          break;
        }
        el = el.parentElement;
      }
      if (rc) {
        const [r, c] = rc.split(' ').map((x) => Number(x));
        if (this.props.selected.r === r && this.props.selected.c === c) {
          this.props.onChangeDirection();
        } else {
          this.props.onSetSelected({r, c});
        }
      }
      this.focusKeyboard();
    }
    e.preventDefault();
    this.handleTouchMove(e);
  };

  handleRightArrowTouchEnd = (e) => {
    e.preventDefault();
    this.handleAction('tab');
    this.keepFocus();
  };

  handleLeftArrowTouchEnd = (e) => {
    e.preventDefault();
    this.handleAction('tab', true);
    this.keepFocus();
  };

  getTransform(anchors, {scale, translateX, translateY}) {
    if (!this.props.enablePan) {
      return;
    }

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

  get grid() {
    return new GridObject(this.props.grid);
  }

  getClueAbbreviation({clueNumber = '', direction = ''} = {}) {
    return `${clueNumber}${direction.substring(0, 1).toUpperCase()}`;
  }

  getClueText({clueNumber = '', direction = ''} = {}) {
    return this.props.clues[direction]?.[clueNumber] ?? '';
  }

  get mainClue() {
    if (this.previousGesture) {
      return this.state.previousClue;
    }
    return {clueNumber: this.getSelectedClueNumber(), direction: this.props.direction};
  }

  get previewClue() {
    const clueNumber = this.getSelectedClueNumber();
    if (this.previousGesture) {
      return {clueNumber, direction: this.props.direction};
    }
    const {x} = this.clueBarGesture;
    if (x) {
      return this.grid.getNextClue(clueNumber, this.props.direction, this.props.clues, x > 0);
    }
    const oppositeDirection = gameUtils.getOppositeDirection(this.props.direction);
    if (this.canSetDirection(oppositeDirection)) {
      const oppositeClueNumber = this.grid.getParent(
        this.props.selected.r,
        this.props.selected.c,
        oppositeDirection
      );
      return {direction: oppositeDirection, clueNumber: oppositeClueNumber};
    }
    return undefined; // cannot preview this clue
  }

  get clueBarGesture() {
    const {touchingClueBarStart, touchingClueBarCurrent} = this.state;
    if (!touchingClueBarStart || !touchingClueBarCurrent) return {};
    const x = touchingClueBarCurrent.pageX - touchingClueBarStart.pageX;
    const y = _.clamp(1.2 * (touchingClueBarCurrent.pageY - touchingClueBarStart.pageY), -62, 62);
    return Math.max(Math.abs(x), Math.abs(y)) > 10 ? (Math.abs(x) > Math.abs(y) ? {x} : {y}) : {y: 0};
  }

  get previousGesture() {
    return this.state.previousGesture;
  }

  renderGridContent() {
    const {scale, translateX, translateY} = this.state.transform;
    const style = {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      transition: this.state.anchors.length === 0 ? '.1s transform ease-out' : '',
    };
    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexShrink: 1,
          flexBasis: 1,
        }}
        className="mobile-grid-controls--grid-content"
        ref={(e) => {
          if (!e) return;
          e.addEventListener('touchstart', this.handleTouchStart, {passive: false});
          e.addEventListener('touchmove', this.handleTouchMove, {passive: false});
          e.addEventListener('touchend', this.handleTouchEnd, {passive: false});
          // e.addEventListener('mouseup', this.handleTouchEnd, {passive: false});
        }}
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
      </div>
    );
  }

  renderClueBar() {
    const {x, y} = this.clueBarGesture;

    const {x: px = 0, y: py = 0} = this.previousGesture || {};
    const X = px || x;
    const Y = py || y;
    const style = {
      flexDirection: X > 0 ? 'row-reverse' : X < 0 ? 'row' : Y >= 0 ? 'column-reverse' : 'column',
      transform: px || py ? `translate(${px * 50}%, ${py * 50}%)` : `translate(${x || 0}px, ${y || 0}px)`,
      left: X > 0 ? '-100%' : 0,
      top: Y >= 0 ? '-100%' : 0,
      transition: x === undefined && y === undefined ? `${CLUE_ANIMATION_TIME}s transform ease-out` : '',
    };
    return (
      <Flex className="mobile-grid-controls--clue-bar-container">
        <div
          ref={(e) => e && e.addEventListener('touchend', this.handleLeftArrowTouchEnd, {passive: false})}
          style={{display: 'flex'}}
        >
          <MdKeyboardArrowLeft className="mobile-grid-controls--intra-clue left" onClick={this.keepFocus} />
        </div>
        <div
          style={{
            display: 'flex',
            flexGrow: 1,
            alignItems: 'center',
          }}
          className={classnames('mobile-grid-controls--clue-bar', {touching: this.state.touchingClueBar})}
          ref={(e) => {
            if (!e) return;
            e.addEventListener('touchstart', this.handleClueBarTouchStart, {passive: false});
            e.addEventListener('touchend', this.handleClueBarTouchEnd, {passive: false});
            e.addEventListener('touchmove', this.handleClueBarTouchMove, {passive: false});
          }}
          onClick={this.keepFocus}
        >
          <div className="mobile-grid-controls--clue-bar--clues--container" style={style}>
            <div className="mobile-grid-controls--clue-bar--main">
              <div className="mobile-grid-controls--clue-bar--number">
                <Clue text={this.getClueAbbreviation(this.mainClue)} />
              </div>
              <Flex className="mobile-grid-controls--clue-bar--text" grow={1}>
                <Clue text={this.getClueText(this.mainClue)} />
              </Flex>
            </div>
          </div>
        </div>
        <div
          ref={(e) => e && e.addEventListener('touchend', this.handleRightArrowTouchEnd, {passive: false})}
          style={{display: 'flex'}}
        >
          <MdKeyboardArrowRight className="mobile-grid-controls--intra-clue left" onClick={this.keepFocus} />
        </div>
      </Flex>
    );
  }

  focusKeyboard() {
    this.inputRef.current.selectionStart = this.inputRef.current.selectionEnd = this.inputRef.current.value.length;
    this.inputRef.current.focus();
  }

  keepFocus = () => {
    if (!this.wasUnfocused || this.wasUnfocused >= Date.now() - 500) {
      this.focusKeyboard();
    }
  };

  handleInputFocus = (e) => {
    this.focusKeyboard();
    this.setState({dbgstr: `INPUT FOCUS ${e.target.name}`});
    if (e.target.name === '1') {
      this.selectNextClue(true);
    } else if (e.target.name === '3') {
      this.selectNextClue(false);
    }
    this.wasUnfocused = null;
  };

  handleInputBlur = (e) => {
    if (e.target.name === '2') {
      this.wasUnfocused = Date.now();
    }
  };

  handleInputChange = (e) => {
    let input = e.target.value;
    this.setState({dbgstr: `INPUT IS [${input}]`});

    if (input === '') {
      this.backspace();
      return;
    }

    // get rid of the $ at the beginning
    input = input.substring(1);
    if (input === ' ' || input === '@') {
      // hack hack
      // for some reason, email input [on ios safari & chrome mobile inspector] doesn't fire onChange at all when pressing spacebar
      this.handleAction('space');
    } else if (input === ',') {
      this.handleAction('tab');
    } else if (input === '.') {
      this.props.onPressPeriod && this.props.onPressPeriod();
    } else {
      // support gesture-based keyboards that allow inputting words at a time
      let delay = 0;
      for (const char of input) {
        if (this.validLetter(char.toUpperCase())) {
          this.setState({dbgstr: `TYPE letter ${char.toUpperCase()}`});
          if (delay) {
            setTimeout(() => {
              this.typeLetter(char.toUpperCase(), char.toUpperCase() === char, {nextClueIfFilled: true});
            }, delay);
          } else {
            this.typeLetter(char.toUpperCase(), char.toUpperCase() === char, {nextClueIfFilled: true});
          }
          delay += 20;
        }
      }
    }
  };

  handleKeyUp = (ev) => {
    this.setState({dbgstr: `[${ev.target.value}]`});
  };

  renderMobileInputs() {
    const inputProps = {
      value: '$',
      type: 'email',
      style: {
        opacity: 0,
        width: 0,
        height: 0,
        pointerEvents: 'none',
        touchEvents: 'none',
        position: 'absolute',
      },
      autoComplete: 'none',
      autoCapitalize: 'none',
      onBlur: this.handleInputBlur,
      onFocus: this.handleInputFocus,
      onChange: this.handleInputChange,
    };
    const USE_TEXT_AREA = true;
    if (USE_TEXT_AREA) {
      return (
        <>
          <textarea name="1" {...inputProps} />
          <textarea name="2" ref={this.inputRef} {...inputProps} onKeyUp={this.handleKeyUp} />
          <textarea name="3" {...inputProps} />
        </>
      );
    }
    return (
      <>
        <input name="1" {...inputProps} />
        <input name="2" ref={this.inputRef} {...inputProps} onKeyUp={this.handleKeyUp} />
        <input name="3" {...inputProps} />
      </>
    );
  }

  render() {
    return (
      // eslint-disable-next-line react/no-string-refs
      <div ref="gridControls" className="mobile-grid-controls">
        {this.renderClueBar()}
        {this.renderGridContent()}
        {this.renderMobileInputs()}
        {/* {this.renderMobileKeyboard()} */}
        {this.props.enableDebug && (this.state.dbgstr || 'No message')}
      </div>
    );
  }
}
