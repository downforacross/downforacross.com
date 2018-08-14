import './css/editor.css';
import Flex from 'react-flexview';
import React, { Component } from 'react';
import Grid from './Grid';
import GridControls from './GridControls';
import EditableSpan from './EditableSpan';
import Hints from './Hints';

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
  constructor() {
    super();
    this.state = {
      selected: {
        r: 0,
        c: 0,
      },
      direction: 'across',
    };
    this.prvNum = {};
    this.prvIdleID = {};
  }

  get grid() {
    const grid = new GridObject(this.props.grid);
    grid.assignNumbers();
    return grid;
  }

  /* Callback fns, to be passed to child components */

  canSetDirection = () => (
    true
  )

  handleSetDirection = (direction) => {
    this.setState({
      direction: direction
    });
  }

  handleSetSelected = (selected) => {
    this.setState({
      selected,
    });
  }

  handleChangeDirection = () => {
    this.setState({
      direction: gameUtils.getOppositeDirection(this.state.direction),
    });
  }

  handleSelectClue = (direction, number) => {
    this.refs.gridControls.selectClue(direction, number);
  }

  handleUpdateGrid = (r, c, value) => {
    this.props.onUpdateGrid(r, c, value);
    this.props.onChange();
  }

  handlePressPeriod = () => {
    const { selected } = this.state;
    this.props.onFlipColor(selected.r, selected.c);
    this.props.onChange();
  }

  handleChangeClue = value => {
    const { selected, direction } = this.state;
    this.props.onUpdateClue(this.selectedParent.r, this.selectedParent.c, direction, value)
    this.props.onChange();
  }

  /* Helper functions used when rendering */

  get selectedIsWhite() {
    const { selected } = this.state;
    return this.grid.isWhite(selected.r, selected.c);
  }

  get clueBarAbbreviation() {
    const { direction } = this.state;
    if (!this.selectedIsWhite) return;
    if (!this.selectedClueNumber) return;
    return this.selectedClueNumber + direction.substr(0, 1).toUpperCase();
  }

  get selectedClueNumber() {
    const { selected, direction } = this.state;
    if (!this.selectedIsWhite) return;
    return this.grid.getParent(selected.r, selected.c, direction);
  }

  get halfSelectedClueNumber() {
    const { selected, direction } = this.state;
    if (!this.selectedIsWhite) return;
    return this.grid.getParent(selected.r, selected.c, gameUtils.getOppositeDirection(direction));
  }

  get selectedParent() {
    if (!this.selectedIsWhite) return;
    return this.grid.getCellByNumber(this.selectedClueNumber);
  }

  isClueFilled(direction, number) {
    const clueRoot = this.grid.getCellByNumber(number);
    return !this.grid.hasEmptyCells(clueRoot.r, clueRoot.c, direction);
  }

  isClueSelected(direction, number) {
    return direction === this.state.direction && number === this.selectedClueNumber;
  }

  isClueHalfSelected(direction, number) {
    return direction !== this.state.direction && number === this.halfSelectedClueNumber;
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

  focus() {
    this.focusGrid();
  }

  /* Render */

  renderLeft() {
    const { selected, direction } = this.state;
    return (
      <div className='editor--main--left'>
        <div className='editor--main--clue-bar'>
          <div className='editor--main--clue-bar--number'>
            { this.clueBarAbbreviation }
          </div>
          <div className='editor--main--clue-bar--text'>
            <EditableSpan
              ref='clue'
              value={this.props.clues[direction][this.selectedClueNumber] || ''}
              onChange={this.handleChangeClue}
              onBlur={() => this.focusGrid()}
              hidden={!this.selectedIsWhite || !this.selectedClueNumber}
            />
          </div>
        </div>

        <div
          className={'editor--main--left--grid blurable'}>
          <Grid
            ref='grid'
            size={this.props.size}
            grid={this.props.grid}
            selected={selected}
            direction={direction}
            onSetSelected={this.handleSetSelected}
            onChangeDirection={this.handleChangeDirection}
            myColor={this.props.myColor}
            references={[]}
            editMode
          />
        </div>
      </div>
    );
  }

  render() {
    const { selected, direction } = this.state;
    return (
      <Flex className='editor--main--wrapper'>
        <GridControls
          ref='gridControls'
          ignore='input'
          selected={selected}
          editMode
          direction={direction}
          canSetDirection={this.canSetDirection}
          onSetDirection={this.handleSetDirection}
          onSetSelected={this.handleSetSelected}
          onPressEnter={() => this.setState({ editingClue: true }, this.focusClue.bind(this))}
          onPressEscape={() => this.props.onUnfocus()}
          onPressPeriod={this.handlePressPeriod}
          updateGrid={this.handleUpdateGrid}
          grid={this.props.grid}
          clues={this.props.clues} >

          <Flex className='editor--main'>
            {this.renderLeft()}
            <Flex className='editor--right' column>
              <Flex className='editor--main--clues' grow={1}>
                {
                  // Clues component
                  ['across', 'down'].map((dir, i) => (
                    <Flex key={i} className='editor--main--clues--list'>
                      <Flex className='editor--main--clues--list--title'>
                        {dir.toUpperCase()}
                      </Flex>

                      <Flex column grow={1}>
                        <Flex column grow={1} basis={1}
                          className={'editor--main--clues--list--scroll ' + dir}
                          ref={'clues--list--'+dir}>
                          {
                            this.props.clues[dir].map((clue, i) => clue !== undefined && (
                              <Flex grow={1} shrink={0} key={i}
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
                                onClick={() => {this.handleSelectClue(dir, i)}}>
                                <Flex className='editor--main--clues--list--scroll--clue--number' shrink={0}>
                                  {i}
                                </Flex>
                                <Flex className='editor--main--clues--list--scroll--clue--text' shrink={1}>
                                  {clue}
                                </Flex>
                              </Flex>
                            ))
                          }
                        </Flex>
                      </Flex>
                    </Flex>
                  ))
                }
              </Flex>

              {<Flex className='editor--right--hints'>
                <Hints
                  grid={this.props.grid}
                  num={this.selectedClueNumber}
                  direction={direction}
                />
              </Flex>}
            </Flex>
          </Flex>
        </GridControls>
      </Flex>
    );
  }
}
