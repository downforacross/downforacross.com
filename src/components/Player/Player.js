/* eslint react/no-string-refs: "warn" */
import './css/index.css';

import React, {Component} from 'react';
import {getTime} from '../../store/firebase';
import {lazy} from '../../lib/jsUtils';

import GridObject from '../../lib/wrappers/GridWrapper';

import Grid from '../Grid';
import ListView from '../ListView';
import Clues from './Clues';
import Clue from './ClueText';
import GridControls from './GridControls';
import MobileGridControls from './MobileGridControls';
import MobileListViewControls from './MobileListViewControls';
import ListViewControls from './ListViewControls';
import ConnectionStats from './ConnectionStats';

import {lightenHsl} from '../../lib/colors';
import * as gameUtils from '../../lib/gameUtils';

const CURSOR_TIMEOUT = 60000;
const PING_TIMEOUT = 10000;
/*
 * Summary of Player component
 *
 * Props: { grid, clues, updateGrid }
 *
 * State: { selected, direction, mobileMode }
 *
 * Children: [ GridControls, Grid, Clues ]
 * - GridControls.props:
 *   - attributes: { selected, direction, grid, clues }
 *   - callbacks: { setSelected, setDirection }
 * - Grid.props:
 *   - attributes: { grid, selected, direction }
 *   - callbacks: { setSelected, changeDirection }
 * - Clues.props:
 *   - attributes: { getClueList(), selected, halfSelected }
 *   - callbacks: { selectClue }
 *
 * */

export default class Player extends Component {
  constructor(props) {
    super(props);
    const selected =
      this.props.currentCursor?.r && this.props.currentCursor?.c
        ? this.props.currentCursor
        : this.getInitialSelected();
    this.state = {
      selected: selected,
      direction: this.props.clues.across.length ? 'across' : 'down',
    };

    // for deferring scroll-to-clue actions
    this.prvNum = {};
    this.prvIdleID = {};
    this._isClueSelected = this.isClueSelected.bind(this);
    this._isClueHalfSelected = this.isClueHalfSelected.bind(this);
    this._isClueFilled = this.isClueFilled.bind(this);
    this._selectClue = this.selectClue.bind(this);
    this._scrollToClue = this.scrollToClue.bind(this);
    this._setDirection = this.setDirection.bind(this);
    this._canSetDirection = this.canSetDirection.bind(this);
    this._setSelected = this.setSelected.bind(this);
    this._changeDirection = this.changeDirection.bind(this);
    this.mobileContainer = React.createRef();
    this.cursorLocked = false;
  }

  updateSize = () => {
    const el = this.mobileContainer.current;
    if (!el) return;
    const {width, height} = el.getBoundingClientRect();
    const rows = this.props.grid.length;
    const cols = this.props.grid[0].length;
    const size = Math.floor(Math.min(width / cols, height / rows));
    this.setState({
      size,
    });
  };

  componentDidMount() {
    window.addEventListener('resize', this.updateSize);
    this.updateSize();
  }

  componentDidUpdate(prevProps) {
    if (this.props.currentCursor && this.props.currentCursor !== prevProps.currentCursor) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        selected: {
          r: this.props.currentCursor.r,
          c: this.props.currentCursor.c,
        },
      });
    }
    if (document.querySelector('.player--main--wrapper')) {
      this.previousSize = document.querySelector('.player--main--wrapper').getBoundingClientRect().width;
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateSize);
  }

  get size() {
    return this.state.size || this.props.size;
  }

  get grid() {
    if (!this._grid || this._grid.grid !== this.props.grid) {
      this._grid = new GridObject(this.props.grid);
    }
    return this._grid;
  }

  get selected() {
    let {r, c} = this.state.selected;
    while (!this.grid.isWhite(r, c)) {
      if (c + 1 < this.props.grid[0].length) {
        c += 1;
      } else if (r + 1 < this.props.grid.length) {
        r += 1;
        c = 0;
      } else {
        return {r: 0, c: 0};
      }
    }
    return {r, c};
  }

  getInitialSelected() {
    let r = 0;
    let c = 0;
    let direction = this.props.clues.across.length ? 'across' : 'down';
    while (!this.grid.isWhite(r, c) || !this.props.clues[direction][this.grid.getParent(r, c, direction)]) {
      if (c + 1 < this.props.grid[0].length) {
        c += 1;
      } else if (r + 1 < this.props.grid.length) {
        r += 1;
        c = 0;
      } else {
        return {r: 0, c: 0};
      }
    }
    return {r, c};
  }

  focus() {
    this.refs.gridControls && this.refs.gridControls.focus();
  }

  /* Callback fns, to be passed to child components */

  isValidDirection(direction, selected) {
    return this.grid.getParent(selected.r, selected.c, direction) !== 0;
  }

  canSetDirection(direction) {
    return this.isValidDirection(direction, this.selected);
  }

  setDirection(direction) {
    if (this.isValidDirection(direction, this.selected)) {
      this.setState({
        direction,
      });
    }
  }

  setSelected(selected) {
    if (this.cursorLocked) return;
    if (!this.grid.isWhite(selected.r, selected.c)) {
      return;
    }
    if (this.isValidDirection(this.state.direction, selected)) {
      if (selected.r !== this.selected.r || selected.c !== this.selected.c) {
        this.setState(
          {
            selected,
          },
          () => {
            this.props.updateCursor({
              r: selected.r,
              c: selected.c,
            });
          }
        );
      }
    } else if (this.isValidDirection(gameUtils.getOppositeDirection(this.state.direction), selected)) {
      this.setState(
        {
          selected,
          // eslint-disable-next-line react/no-access-state-in-setstate
          direction: gameUtils.getOppositeDirection(this.state.direction),
        },
        () => {
          this.props.updateCursor({
            r: selected.r,
            c: selected.c,
          });
        }
      );
    }
  }

  handlePing = (r, c) => {
    this.props.addPing && this.props.addPing({r, c});
  };

  changeDirection() {
    if (this.cursorLocked) return;
    this.setDirection(gameUtils.getOppositeDirection(this.state.direction));
  }

  selectClue(direction, number) {
    this.refs.gridControls.selectClue(direction, number);
  }

  /* Helper functions used when rendering */

  getClueBarAbbreviation() {
    return this.getSelectedClueNumber() + this.state.direction.substr(0, 1).toUpperCase();
  }

  getClueBarText() {
    return this.props.clues[this.state.direction][this.getSelectedClueNumber()];
  }

  getSelectedClueNumber() {
    return this.grid.getParent(this.selected.r, this.selected.c, this.state.direction);
  }

  getHalfSelectedClueNumber() {
    return this.grid.getParent(
      this.selected.r,
      this.selected.c,
      gameUtils.getOppositeDirection(this.state.direction)
    );
  }

  isClueFilled(direction, number) {
    const clueRoot = this.grid.getCellByNumber(number);
    return !this.grid.hasEmptyCells(clueRoot.r, clueRoot.c, direction);
  }

  isClueSelected(direction, number) {
    return direction === this.state.direction && number === this.getSelectedClueNumber();
  }

  isClueHalfSelected(direction, number) {
    return direction !== this.state.direction && number === this.getHalfSelectedClueNumber();
  }

  isHighlighted(r, c) {
    return this.refs.grid.isHighlighted(r, c);
  }

  isSelected(r, c) {
    return this.refs.grid.isSelected(r, c);
  }

  /* Public functions, called by parent components */

  getAllSquares() {
    return this.grid.keys().map(([r, c]) => ({r, c}));
  }

  getSelectedAndHighlightedSquares() {
    return this.getAllSquares().filter(({r, c}) => this.isSelected(r, c) || this.isHighlighted(r, c));
  }

  getSelectedSquares() {
    return this.getAllSquares().filter(({r, c}) => this.isSelected(r, c));
  }

  getReferences() {
    const {clues} = this.props;
    const clueText = this.getClueBarText();
    return gameUtils.getReferencedClues(clueText, clues);
  }

  /* Misc functions */

  // Interacts directly with the DOM
  // Very slow -- use with care
  scrollToClue(dir, num, el) {
    if (el && this.prvNum[dir] !== num) {
      this.prvNum[dir] = num;
      lazy(`scrollToClue${dir}`, () => {
        const parent = el.offsetParent;
        if (parent) {
          parent.scrollTop = el.offsetTop - parent.offsetHeight * 0.4;
        }
      });
    }
  }

  handleSetCursorLock = (val) => {
    setTimeout(
      () => {
        this.cursorLocked = val;
      },
      val ? 0 : 150
    );
  };

  render() {
    const {
      mobile,
      onPressEnter,
      onPressPeriod,
      listMode,
      vimMode,
      vimInsert,
      onVimNormal,
      onVimInsert,
      grid,
      clues,
      circles,
      beta,
      cursors: allCursors = [],
      pings: allPings = [],
      updateGrid,
      frozen,
      myColor,
      users = {},
      id,
      pickups,
      clueBarStyle = {},
      gridStyle = {},
      colorAttributionMode,
    } = this.props;
    const size = this.size;
    const {cellStyle = {}} = gridStyle;

    const currentTime = getTime();
    const cursors = allCursors
      .filter((cursor) => cursor.id !== id)
      .map((cursor) => ({
        ...cursor,
        active: cursor.timestamp > currentTime - CURSOR_TIMEOUT,
        color: users[cursor.id]?.color || 'blue',
        displayName: users[cursor.id]?.displayName || '',
      }));
    const pings = allPings
      .map((ping) => ({
        ...ping,
        active: ping.timestamp > currentTime - PING_TIMEOUT,
        age: (currentTime - ping.timestamp) / PING_TIMEOUT,
        color: users[ping.id]?.color || 'blue',
      }))
      .filter(({active}) => active);
    const {direction} = this.state;
    const selected = this.selected;

    const gridWithColors = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        attributionColor: cell.value && colorAttributionMode ? lightenHsl(users[cell.user_id]?.color) : '',
      }))
    );

    const gridProps = {
      size,
      grid: gridWithColors,
      circles,
      selected,
      references: this.getReferences(),
      direction,
      cursors,
      pings,
      onSetSelected: this._setSelected,
      onPing: this.handlePing,
      cellStyle,
      myColor,
      onChangeDirection: this._changeDirection,
      pickups,
      frozen,
    };

    const clueProps = {
      clues: this.props.clues,
      clueLengths: this.grid.clueLengths,
      isClueSelected: this._isClueSelected,
      isClueHalfSelected: this._isClueHalfSelected,
      isClueFilled: this._isClueFilled,
      scrollToClue: this._scrollToClue,
      selectClue: this._selectClue,
    };

    const listViewProps = {
      ...gridProps,
      ...clueProps,
      size: Math.min(20, size),
    };

    if (mobile) {
      if (listMode) {
        return (
          <div className="player--mobile--wrapper mobile">
            <MobileListViewControls
              ref="mobileGridControls"
              onPressEnter={onPressEnter}
              onPressPeriod={onPressPeriod}
              selected={selected}
              direction={direction}
              onSetDirection={this._setDirection}
              onChangeDirection={this._changeDirection}
              canSetDirection={this._canSetDirection}
              onSetSelected={this._setSelected}
              updateGrid={updateGrid}
              size={size}
              grid={grid}
              clues={clues}
              onSetCursorLock={this.handleSetCursorLock}
              enableDebug={window.location.search.indexOf('debug') !== -1}
            >
              <div className="player--mobile" ref={this.mobileContainer}>
                <div className={`player--mobile--list-view`}>
                  <ListView ref="grid" {...listViewProps} />
                </div>
              </div>
            </MobileListViewControls>
          </div>
        );
      }
      return (
        <div className="player--mobile--wrapper mobile">
          <MobileGridControls
            enablePan
            ref="mobileGridControls"
            onPressEnter={onPressEnter}
            onPressPeriod={onPressPeriod}
            selected={selected}
            direction={direction}
            onSetDirection={this._setDirection}
            onChangeDirection={this._changeDirection}
            canSetDirection={this._canSetDirection}
            onSetSelected={this._setSelected}
            updateGrid={updateGrid}
            size={size}
            grid={grid}
            clues={clues}
            onSetCursorLock={this.handleSetCursorLock}
            enableDebug={window.location.search.indexOf('debug') !== -1}
          >
            <div className="player--mobile" ref={this.mobileContainer}>
              <div className={`player--mobile--grid${frozen ? ' frozen' : ''}`}>
                <Grid ref="grid" {...gridProps} />
              </div>
            </div>
          </MobileGridControls>
        </div>
      );
    }

    if (listMode) {
      return (
        <div
          className="player--main--wrapper"
          style={{
            minWidth: this.previousSize,
          }}
        >
          <ListViewControls
            ref="gridControls"
            onPressEnter={onPressEnter}
            onPressPeriod={onPressPeriod}
            vimMode={vimMode}
            vimInsert={vimInsert}
            onVimInsert={onVimInsert}
            onVimNormal={onVimNormal}
            selected={selected}
            direction={direction}
            onSetDirection={this._setDirection}
            canSetDirection={this._canSetDirection}
            onSetSelected={this._setSelected}
            updateGrid={updateGrid}
            grid={grid}
            clues={clues}
            beta={beta}
            onCheck={this.props.onCheck}
            onReveal={this.props.onReveal}
          >
            <div className="player--main">
              <div className="player--main--list-view">
                <ListView ref="grid" {...listViewProps} />
              </div>
            </div>
          </ListViewControls>
        </div>
      );
    }

    return (
      <div className="player--main--wrapper">
        <GridControls
          ref="gridControls"
          onPressEnter={onPressEnter}
          onPressPeriod={onPressPeriod}
          vimMode={vimMode}
          vimInsert={vimInsert}
          onVimInsert={onVimInsert}
          onVimNormal={onVimNormal}
          selected={selected}
          direction={direction}
          onSetDirection={this._setDirection}
          canSetDirection={this._canSetDirection}
          onSetSelected={this._setSelected}
          updateGrid={updateGrid}
          grid={grid}
          clues={clues}
          beta={beta}
          onCheck={this.props.onCheck}
          onReveal={this.props.onReveal}
        >
          <div className="player--main">
            <div className="player--main--left">
              <div className="player--main--clue-bar" style={clueBarStyle}>
                <div className="player--main--clue-bar--number">{this.getClueBarAbbreviation()}</div>
                <div className="player--main--clue-bar--text--wrapper">
                  <div className="player--main--clue-bar--text">
                    <Clue text={this.getClueBarText()} />
                  </div>
                </div>
              </div>

              <div className={`player--main--left--grid${frozen ? ' frozen' : ''} blurable`}>
                <Grid ref="grid" {...gridProps} />
              </div>
            </div>

            <div className="player--main--clues">
              <Clues {...clueProps} />
            </div>
          </div>
        </GridControls>
        {this.props.beta && (
          <div
            style={{
              color: 'gray',
              margin: '0 auto',
            }}
          >
            <div>
              {this.props.optimisticCounter ? <>{this.props.optimisticCounter} ahead</> : <>Synced</>}
            </div>
            <div>
              <ConnectionStats />
            </div>
          </div>
        )}
      </div>
    );
  }
}
