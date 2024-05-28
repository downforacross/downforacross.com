import * as React from 'react';
import * as _ from 'lodash';
import clsx from 'clsx';
import Tooltip from '@material-ui/core/Tooltip';
import Emoji from '../common/Emoji';
import powerups from '../../lib/powerups';
import {Ping, CellStyles} from './types';
import './css/cell.css';
import {CellData, Cursor} from '../../shared/types';

export interface EnhancedCellData extends CellData {
  r: number;
  c: number;

  // Player interactions
  cursors: Cursor[];
  pings: Ping[];
  solvedByIconSize: number;

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
  attributionColor: string;
  cellStyle: CellStyles;
  myColor: string;
}

interface Props extends EnhancedCellData {
  // Callbacks
  onClick: (r: number, c: number) => void;
  onContextMenu: (r: number, c: number) => void;
  onFlipColor?: (r: number, c: number) => void;
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
    const pathsToOmit = ['cursors', 'pings', 'cellStyle'] as const;
    if (!_.isEqual(_.omit(nextProps, ...pathsToOmit), _.omit(this.props, pathsToOmit))) {
      console.debug(
        'cell update',
        // @ts-ignore
        _.filter(_.keys(this.props), (k) => this.props[k] !== nextProps[k])
      );
      return true;
    }
    if (_.some(pathsToOmit, (p) => JSON.stringify(nextProps[p]) !== JSON.stringify(this.props[p]))) {
      console.debug('cell update for array');
      return true;
    }

    return false;
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
            onFlipColor?.(this.props.r, this.props.c);
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

  renderSolvedBy() {
    if (!this.props.solvedBy) return null;
    const divStyle: React.CSSProperties = {
      width: this.props.solvedByIconSize! * 2,
      height: this.props.solvedByIconSize! * 2,
      borderRadius: this.props.solvedByIconSize!,
      backgroundColor: this.props.solvedBy?.teamId === 1 ? '#FA8072' : 'purple',
      // transform: 'translateX(-0.5px)',
      position: 'absolute',
      right: 1,
    };
    return <div style={divStyle} />;
  }

  getStyle() {
    const {attributionColor, cellStyle, selected, highlighted, frozen} = this.props;
    if (selected) {
      return cellStyle.selected;
    }
    if (highlighted) {
      if (frozen) {
        return cellStyle.frozen;
      }
      return cellStyle.highlighted;
    }
    return {backgroundColor: attributionColor};
  }

  handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault?.();
    this.props.onClick(this.props.r, this.props.c);
  };

  handleRightClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault?.();
    this.props.onContextMenu(this.props.r, this.props.c);
  };

  render() {
    const {
      black,
      isHidden,
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
      frozen,
    } = this.props;
    if (black || isHidden) {
      return (
        <div
          className={clsx('cell', {
            selected,
            black,
            hidden: isHidden,
          })}
          style={selected ? {borderColor: myColor} : undefined}
          onClick={this.handleClick}
          onContextMenu={this.handleRightClick}
        >
          {this.renderPings()}
        </div>
      );
    }

    const val = value || '';

    const l = Math.max(1, val.length);

    const displayNames = this.props.cursors.map((cursor) => cursor.displayName).join(', ');

    const style = this.getStyle();

    return (
      <Tooltip title={displayNames}>
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
            frozen,
          })}
          style={style}
          onClick={this.handleClick}
          onContextMenu={this.handleRightClick}
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
            {this.renderSolvedBy()}
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
      </Tooltip>
    );
  }
}
