import './css/welcome.css';
import Upload from '../components/upload';
import News from '../components/news';

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import actions, { db, getTime } from '../actions';

function values(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

class Entry extends Component {
  constructor() {
    super();
    this.state = {
      flipped: false,
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

  isNew() {
    const { importedTime, lastUpdateTime } = this.props;
    return importedTime && lastUpdateTime && importedTime > lastUpdateTime;
  }

  render() {
    const { title, author, pid } = this.props;
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
              this.playGameSolo();
            }} >
            Play Solo
          </div>
          <div
            className='entry--back--btn play-friends'
            onClick={() => {
              this.playGame();
            }} >
            Play With Friends
          </div>
        </div>
      </div>
    );
    return (
      <div key={pid} onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
          flipped: !flipped,
        });
      }}
      onMouseLeave={e => {
        this.setState({ flipped: false });
      }}
      className={'entry' + (flipped ? ' flipped' : '') + (this.isNew() ? '  new' : '')}>
      { front }
      { flipped ? back : <div className='entry--back'/> }
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
      this.lastUpdateTime = getTime();
    });
  }

  prevent(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  renderPuzzleList(type) {
    const { history } = this.props;
    const lastUpdateTime = this.lastUpdateTime;
    return (
      <div className='puzzlelist'>
        { this.state.puzzleList.slice().reverse()
            .filter(entry => (
              entry.info && entry.info.type === type
            ))
            .map((entry, i) =>
              <div key={i} className='welcome--browse--puzzlelist--entry'>
                <Entry { ...entry } history={history} lastUpdateTime={lastUpdateTime}/>
              </div>
            )
        }
      </div>
    );
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
                { this.renderPuzzleList('Daily Puzzle') }
              </div>

              <div className='welcome--browse--puzzlelist minis'>
                <div className='welcome--browse--title'>
                  Mini Puzzles
                </div>
                { this.renderPuzzleList('Mini Puzzle') }
              </div>
            </div>
          </div>
          <div className='welcome--right'>
            <div className='welcome--upload'>
              <Upload history={this.props.history}/>
            </div>
            <div className='welcome--news'>
              <News />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

