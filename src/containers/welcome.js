import './welcome.css';
import Upload from '../components/upload'

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import actions, { db } from '../actions';

function values(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

function Entry(entry) {
  return <div className='entry'>
    <div className='entry--title'>{entry.title}</div>
    <div className='entry--author'>{entry.author}</div>
  </div>
}

export default class Welcome extends Component {

  constructor() {
    super();
    this.state = {
      gameList: [],
      puzzleList: [],
    };
    this.gameListRef = db.ref('gamelist');
    this.puzzleListRef = db.ref('puzzlelist');
  }

  componentDidMount() {
    this.gameListRef.on('value', this.updateGameList.bind(this));
    this.puzzleListRef.on('value', this.updatePuzzleList.bind(this));
  }

  componentWillUnmount() {
    this.gameListRef.off();
    this.puzzleListRef.off();
  }

  updateGameList(gameList) {
    this.setState({ gameList: values(gameList.val() || {} )});
  }

  updatePuzzleList(puzzleList) {
    this.setState({ puzzleList: values(puzzleList.val() || {}).filter(puzzle => !puzzle.private) }, () => {
      if (!this.state.pid && this.state.puzzleList.length > 0) {
        this.setState({ pid: this.state.puzzleList[0].pid });
      }
    });
  }

  prevent(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  handleStartClick(ev) {
    if (!this.state.pid) return;
    actions.createGame({
      name: this.state.name,
      pid: this.state.pid
    }, gid => {
      this.props.history.push(`/game/${gid}`);
    });
  }

  handleSelectChange(ev) {
    this.setState({ pid: ev.target.value });
  }

  render() {
    return (
      <div className='welcome'>
        <Helmet>
          <title>Down for a Cross</title>
        </Helmet>
        <div className='welcome--nav'>
          <div className='welcome--nav--left'>
            <Link to='/'>
              Down for a Cross
            </Link>
          </div>
        </div>
        <div className='welcome--main'>
          <div className='welcome--browse'>
            <div className='welcome--browse--filter'>
              <div className='welcome--browse--filter--header'>
                Difficulty
              </div>
              {
                ['Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                  'Sunday',
                  'All',
                ].map(day =>
                  <div className='welcome--browse--filter--option'>
                    <input type="checkbox"/>
                    <label>{day}</label>
                  </div>
                )
              }
            </div>
            <div className='welcome--browse--puzzlelist--wrapper'>
              <div className='welcome--browse--puzzlelist dailies'>
                <div className='welcome--browse--title'>
                  Daily Puzzles
                </div>
                {
                  this.state.puzzleList.slice().reverse()
                    .filter(entry => (
                      !entry.info || entry.info.type === 'Daily Puzzle'
                    ))
                    .map((entry, i) =>
                      <Link key={i} to={'/puzzle/' + entry.pid} style={{ textDecoration: 'none', color: 'black' }}>
                        <div className='welcome--browse--puzzlelist--entry'>
                          <div>
                            {Entry(entry)}
                          </div>
                        </div>
                      </Link>
                    )
                }
              </div>

              <div className='welcome--browse--puzzlelist minis'>
                <div className='welcome--browse--title'>
                  Mini Puzzles
                </div>
                {
                  this.state.puzzleList.slice().reverse()
                    .filter(entry => (
                      entry.info && entry.info.type === 'Mini Puzzle'
                    ))
                    .map((entry, i) =>
                      <Link key={i} to={'/puzzle/' + entry.pid} style={{ textDecoration: 'none', color: 'black' }}>
                        <div className='welcome--browse--puzzlelist--entry'>
                          <div>
                            {Entry(entry)}
                          </div>
                        </div>
                      </Link>
                    )
                }
              </div>
            </div>
          </div>
          <div className='welcome--upload'>
            <Upload history={this.props.history}/>
          </div>
        </div>
      </div>
    );
  }
}

