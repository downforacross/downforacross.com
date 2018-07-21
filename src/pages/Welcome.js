import './css/welcome.css';

import React, { Component } from 'react';
import { Helmet } from 'react-helmet';

import Upload from '../components/Upload';
import News from '../components/News';
import Nav from '../components/Nav';

import actions, { db, getTime } from '../actions';
import { getUser } from '../store/user';

function values(obj) {
  return Object.keys(obj).map(key => obj[key]);
}

function EntryTitle({title}) {
  if (title.length > 60) {
    title = title.substring(0, 55) + ' ...';
  }
  return <span>
    {title}
  </span>;
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
    actions.createGame({
      name: 'Public Game',
      pid: pid,
      gid: `solo/${this.props.user.id}/${pid}`,
    }, gid => {
      this.props.history.push(`/game/solo/${pid}`);
    });
  }

  isNew() {
    const { importedTime, lastUpdateTime } = this.props;
    return importedTime && lastUpdateTime && importedTime > lastUpdateTime;
  }

  render() {
    const { title, author, pid, status } = this.props;
    const { flipped } = this.state;

    const solved = status === 'solved';
    const started = status === 'started';

    const front = (
      <div style={{ textDecoration: 'none', color: 'black' }} className='entry--front'>
        <div className='entry--front--title'><EntryTitle title={title}/></div>
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
      className={'entry' + (flipped ? ' flipped' : '') + (this.isNew() ? '  new' : '')  + (solved ? ' solved' : '') + (started ? ' started' : '')}>
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
      puzzleList: [],
      userHistory: {},
    };
    this.puzzleListRef = db.ref('puzzlelist');
  }

  componentDidMount() {
    this.puzzleListRef.on('value', this.updatePuzzleList.bind(this));
    if (this.userHistoryRef) {
      this.userHistoryRef.on('value', this.updateUserHistory.bind(this));
    }
    this.initializeUser();
  }

  componentWillUnmount() {
    this.puzzleListRef.off();
    if (this.userHistoryRef) {
      this.userHistoryRef.off();
    }
  }

  initializeUser() {
    this.user = getUser();
    this.user.onAuth(() => {
      if (this.user.fb) {
        if (this.userHistoryRef) {
          this.userHistoryRef.off();
        }
        this.userHistoryRef = db.ref(`user/${this.user.id}/history`);
        this.userHistoryRef.on('value', this.updateUserHistory.bind(this));
      } else {
        if (this.userHistoryRef) {
          this.userHistoryRef.off();
        }
        this.setState({ userHistory: {} });
      }
    });
  }

  updateUserHistory(_userHistory) {
    let userHistory = _userHistory.val() || {};
    this.setState({ userHistory });
  }

  updatePuzzleList(_puzzleList) {
    let puzzleList = _puzzleList.val() || {};

    this.setState({ puzzleList: values(puzzleList).filter(puzzle => !puzzle.private) }, () => {
      this.lastUpdateTime = getTime();
    });
  }

  prevent(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  renderPuzzleList(type) {
    const { history } = this.props;
    const { userHistory } = this.state;
    const puzzleStatuses = {};
    function setStatus(pid, solved) {
      if (solved) {
        puzzleStatuses[pid] = 'solved';
      } else if (!puzzleStatuses[pid]) {
        puzzleStatuses[pid] = 'started';
      }
    }

    Object.keys(userHistory).forEach(gid => {
      if (gid === 'solo') {
        Object.keys(userHistory.solo).forEach(uid => {
          const soloGames = userHistory.solo[uid];
          Object.keys(soloGames).forEach(pid => {
            let { solved } = soloGames[pid];
            setStatus(pid, solved);
          });
        });
      } else {
        let { pid, solved } = userHistory[gid];
        setStatus(pid, solved);
      }
    });
    const lastUpdateTime = this.lastUpdateTime;
    return (
      <div className='puzzlelist'>
        { this.state.puzzleList.slice().reverse()
            .filter(entry => (
              entry.info && entry.info.type === type
            ))
            .map((entry, i) =>
              <div key={i} className='welcome--browse--puzzlelist--entry'>
                <Entry { ...entry } history={history} status={puzzleStatuses[entry.pid]} lastUpdateTime={lastUpdateTime} user={this.user}/>
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
          <Nav secret/>
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

