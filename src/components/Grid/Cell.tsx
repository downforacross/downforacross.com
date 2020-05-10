import * as React from 'react';
import * as _ from 'lodash';
import clsx from 'clsx';
import Emoji from '../common/Emoji';
import powerups from '../../lib/powerups';
import {Cursor, Ping, CellStyles} from './types';
import './css/cell.css';

interface Props {
  // Cell data
  value?: string;
  number?: number;
  revealed?: boolean;
  bad?: boolean;
  good?: boolean;
  pencil?: boolean;
  black?: boolean;

  // Player interactions
  cursors: Cursor[];
  pings: Ping[];

  // Cell states
  selected: boolean;
  highlighted: boolean;
  frozen: boolean;
  circled: boolean;
  shaded: boolean;
  referenced: boolean;
  canFlipColor: boolean;
  pickupType: keyof typeof powerups;

  // Styles
  cellStyle: CellStyles;
  myColor: string;

  // Callbacks
  onClick: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onContextMenu: (e?: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  onFlipColor: () => void;
}
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
 * */
export default class Cell extends React.Component<Props> {
  private touchStart: {pageX: number; pageY: number} = {pageX: 0, pageY: 0};

  shouldComponentUpdate(nextProps: Props) {
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
            className={clsx('cell--cursor', {
              active,
              inactive: !active,
            })}
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

  renderPings() {
    const {pings} = this.props;
    return (
      <div className="cell--pings">
        {pings.map(({color, active}, i) => (
          <div
            key={i}
            className={clsx('cell--ping', {
              active,
              inactive: !active,
            })}
            style={{
              borderColor: color,
              zIndex: Math.min(2 + pings.length - i, 9),
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
      return <Emoji emoji={icon} big={false} />;
    }
    return null;
  }

  getStyle() {
    const {cellStyle, selected, highlighted, frozen} = this.props;
    if (selected) {
      return cellStyle.selected;
    }
    if (highlighted) {
      if (frozen) {
        return cellStyle.frozen;
      }
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
      onContextMenu,
      number,
      referenced,
    } = this.props;
    if (black) {
      return (
        <div
          className={clsx('cell', 'black', {
            selected,
          })}
          style={selected ? {borderColor: myColor} : undefined}
          onClick={onClick}
          onContextMenu={onContextMenu}
        >
          {this.renderPings()}
        </div>
      );
    }

    const val = value || '';

    const l = Math.max(1, val.length);
    const style = this.getStyle();
    return (
      <div
        className={clsx('cell', {
          selected,
          highlighted,
          referenced,
          shaded,
          bad,
          good,
          revealed,
          pencil,
        })}
        style={style}
        onClick={onClick}
        onContextMenu={onContextMenu}
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
          <div
            className={clsx('cell--number', {
              nonempty: !!number,
            })}
          >
            {number}
          </div>
          {this.renderFlipButton()}
          {this.renderCircle()}
          {this.renderShade()}
          {this.renderPickup()}
          <div
            className="cell--value"
            style={{
              fontSize: `${350 / Math.sqrt(l)}%`,
              lineHeight: `${Math.sqrt(l) * 98}%`,
            }}
          >
            {val}
          </div>
        </div>
        {this.renderCursors()}
        {this.renderPings()}
      </div>
    );
  }
}
