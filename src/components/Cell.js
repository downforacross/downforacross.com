import './css/cell.css';

import React, { Component } from 'react';
import _ from 'lodash';

import { getTime } from '../actions';
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
    const { cursors } = this.props;
    if (nextProps.cursors.length !== cursors.length) {
      return true;
    }
    return false;
  }

  renderCursors() {
    const { cursors } = this.props;
    return (
      <div className='cell--cursors'>
        {cursors.map(({color}, i) => (
          <div key={i} className='cell--cursor' style={{
            borderColor: color,
            zIndex: Math.min(2 + cursors.length - i, 9),
            borderWidth: Math.min(1 + 2 * (i + 1), 12)
          }}>
        </div>
        ))}
      </div>
    );
  }

  renderFlipButton() {
    const { canFlipColor, onFlipColor } = this.props;
    if (canFlipColor) {
      return (
        <i
          className='cell--flip fa fa-small fa-sticky-note'
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
    const { circled } = this.props;
    if (circled) {
      return (
        <div className='cell--circle' />
      );
    }
    return null;
  }

  renderShade() {
    const { shaded } = this.props;
    if (shaded) {
      return (
        <div className='cell--shade' />
      );
    }
    return null;
  }

  render() {
    const {
      black, selected, highlighted, shaded, bad, good, revealed, pencil, value, myColor, onClick, number, referenced,
    } = this.props;
    if (black) {
      return (
        <div className={'cell black ' + (selected ? 'selected' : '')}
        style={selected
            ? { borderColor: myColor }
            : undefined
        }
        onTouchEnd={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={onClick}
        />
      );
    }

    let val = value || '';

    let l = Math.max(1, val.length);
    return (
      <div
        className={
          (selected
            ? 'selected '
            : ''
          ) + (highlighted
            ? 'highlighted '
            : ''
          ) + (referenced
            ? 'referenced '
            : ''
          ) + (shaded
            ? 'shaded '
            : ''
          ) + (bad
            ? 'bad '
            : ''
          ) + (good
            ? 'good '
            : ''
          ) + (revealed
            ? 'revealed '
            : ''
          ) + (pencil
            ? 'pencil '
            : ''
          ) + 'cell'
        }
        style={selected
            ? { backgroundColor: myColor }
            : null
        }
        onClick={onClick}
        onTouchMove={e => {
          if (e.touches.length >= 1) {
            window.lastZoomed = getTime();
          } else {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onTouchEnd={e => {
          e.preventDefault();
          const now = getTime();
          const disablePeriod = 200;
          if (!window.lastZoomed || window.lastZoomed + disablePeriod < now) {
            onClick(e);
          }
        }}>
        <div className='cell--wrapper'>

          <div className={'cell--number' + (number
            ?  ' nonempty'
            : ''
          )}>
          { number }
        </div>
        { this.renderFlipButton() }
        { this.renderCircle() }
        { this.renderShade() }
        <div className='cell--value'
          style={{
            fontSize: 350 / Math.sqrt(l) + '%',
            lineHeight: Math.sqrt(l) * 98 + '%'
          }}
        >
          { val }
        </div>
      </div>
      { this.renderCursors() }
    </div>
    );
  }
}
