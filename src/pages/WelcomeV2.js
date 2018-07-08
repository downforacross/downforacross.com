import './css/welcomev2.css';

import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import Flex from 'react-flexview';
import FontAwesome from 'react-fontawesome';
import Nav from '../components/Nav';

import { getUser, PuzzlelistModel } from '../store';
import _ from 'lodash';

function shortenTitle(title) {
  if (title.length > 60) {
    title = title.substring(0, 55) + ' ...';
  }
  return title;
}

class Entry extends Component {
  constructor() {
    super();
    this.state = {
      expanded: false,
    }
  }

  handleClick = e => {
    this.setState({
      expanded: !this.state.expanded,
    });
  }

  handleMouseLeave = e => {
    this.setState({
      expanded: false,
    });
  }

  get size() {
    const { info = {} } = this.props;
    const { type } = info;
    if (type === 'Daily Puzzle') {
      return 'Standard';
    } else if (type === 'Mini Puzzle') {
      return 'Mini';
    } else {
      return '';
    }
  }

  render() {
    const { title, author, pid, status } = this.props;
    const shortenedTitle = shortenTitle(title);
    const { expanded } = this.state;
    return (
      <Flex column
        onClick={this.handleClick}
        onMouseLeave={this.handleMouseLeave}
        style={{
          fontFamily: 'sans-serif',
          border: '2px solid silver',
          borderRadius: '3px',
          marginTop: '18px',
          display: 'flex',
        }}>
        <Flex style={{ justifyContent: 'space-between' }}>
          <Flex className='entry--top--left'>
            {author} | {this.size}
          </Flex>
          <Flex className='entry--top--right'>
            <FontAwesome name='rocket'/>
          </Flex>
        </Flex>
        <Flex className='entry--main'>
          { shortenedTitle }
        </Flex>
      </Flex>
    );
  }
}

export default class WelcomeV2 extends Component {

  constructor() {
    super();
    this.state = {
      puzzles: [],
      userHistory: {},
    };
  }

  componentDidMount() {
    this.initializePuzzlelist();
    this.initializeUser();
  }

  componentWillUnmount() {
    if (this.puzzleList) {
      this.puzzleList.detach();
    }
  }

  initializeUser() {
    this.user = getUser();
    this.user.onAuth(() => {
      if (this.user.fb) {
        this.user.on('history', userHistory => {
          this.setState({ userHistory });
        });
      }
    });
  }

  initializePuzzlelist() {
    this.puzzleList = new PuzzlelistModel();
    this.puzzleList.getPages(1, page => {
      this.setState({
        puzzles: page,
      });
    });
  }

  prevent(ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }

  renderPuzzles() {
    const { history } = this.props;
    const { userHistory, puzzles } = this.state;
    const puzzleStatuses = {};
    function setStatus(pid, solved) {
      if (solved) {
        puzzleStatuses[pid] = 'solved';
      } else if (!puzzleStatuses[pid]) {
        puzzleStatuses[pid] = 'started';
      }
    }

    _.keys(userHistory).forEach(gid => {
      if (gid === 'solo') {
        _.keys(userHistory.solo).forEach(uid => {
          const soloGames = userHistory.solo[uid];
          _.keys(soloGames).forEach(pid => {
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
        { [...puzzles].reverse()
            .filter(entry => (
              entry && entry.info && !entry.private
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
      <div className='welcomev2'>
        <Helmet>
          <title>Down for a Cross</title>
        </Helmet>
        <div className='welcomev2--nav'>
          <Nav v2/>
        </div>
        <div className='welcomev2--main'>
          <div className='welcomev2--browse'>
            <div className='welcomev2--browse--filter'>
              <div className='welcomev2--browse--filter--header'>
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
                    className='welcomev2--browse--filter--option'
                  >
                    <input type="checkbox"/>
                    <label>{day}</label>
                  </div>
                )
              }
            </div>
            <div className='welcomev2--browse--puzzlelist--wrapper'>
              { this.renderPuzzles() }
            </div>
          </div>
        </div>
      </div>
    );
  }
}


