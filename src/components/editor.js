import './css/editor.css';

import Grid from './grid';
import GridControls from './gridControls';
import React, { Component } from 'react';
import EditableSpan from '../components/editableSpan';
import Hints from '../components/hints';

import GridObject from '../utils/Grid';
import * as gameUtils from '../gameUtils';

window.requestIdleCallback =
  window.requestIdleCallback ||
  function (cb) {
    var start = Date.now();
    return setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        }
      });
    }, 1);
  };

window.cancelIdleCallback =
  window.cancelIdleCallback ||
  function (id) {
    clearTimeout(id);
  };


/*
 * Summary of Editor component
 *
 * Props: { grid, clues, updateGrid, updateClues }
 *
 * State: { selected, direction }
 *
 * Children: [ GridControls, Grid, EditableClues ]
 * - GridControls.props:
 *   - attributes: { selected, direction, grid, clues }
 *   - callbacks: { setSelected, setDirection }
 * - Grid.props:
 *   - attributes: { grid, selected, direction }
 *   - callbacks: { setSelected, changeDirection }
 * - EditableClues.props:
 *   - attributes: { getClueList(), selected, halfSelected }
 *   - callbacks: { selectClue }
 *
 * Potential parents (so far):
 * - Compose
 **/


export default class Editor extends Component {

  constructor(props) {
    super();
    const grid = gameUtils.makeGrid(props.grid, true);
    this.state = {
      selected: grid.fixSelect({ r: 0, c: 0 }),
      clues: grid.alignClues(props.clues),
      direction: 'across',
      grid: grid.toArray()
    };

    if (!this.isValidDirection(this.state.direction, this.state.selected)) {
      this.state.setState({
        direction: 'down'
      });
    }

    // for deferring scroll-to-clue actions
    this.prvNum = {};
    this.prvIdleID = {};
  }

  get grid() {
    return new GridObject(this.state.grid);
  }

  didChangePatternOrDims(oldGrid, newGrid) {
    if (oldGrid.length !== newGrid.length || oldGrid[0].length !== newGrid[0].length) {
      return true;
    }

    let result = false;
    oldGrid.forEach((row, r) => {
      if (result) return;
      row.forEach((cell, c) => {
        if ((cell.black) !== (newGrid[r][c] === '.')) {
          result = true;
        }
      });
    });

    return result;
  }

  componentWillReceiveProps(props) {
    let grid, clues;
    if (props.pid !== this.props.pid || this.didChangePatternOrDims(this.state.grid, props.grid)) {
      grid = gameUtils.makeGrid(props.grid, true);
      clues = grid.alignClues(props.clues);
      this.setState({
        selected: grid.fixSelect(this.state.selected)
      });
    } else {
      grid = this.state.grid;
      clues = this.state.clues;

      this.grid.items().forEach(([r, c, cell]) => {
        cell.value = props.grid[r][c];
      });
      clues.across.forEach((clue, i) => {
        clues.across[i] = (props.clues && props.clues.across && props.clues.across[i]) || '';
      });
      clues.down.forEach((clue, i) => {
        clues.down[i] = (props.clues && props.clues.down && props.clues.down[i]) || '';
      });
    }
    this.setState({
      grid: grid.toArray(),
      clues: clues,
    });
  }

  /* Callback fns, to be passed to child components */

  isValidDirection(direction, selected) {
    return this.grid.getParent(selected.r, selected.c, direction) !== 0;
  }

  canSetDirection(direction) {
    return this.isValidDirection(direction, this.state.selected);
  }

  setDirection(direction) {
    this.setState({
      direction: direction
    });
  }

  setSelected(selected) {
    if (this.isValidDirection(this.state.direction, selected)) {
      if (selected.r !== this.state.selected.r || selected.c !== this.state.selected.c) {
        this.setState({
          selected: selected,
        });
      }
    } else if (this.isValidDirection(gameUtils.getOppositeDirection(this.state.direction), selected)) {
      this.setState({
        selected: selected,
        direction: gameUtils.getOppositeDirection(this.state.direction)
      });
    }
  }

  changeDirection() {
    if (this.grid.getParent(this.state.selected.r, this.state.selected.c, gameUtils.getOppositeDirection(this.state.direction))) {
      this.setDirection(gameUtils.getOppositeDirection(this.state.direction));
    }
  }

  selectClue(direction, number) {
    this.refs.gridControls.selectClue(direction, number);
  }

  /* Helper functions used when rendering */

  getClueBarAbbreviation() {
    return this.getSelectedClueNumber() + this.state.direction.substr(0, 1).toUpperCase();
  }

  getSelectedClueNumber() {
    return this.grid.getParent(this.state.selected.r, this.state.selected.c, this.state.direction);
  }

  getHalfSelectedClueNumber() {
    return this.grid.getParent(this.state.selected.r, this.state.selected.c, gameUtils.getOppositeDirection(this.state.direction));
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
    const { selected, direction } = this.state;
    const selectedParent = this.grid.getParent(selected.r, selected.c, direction);
    return (
      !this.isSelected(r, c) &&
      this.grid.isWhite(r, c) &&
      this.grid.getParent(r, c, direction) === selectedParent
    );
  }

  isSelected(r, c) {
    const { selected } = this.state;
    return r === selected.r && c === selected.c;
  }

  /* Misc functions */

  // Interacts directly with the DOM
  // Very slow -- use with care
  scrollToClue(dir, num, el) {
    if (el && this.prvNum[dir] !== num) {
      this.prvNum[dir] = num;
      if (this.prvIdleID[dir]) {
        cancelIdleCallback(this.prvIdleID[dir]);
      }
      this.prvIdleID[dir] = requestIdleCallback(() => {
        if (this.clueScroll === el.offsetTop) return;
        const parent = el.offsetParent;
        parent.scrollTop = el.offsetTop - (parent.offsetHeight * .4);
        this.clueScroll = el.offsetTop;
      });
    }
  }

  focusGrid() {
    this.refs.gridControls && this.refs.gridControls.focus();
  }

  focusClue() {
    this.refs.clue && this.refs.clue.startEditing();
  }

  /* Render */

  renderHints() {
  }

  renderLeft() {
    return (
      <div className='editor--main--left'>
        <div className='editor--main--clue-bar'>
          <div className='editor--main--clue-bar--number'>
            { this.getClueBarAbbreviation() }
          </div>
          <div className='editor--main--clue-bar--text'>
            <EditableSpan
              ref='clue'
              value={this.state.clues[this.state.direction][this.getSelectedClueNumber()]}
              onChange={value => this.props.updateClues(this.state.direction, this.getSelectedClueNumber(), value)}
              onBlur={() => this.focusGrid()}
            />
          </div>
        </div>


        <div
          className={'editor--main--left--grid blurable'}>
          <Grid
            ref='grid'
            size={this.props.size}
            grid={this.state.grid}
            selected={this.state.selected}
            direction={this.state.direction}
            onSetSelected={this.setSelected.bind(this)}
            onChangeDirection={this.changeDirection.bind(this)}
            canFlipColor={true}
            onFlipColor={this.props.onFlipColor.bind(this)}
            myColor={this.props.myColor}
            references={[]}
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='editor--main--wrapper'>
        <GridControls
          ref='gridControls'
          ignore='input'
          selected={this.state.selected}
          direction={this.state.direction}
          canSetDirection={this.canSetDirection.bind(this)}
          onSetDirection={this.setDirection.bind(this)}
          onSetSelected={this.setSelected.bind(this)}
          onEnter={() => this.setState({ editingClue: true }, this.focusClue.bind(this))}
          updateGrid={this.props.updateGrid}
          grid={this.state.grid}
          clues={this.state.clues}
        >

        <div className='editor--main'>
          {this.renderLeft()}
          <div className='editor--right'>
            <div className='editor--main--clues'>
              {
                // Clues component
                ['across', 'down'].map((dir, i) => (
                  <div key={i} className='editor--main--clues--list'>
                    <div className='editor--main--clues--list--title'>
                      {dir.toUpperCase()}
                    </div>

                    <div
                      className={'editor--main--clues--list--scroll ' + dir}
                      ref={'clues--list--'+dir}>
                      {
                        this.state.clues[dir].map((clue, i) => clue !== undefined && (
                          <div key={i}
                            className={
                              (this.isClueSelected(dir, i)
                                ? 'selected '
                                : (this.isClueHalfSelected(dir, i)
                                  ? 'half-selected '
                                  : ' ')
                              )
                                + 'editor--main--clues--list--scroll--clue'
                            }
                            ref={
                              (this.isClueSelected(dir, i) ||
                                this.isClueHalfSelected(dir, i))
                                ? this.scrollToClue.bind(this, dir, i)
                                : null
                            }
                            onClick={this.selectClue.bind(this, dir, i)}>
                            <div className='editor--main--clues--list--scroll--clue--number'>
                              {i}
                            </div>
                            <div className='editor--main--clues--list--scroll--clue--text'>
                              {clue}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                ))
              }
            </div>

            <div className='editor--right--hints'>
              <h2> Hints </h2>
              <Hints
                grid={this.state.grid}
                num={this.getSelectedClueNumber()}
                direction={this.state.direction}
              />
            </div>
          </div>
        </div>
      </GridControls>
    </div>
    );
  }
}
