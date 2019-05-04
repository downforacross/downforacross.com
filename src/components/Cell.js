import './css/cell.css';

import React, {Component} from 'react';
import _ from 'lodash';

import {getTime} from '../actions';
import Emoji from './Emoji';
import powerups from '../lib/powerups';
/*
 * Summary of Cell component
 *
 * Props: { black, selected, highlighted, bad, good, helped,
 *          value, onClick, cursor }
 *
 * Children: []
 *
 * Potential parents:
 * - Grid
 **/

export default class Cell extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    if (!_.isEqual(_.omit(nextProps, 'cursors'), _.omit(this.props, 'cursors'))) return true;
    return !_.isEqual(nextProps.cursors, this.props.cursors);
  }

  renderCursors() {
    const {cursors} = this.props;
    return (
      <div className="cell--cursors">
        {cursors.map(({color, active}, i) => (
          <div
            key={i}
            className={'cell--cursor' + (active ? ' active' : ' inactive')}
            style={{
              borderColor: color,
              zIndex: Math.min(2 + cursors.length - i, 9),
              borderWidth: Math.min(1 + 2 * (i + 1), 12),
            }}
          />
        ))}
      </div>
    );
  }

  renderFlipButton() {
    const {canFlipColor, onFlipColor} = this.props;
    if (canFlipColor) {
      return (
        <i
          className="cell--flip fa fa-small fa-sticky-note"
          onClick={(e) => {
            e.stopPropagation();
            onFlipColor();
          }}
        />
      );
    }
    return null;
  }

  renderCircle() {
    const {circled} = this.props;
    if (circled) {
      return <div className="cell--circle" />;
    }
    return null;
  }

  renderShade() {
    const {shaded} = this.props;
    if (shaded) {
      return <div className="cell--shade" />;
    }
    return null;
  }

  renderPickup() {
    const {pickupType} = this.props;
    if (pickupType) {
      const {icon} = powerups[pickupType];
      return <Emoji emoji={icon} big={false} className="cell--emoji" />;
    }
    return null;
  }

  getStyle() {
    const {
      cellStyle,
      black,
      selected,
      highlighted,
      shaded,
      bad,
      good,
      revealed,
      pencil,
      value,
      myColor,
      onClick,
      number,
      referenced,
    } = this.props;
    if (selected) {
      return cellStyle.selected;
    }
    if (highlighted) {
      return cellStyle.highlighted;
    }
    return {};
  }

  render() {
    const {
      black,
      selected,
      highlighted,
      shaded,
      bad,
      good,
      revealed,
      pencil,
      value,
      myColor,
      onClick,
      number,
      referenced,
    } = this.props;
    if (black) {
      return (
        <div
          className={'cell black ' + (selected ? 'selected' : '')}
          style={selected ? {borderColor: myColor} : undefined}
          onClick={onClick}
        />
      );
    }

    let val = value || '';

    let l = Math.max(1, val.length);
    const style = this.getStyle();
    return (
      <div
        className={
          (selected ? 'selected ' : '') +
          (highlighted ? 'highlighted ' : '') +
          (referenced ? 'referenced ' : '') +
          (shaded ? 'shaded ' : '') +
          (bad ? 'bad ' : '') +
          (good ? 'good ' : '') +
          (revealed ? 'revealed ' : '') +
          (pencil ? 'pencil ' : '') +
          'cell'
        }
        style={style}
        onClick={onClick}
        onTouchStart={(e) => {
          const touch = e.touches[e.touches.length - 1];
          this.touchStart = {pageX: touch.pageX, pageY: touch.pageY};
        }}
        onTouchEnd={(e) => {
          if (e.changedTouches.length !== 1 || e.touches.length !== 0) return;
          const touch = e.changedTouches[0];
          if (
            !this.touchStart ||
            (Math.abs(touch.pageX - this.touchStart.pageX) < 5 &&
              Math.abs(touch.pageY - this.touchStart.pageY) < 5)
          ) {
            onClick();
          }
        }}
      >
        <div className="cell--wrapper">
          <div className={'cell--number' + (number ? ' nonempty' : '')}>{number}</div>
          {this.renderFlipButton()}
          {this.renderCircle()}
          {this.renderShade()}
          {this.renderPickup()}
          <div
            className="cell--value"
            style={{
              fontSize: 350 / Math.sqrt(l) + '%',
              lineHeight: Math.sqrt(l) * 98 + '%',
            }}
          >
            {val}
          </div>
        </div>
        {this.renderCursors()}
      </div>
    );
  }
}
