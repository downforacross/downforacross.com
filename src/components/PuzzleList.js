import React, { PureComponent } from 'react';
import Flex from 'react-flexview';
import _ from 'lodash';
import Entry from './Entry';

export default class PuzzleList extends PureComponent {
  constructor() {
    super();
    this.container = React.createRef();
  }

  componentDidUpdate() {
    setTimeout(this.handleScroll, 100);
    setTimeout(this.handleScroll, 1000);
    // when resizing / changing filters, check if we need to load more pages
    // for some reason we need to delay it.
    // calling handleScroll twice with different delays to be performant but also resistant to weirdly slow browsers that alg??
  }

  handleScroll = (e) => {
    console.log('did update');
    // hack hack hack
    const { scrollTop, scrollHeight, clientHeight } = this.container.current;
    const buffer = 600; // 600 pixels of buffer, i guess?
    if (scrollTop + clientHeight + buffer > scrollHeight) {
      this.props.onNextPage();
    }
  }

  accept = entry => {
    const { sizeFilter, statusFilter } = this.props;
    const size = {
      'Daily Puzzle': 'Standard',
      'Mini Puzzle': 'Mini',
    }[entry.info.type];
    const status = {
      'undefined': 'New',
      'solved': 'Complete',
      'started': 'In progress',
    }[this.puzzleStatuses[entry.pid]];
    return statusFilter[status] && sizeFilter[size];
  };

  get puzzles() {
    const { puzzles } = this.props;
    return [...puzzles]
      .reverse()
      .filter(entry => (
        entry && entry.info && !entry.private
      ))
      .filter(this.accept);
  }

  get puzzleStatuses() {
    const { userHistory } = this.props;
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

    return puzzleStatuses;
  }

  render() {
    const lastUpdateTime = this.lastUpdateTime;
    return (
      <div
        ref={this.container}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          overflowY: 'auto'
        }}
        onScroll={this.handleScroll}>
        { this.puzzles
          .map((entry, i) =>
            <div key={i}>
              <Entry { ...entry }
                status={this.puzzleStatuses[entry.pid]}
                lastUpdateTime={lastUpdateTime}
                user={this.user}
                onPlay={this.handlePlay}/>
            </div>
          )
        }
      </div>
    );

  }
}

