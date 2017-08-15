import './puzzle.css';
import {Helmet} from "react-helmet";
import actions, { db } from '../actions';
import React, { Component } from 'react';

export default class Puzzle extends Component {
  constructor() {
    super();
    this.state = {
      puzzle: null,
      name: 'Private Game'
    };
  }

  componentDidMount() {
    this.pid = this.props.match.params.pid || 0;
    this.puzzleRef = db.ref(`puzzle/${this.pid}`);
    this.puzzleRef.on('value', puzzle => {
      this.setState({
        puzzle: puzzle.val()
      });
    });
  }

  componentWillUnmount() {
    this.puzzleRef.off();
  }

  playGame() {
    const gid = actions.createGame({
      name: this.state.name,
      pid: this.pid
    }, gid => {
      this.props.history.push(`/game/${gid}`);
    });
  }

  playGameSolo() {
    this.props.history.push(`/game/solo/${this.pid}`);
  }

  getPuzzleTitle() {
    if (!this.state.puzzle) return '';
    return this.state.puzzle.info.title;
  }

  getPuzzleAuthor() {
    if (!this.state.puzzle) return '';
    return this.state.puzzle.info.author;
  }

  getPuzzleType() {
    if (!this.state.puzzle) return '';
    return this.state.puzzle.info.type;
  }

  getPuzzleDims() {
    if (!this.state.puzzle) return '';
    const height = this.state.puzzle.grid.length;
    const width = this.state.puzzle.grid[0].length;
    return `${height} x ${height}`;
  }

  getPuzzleURL() {
    return 'www.downforacross.com/puzzle/' + this.pid;
  }

  render() {
    return (
      <div className='puzzle'>
        <Helmet>
          <title>{this.getPuzzleTitle()}</title>
          <meta property="og:title" content={this.getPuzzleTitle()} />
          <meta property="og:url" content={this.getPuzzleURL()} />
          <meta property="og:type" content='restaurant.menu' />
        </Helmet>
        <div className='puzzle--info'>
          <div className='puzzle--info--title'>
            {this.getPuzzleTitle()}
          </div>
          <div className='puzzle--info--author'>
            {this.getPuzzleAuthor()}
          </div>
          <div className='puzzle--info--type'>
            {this.getPuzzleType()}
            {' ('}
            <span className='puzzle--info--dims'>
              {this.getPuzzleDims()}
            </span>
            )
          </div>
        </div>

        {/*<div className='puzzle-stats'>
          Solved 0 times
        </div>*/}

        <div className='puzzle--play'>
          <button
            className='puzzle--play--btn'
            onClick={this.playGameSolo.bind(this)}>
            Play
          </button>
          <button
            className='puzzle--play--btn with-friends'
            onClick={this.playGame.bind(this)}>
            Play with Friends
          </button>
        </div>
      </div>
    );
  }
};
