import './css/welcomev2.css';

import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import Flex from 'react-flexview';
import FontAwesome from 'react-fontawesome';
import Nav from '../components/Nav';
import Upload from '../components/Upload';
import { Link } from 'react-router-dom';
import { getUser, PuzzlelistModel, GameModel, PuzzleModel } from '../store';
import actions from '../actions';
import _ from 'lodash';

class Entry extends Component {
  constructor() {
    super();
    this.state = {
      expanded: false,
    }
  }

  handleClick = e => {
    /*
    this.setState({
      expanded: !this.state.expanded,
    });
    this.props.onPlay(this.props.pid);
    */
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
    const { expanded } = this.state;
    const faName = status === 'started' ? 'circle-o' : status === 'solved' ? 'check-circle' : '';
    return (
      <Link to={`/beta/play/${pid}`} style={{textDecoration: 'none', color: 'initial'}}>
        <Flex className='entryv2' column
          onClick={this.handleClick}
          onMouseLeave={this.handleMouseLeave}>
          <Flex style={{ justifyContent: 'space-between' }}>
            <Flex className='entryv2--top--left'>
              {author} | {this.size}
            </Flex>
            <Flex className='entryv2--top--right'>
              <FontAwesome name={faName}/>
            </Flex>
          </Flex>
          <Flex className='entryv2--main'>
            { title }
          </Flex>
        </Flex>
      </Link>
    );
  }
}

export default class WelcomeV2 extends Component {

  constructor() {
    super();
    this.state = {
      puzzles: [],
      userHistory: {},
      pages: 0,
    };
    this.loading = false;
  }

  componentDidMount() {
    this.initializePuzzlelist();
    this.initializeUser();
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

  get done() {
    const { pages, puzzles } = this.state;
    return puzzles.length < pages * this.puzzleList.pageSize;
  }

  nextPage = () => {
    const { pages } = this.state;
    if (this.loading || this.done) {
      return;
    }
    this.loading = true;
    this.puzzleList.getPages(pages + 1, page => {
      this.setState({
        puzzles: page,
        pages: pages + 1,
      }, () => {
        this.loading = false;
      });
    });
  }

  initializePuzzlelist() {
    this.puzzleList = new PuzzlelistModel();
    this.nextPage();
  }

  handleScroll = (e) => {
    // hack hack hack
    const el = e.target;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const buffer = 600; // 600 pixels of buffer, i guess?
    if (scrollTop + clientHeight + buffer > scrollHeight) {
      this.nextPage();
    }
  }

  renderPuzzles() {
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
    console.log(puzzleStatuses);
    return (
      <Flex
        wrap
        style={{justifyContent: 'space-around', overflowY: 'auto'}}
        onScroll={this.handleScroll}
        ref={el => {this.puzzlesContainer = el;}}>
        { [...puzzles].reverse()
          .filter(entry => (
            entry && entry.info && !entry.private
          ))
          .map((entry, i) =>
            <div key={i}>
              <Entry { ...entry }
                status={puzzleStatuses[entry.pid]}
                lastUpdateTime={lastUpdateTime}
                user={this.user}
                onPlay={this.handlePlay}/>
            </div>
          )
        }
      </Flex>
    );
  }

  renderFilters() {
    const headerStyle = {
      fontWeight: 600,
      marginTop: 10,
      marginBottom: 10,
    };
    const groupStyle = {
      padding: 20,
    };

    const checkboxGroup = (header, items, handleChange) => (
      <Flex column style={groupStyle} className='checkbox-group'>
        <span style={headerStyle}>{header}</span>
        {items.map((name, i) => (
          <label key={i}>
            <input type="checkbox" defaultChecked="checked"/>
            <div className='checkmark'/>
            {name}
          </label>
        ))}
      </Flex>
    );

    return (
      <Flex className='filters' column hAlignContent='left' shrink={0}>
        {checkboxGroup('Size', ['Mini', 'Standard'], (e) => {
          console.log('change', e.target);
        })}
        {checkboxGroup('Status', ['New', 'In progress', 'Complete'], (e) => {
          console.log('change', e.target);
        })}
      </Flex>
    );
  }

  renderQuickUpload() {
    return (
      <Flex column className="quickplay">
        <Upload/>
      </Flex>
    );
  }

  render() {
    return (
      <Flex className='welcomev2' column grow={1}>
        <Helmet>
          <title>Down for a Cross</title>
        </Helmet>
        <div className='welcomev2--nav'>
          <Nav v2/>
        </div>
        <Flex grow={1}>
          <Flex className='welcomev2--sidebar' column shrink={0} style={{justifyContent: 'space-between'}}>
            { this.renderFilters() }
            { this.renderQuickUpload() }
          </Flex>
          <Flex className='welcomev2--main'>
            { this.renderPuzzles() }
          </Flex>
        </Flex>
      </Flex>
    );
  }
}


