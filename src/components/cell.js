import './cell.css';

import React, { Component } from 'react';

/*
 * Summary of Cell component
 *
 * Props: { black, selected, highlighted, bad, good, helped,
 *          value, onClick, cursor }
 *  - edits is not currently used, except for backwards compat.
 *
 * State: {}
 *
 * Children: []
 *
 * Potential parents:
 * - Grid
 **/

export default class Cell extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    if(['black', 'selected', 'highlighted', 'bad', 'good', 'helped', 'revealed', 'value', 'number', 'myColor', 'referenced'].some(attr => this.props[attr] !== nextProps[attr])) {
      return true;
    }
    if (nextProps.cursors.length !== this.props.cursors.length) {
      return true;
    }
    return false;
  }

  renderCursors() {
    return (
      <div className='cell--cursors'>
        {this.props.cursors.map(({color}, i) => (
          <div key={i} className='cell--cursor' style={{
            borderColor: color,
            zIndex: Math.min(2 + this.props.cursors.length - i, 9),
            borderWidth: Math.min(1 + 2 * (i + 1), 16)
          }}>
        </div>
        ))}
      </div>
    );
  }

  renderFlipButton() {
    if (this.props.canFlipColor) {
      return (
        <i
          className='cell--flip fa fa-small fa-sticky-note'
          onClick={(e) => {
            e.stopPropagation();
            this.props.onFlipColor();
          }}
        />
      );
    }
    return null;
  }

  renderCircle() {
    if (this.props.circled) {
      return (
        <div className='cell--circle' />
      );
    }
    return null;
  }

  render() {
    if (this.props.black) {
      return (
        <div className='cell black'>
          { this.renderFlipButton() }
        </div>
      );
    }

    let val = this.props.value;
    // TODO remove backwards compat
    if (val === undefined) {
      if (this.props.edits && this.props.edits.value) { // backwards compat.
        val = this.props.edits.value;
      } else {
        val = '';
      }
    }

    let l = Math.max(1, val.length);
    return (
      <div
        className={
          (this.props.selected
            ? 'selected '
            : ''
          ) + (this.props.highlighted
            ? 'highlighted '
            : ''
          ) + (this.props.referenced
            ? 'referenced '
            : ''
          ) + (this.props.bad
            ? 'bad '
            : ''
          ) + (this.props.good
            ? 'good '
            : ''
          ) + (this.props.revealed
            ? 'revealed '
            : ''
          ) + 'cell'
        }
        style={this.props.selected
            ? { backgroundColor: this.props.myColor }
            : null
        }
        onClick={this.props.onClick}>
        <div className={'cell--number' + (this.props.number
              ?  ' nonempty'
              : ''
            )}>
            { this.props.number }
          </div>
          { this.renderFlipButton() }
          { this.renderCursors() }
          { this.renderCircle() }
          <div className='cell--value'
            style={{
              fontSize: 350 / Math.sqrt(l) + '%',
              lineHeight: Math.sqrt(l) * 98 + '%'
            }}
          >
            { val }
          </div>
        </div>
    );
  }
}
