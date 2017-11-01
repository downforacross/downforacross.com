import './welcome.css';
import Upload from '../components/upload'

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import actions, { db } from '../actions';

function values(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

class Entry extends Component {
  constructor() {
    super();
    this.state = {
      flipped: false
    }
  }

  playGame() {
    const { pid } = this.props;
    actions.createGame({
      name: 'Public Game',
      pid: pid
    }, gid => {
      this.props.history.push(`/game/${gid}`);
    });
  }

  playGameSolo() {
    const { pid } = this.props;
    this.props.history.push(`/game/solo/${pid}`);
  }

  clickExpired() {
    const { lastClickTime } = this.state;
    const clickExpiration = 0;
    const time = new Date().getTime();
    debugger;
    return time > lastClickTime + clickExpiration;
  }

  render() {
    const { title, author } = this.props;
    const { flipped } = this.state;

    const front = (
      <div style={{ textDecoration: 'none', color: 'black' }} className='entry--front'>
        <div className='entry--front--title'>{title}</div>
        <div className='entry--front--author'>{author}</div>
      </div>
    );

    const back = (
      <div className='entry--back'>
        <div className='entry--back--btns'>
          <div
            className='entry--back--btn play-solo'
            onClick={()=>{
              console.log('click play-solo', new Date().getTime());
              if (this.clickExpired()) {
                this.playGameSolo();
              }
            }} >
            Play Solo
          </div>
          <div
            className='entry--back--btn play-friends'
            onClick={() => {
              if (this.clickExpired()) {
                this.playGame();
              }
            }} >
            Play With Friends
          </div>
        </div>
      </div>
    );
    return (
      <div onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        const time = new Date().getTime();
        setTimeout(() => {
        this.setState({
          flipped: !flipped,
        });
        }, 100);
      }}
      onMouseLeave={e => {
        this.setState({ flipped: false });
      }}
      className={'entry' + (flipped ? ' flipped' : '')}>
      { front }
      { back }
    </div>
    );
  }
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
    const { history } = this.props;
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
          <div className='welcome--nav--right'>
            <a href='http://www.downfiveacross.com'>
              Old site
            </a>
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
                ].map((day, i) =>
                  <div
                    key={i}
                    className='welcome--browse--filter--option'
                  >
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
                      <div key={i} className='welcome--browse--puzzlelist--entry'>
                        <Entry { ...entry } history={history}/>
                      </div>
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
                      <div key={i} className='welcome--browse--puzzlelist--entry'>
                        <Entry { ...entry }/>
                      </div>
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

