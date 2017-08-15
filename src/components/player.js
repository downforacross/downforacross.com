import './player.css';

import Grid from './grid';
import GridControls from './gridControls';
import React, { Component } from 'react';
import { lazy } from '../jsUtils';

import { isGridFilled, getNextCell, getNextEmptyCell, getNextEmptyCellAfter, hasEmptyCells, isFilled, getCellByNumber, getOppositeDirection, getParent, isInBounds, isWhite, isStartOfClue, getReferencedClues } from '../gameUtils';

/*
 * Summary of Player component
 *
 * Props: { grid, clues, updateGrid }
 *
 * State: { selected, direction }
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
 * Potential parents (so far):
 * - Room
 * - SoloRoom
 **/

export default class Player extends Component {
  constructor(props) {
    super();
    this.state = {
      selected: {
        r: 0,
        c: 0
      },
      direction: 'across',
    };

    // for deferring scroll-to-clue actions
    this.prvNum = {};
    this.prvIdleID = {};
  }

  componentWillReceiveProps(props) {
    this.props = props;
    let { r, c } = this.state.selected;
    if (!isWhite(this.props.grid, r, c)) {
      while (!isWhite(this.props.grid, r, c)) {
        if (c < this.props.grid[0].length) {
          c += 1;
        } else {
          r += 1;
          c = 0;
        }
      }
    }
    this.setSelected({r, c});
  }

  /* Callback fns, to be passed to child components */

  isValidDirection(direction, selected) {
    return getParent(this.props.grid, selected.r, selected.c, direction) !== 0;
  }

  canSetDirection(direction) {
    return this.isValidDirection(direction, this.state.selected);
  }

  setDirection(direction) {
    if (this.isValidDirection(direction, this.state.selected)) {
      this.setState({
        direction: direction
      });
    }
  }

  setSelected(selected) {
    if (this.isValidDirection(this.state.direction, selected)) {
      if (selected.r !== this.state.selected.r || selected.c !== this.state.selected.c) {
        this.setState({
          selected: selected,
        }, () => {
          this.props.updateCursor({
            r: selected.r,
            c: selected.c
          });
        });
      }
    } else if (this.isValidDirection(getOppositeDirection(this.state.direction), selected)) {
      this.setState({
        selected: selected,
        direction: getOppositeDirection(this.state.direction)
      }, () => {
        this.props.updateCursor({
          r: selected.r,
          c: selected.c
        });
      });
    }
  }

  changeDirection() {
    this.setDirection(getOppositeDirection(this.state.direction));
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
    return getParent(this.props.grid, this.state.selected.r, this.state.selected.c, this.state.direction);
  }

  getHalfSelectedClueNumber() {
    return getParent(this.props.grid, this.state.selected.r, this.state.selected.c, getOppositeDirection(this.state.direction));
  }

  isClueFilled(direction, number) {
    const clueRoot = getCellByNumber(this.props.grid, number);
    return !hasEmptyCells(this.props.grid, clueRoot.r, clueRoot.c, direction);
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
    let result = [];
    this.props.grid.forEach((row, r) => {
      result = result.concat(row.map((cell, c) => ({
        r: r,
        c: c
      })));
    });
    return result;
  }

  getSelectedAndHighlightedSquares() {
    return this.getAllSquares().filter(({r, c}) => this.isSelected(r, c) || this.isHighlighted(r, c));
  }

  getSelectedSquares() {
    return this.getAllSquares().filter(({r, c}) => this.isSelected(r, c));
  }

  getReferences() {
    const clueText = this.getClueBarText();
    return getReferencedClues(clueText);
  }
  getReferencedSquares() {
    return this.getAllSquares().filter(({r, c}) => this.isReferenced(r, c));
  }

  /* Misc functions */

  // Interacts directly with the DOM
  // Very slow -- use with care
  scrollToClue(dir, num, el) {
    if (el && this.prvNum[dir] !== num) {
      this.prvNum[dir] = num;
      lazy('scrollToClue' + dir, () => {
        const parent = el.offsetParent;
        parent.scrollTop = el.offsetTop - (parent.offsetHeight * .4);
      });
    }
  }


  /* Render */

  render() {
    return (
      <div className='player--main--wrapper'>
        <GridControls
          ref='gridControls'
          selected={this.state.selected}
          direction={this.state.direction}
          onSetDirection={this.setDirection.bind(this)}
          canSetDirection={this.canSetDirection.bind(this)}
          onSetSelected={this.setSelected.bind(this)}
          updateGrid={this.props.updateGrid}
          grid={this.props.grid}
          clues={this.props.clues}
        >
          <div className='player--main'>
            <div className='player--main--left'>
              <div className='player--main--clue-bar'>
                <div className='player--main--clue-bar--number'>
                  { this.getClueBarAbbreviation() }
                </div>
                <div className='player--main--clue-bar--text'>
                  { this.getClueBarText() }
                </div>
              </div>

              <div
                className={'player--main--left--grid' + (this.props.frozen ? ' frozen' : '') + ' blurable'}
              >
                <Grid
                  ref='grid'
                  size={this.props.size}
                  grid={this.props.grid}
                  circles={this.props.circles}
                  selected={this.state.selected}
                  references={this.getReferences()}
                  direction={this.state.direction}
                  cursors={this.props.cursors}
                  onSetSelected={this.setSelected.bind(this)}
                  myColor={this.props.myColor}
                  onChangeDirection={this.changeDirection.bind(this)}/>
              </div>
            </div>

            <div className='player--main--clues'>
              {
                // Clues component
                ['across', 'down'].map((dir, i) => (
                  <div key={i} className='player--main--clues--list'>
                    <div className='player--main--clues--list--title'>
                      {dir.toUpperCase()}
                    </div>

                    <div
                      className={'player--main--clues--list--scroll ' + dir}
                      ref={'clues--list--'+dir}>
                      {
                        this.props.clues[dir].map((clue, i) => clue && (
                          <div key={i}
                            className={
                              (this.isClueSelected(dir, i)
                                ?  'selected '
                                : ' ')
                                + (this.isClueHalfSelected(dir, i) ?
                                  'half-selected '
                                  : ' ')
                                + (this.isClueFilled(dir, i)
                                  ? 'complete '
                                  : ' ')
                                + 'player--main--clues--list--scroll--clue'}
                                ref={
                                  (this.isClueSelected(dir, i) ||
                                    this.isClueHalfSelected(dir, i))
                                    ? this.scrollToClue.bind(this, dir, i)
                                    : null}
                                    onClick={this.selectClue.bind(this, dir, i)}>
                                    <div className='player--main--clues--list--scroll--clue--number'>
                                      {i}
                                    </div>
                                    <div className='player--main--clues--list--scroll--clue--text'>
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
          </div>
        </GridControls>
      </div>
    );
  }
}
