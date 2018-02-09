import './css/compose.css';
import actions, { db } from '../actions';

import GridObject from '../utils/Grid';
import React, { Component } from 'react';
import Editor from '../components/Editor';
import Create from '../components/Create';
import EditableSpan from '../components/EditableSpan';
import { lazy } from '../jsUtils';
import { makeGrid, makeEmptyClues } from '../gameUtils';

import { getId, loggedIn, registerLoginListener } from '../auth';

export default class Compose extends Component {

  constructor() {
    super();
    this.state = {
      puzzle: undefined,
      myPuzzles: []
    };
    this.pid = undefined;
    registerLoginListener(() => {
      this.me = getId();
      this.myPuzzlesRef = db.ref('myPuzzles/' + this.me);
      this.myPuzzlesRef.on('value', lst => {
        this.setState({
          myPuzzles: (lst.val() || []).reverse()
        });
      });
    });
    this.color = 'rgb(118, 226, 118)';
  }

  selectPuzzle(pid) {
    if (this.puzzleRef) {
      this.puzzleRef.off();
    }
    this.pid = pid;
    this.puzzleRef = db.ref('puzzle/' + pid);
    this.puzzleListRef = db.ref('puzzlelist/' + pid);
    this.puzzleRef.on('value', _puzzle => {
      lazy('updatePuzzle', () => {
        const puzzle = _puzzle.val() || {};
        this.puzzle = puzzle;
        this.setState({ puzzle: this.puzzle });
      });
    });
  }

  newPuzzle({dims, pattern}) {
    const type = Math.max(dims.r, dims.c) <= 7
      ? 'Mini Puzzle'
      : 'Daily Puzzle';
    const puzzle = {
      info: {
        title: 'Untitled',
        type: type,
        author: 'Anonymous'
      },
      grid: makeGrid(pattern.map(row => row.map(cell => (
        cell === 0 ? '' : '.'
      )))).toArray(),
      private: true,
    };
    puzzle.clues = makeEmptyClues(puzzle.grid),

      actions.createPuzzle(puzzle, ({pid}) => {
        this.myPuzzlesRef.transaction(lst => (
          [...(lst || []), {
            pid: pid,
            title: 'Untitled',
            dims: {
              rows: dims.r,
              cols: dims.c
            },
          }]
        ))
        this.selectPuzzle(pid)
      });
  }

  updateDims(height, width) {
  }

  transaction(fn, cbk) {
    this.puzzleRef.transaction(fn, cbk);
    this.puzzle = fn(this.puzzle);
    this.setState({puzzle: this.puzzle});
  }

  cellTransaction(r, c, fn) {
    this.puzzleRef.child('grid/' + r + '/' + c).transaction(fn);
    this.puzzle.grid[r][c] = fn(this.puzzle.grid[r][c])
    this.setState({ puzzle: this.puzzle });
  }

  updateGrid(r, c, value) {
    this.cellTransaction(r, c, cell => ({
      ...cell,
      value: value,
      bad: false,
      good: false,
    }));
  }

  clueTransaction(ori, idx, fn, cbk) {
    this.puzzleRef.child('clues/' + ori + '/' + idx).transaction(fn, cbk);
    this.puzzle.clues[ori][idx] = fn(this.puzzle.clues[ori][idx]);
    this.setState({ puzzle: this.puzzle });
  }

  updateClues(ori, idx, value) {
    this.clueTransaction(ori, idx, clue => value);
  }

  flipColor(r, c) {
    console.log('flip color', this.puzzle.grid[r][c]);
    this.puzzle.grid[r][c].black = !this.puzzle.grid[r][c].black;
    new GridObject(this.puzzle.grid).assignNumbers();
    this.puzzle.clues = new GridObject(this.puzzle.grid).alignClues(this.puzzle.clues);
    this.puzzleRef.set(this.puzzle);
    this.setState({ puzzle: this.puzzle });
  }

  getCellSize() {
    return 30 * 15 / this.puzzle.grid[0].length;
  }

  updateTitle(title) {
    this.puzzleRef.transaction(puzzle => ({
      ...puzzle,
      info: {
        ...puzzle.info,
        title,
      }
    }));
    this.puzzleListRef.transaction(puzzle => puzzle && Object.assign({}, puzzle, {
      title: title,
      info: Object.assign(puzzle.info, {
        title: title
      })
    }));
    this.myPuzzlesRef.transaction(lst => {
      lst.forEach(entry => {
        if (entry.pid === this.pid) {
          entry.title = title;
        }
      });
      return lst;
    });
  }

  updateAuthor(author) {
    this.transaction(puzzle => ({
      ...puzzle,
      info: {
        ...puzzle.info,
        author: author
      }
    }));
    this.puzzleListRef.transaction(puzzle => puzzle && Object.assign(puzzle, {
      author: author,
      info: Object.assign(puzzle.info, {
        author: author
      })
    }));
  }

  setPrivate(isPrivate) {
    this.transaction(puzzle => Object.assign(puzzle, {
      private: isPrivate
    }))
    this.myPuzzlesRef.transaction(lst => {
      if (!lst) return lst;
      lst.forEach(entry => {
        if (entry.pid === this.pid) {
          entry.private = isPrivate;
        }
      });
      return lst;
    });
    this.puzzleListRef.transaction(puzzle => puzzle && Object.assign(puzzle, {
      private: isPrivate
    }));
  }

  getLink() {
    return '/puzzle/' + this.pid;
  }

  renderMain() {
    if (!this.puzzle) {
      return (
        <div className='compose--main'>
          <div className='compose--main--select-a-puzzle'>
            Select a puzzle from the left sidebar
          </div>
        </div>
      );
    }
    return (
      <div className='compose--main'>
        <div className='compose--main--info'>
          <div className='compose--main--info--title'>
            <EditableSpan
              value={this.puzzle.info.title}
              onChange={this.updateTitle.bind(this)}
            />
          </div>
        </div>
        <div className='compose--main--info--subtitle'>
          {
            this.puzzle.info.type + ' | '
              + 'By '
          }
          <EditableSpan
            value={this.puzzle.info.author}
            onChange={this.updateAuthor.bind(this)}
          />
        </div>
        <div className='compose--main--editor'>
          <Editor
            ref='editor'
            size={this.getCellSize()}
            grid={this.puzzle.grid}
            clues={this.puzzle.clues}
            updateGrid={this.updateGrid.bind(this)}
            updateClues={this.updateClues.bind(this)}
            onFlipColor={this.flipColor.bind(this)}
            myColor={this.color}
            pid={this.pid}
          />
        </div>
        <div className='compose--main--options'>
          <label>Private: </label>
          <input type='checkbox' checked={this.puzzle.private} onChange={e => this.setPrivate(e.target.checked)}/>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='compose'>
        <div className='compose--left'>
          <div className='compose--left--top'>
            <h2> Your Puzzles </h2>
          </div>
          <div className='compose--left--list'>
            {
              this.state.myPuzzles.map((entry, i) =>
                <div
                  key={i}
                  onClick={this.selectPuzzle.bind(this, entry.pid)}
                  className='compose--left--list--entry'>
                  <div>
                    { entry.title } ({ entry.dims.rows } x { entry.dims.cols })
                  </div>
                </div>
              )
            }
          </div>
          <div
            className='compose--left--new'>
            <h2> New Puzzle </h2>
            <Create
              onCreate={this.newPuzzle.bind(this)}
            />
          </div>
        </div>
        { this.renderMain() }
        <div className='compose--right'>
          <div className='compose--right--top'>
            <h2> Instructions </h2>
            <div>
              <p>Here you can browse, edit or create new puzzles.</p>

              <p> Click on the grid, and use arrow keys to navigate the grid.</p>

              <p>Press Enter to edit the clue for the word that's currently selected.</p>

              {
                this.pid
                  ?(
                    <p>
                      To share your puzzle, use this link:

                      <br/>
                      <a href={this.getLink()}>{'https://downforacross.com' + this.getLink()}</a>
                    </p>
                  )
                  : null
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
};
