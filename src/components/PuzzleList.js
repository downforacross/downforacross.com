import React, { Component } from 'react';
import Flex from 'react-flexview';
import _ from 'lodash';
import Entry from './Entry';

export default class PuzzleList extends Component {

  handleScroll = (e) => {
    // hack hack hack
    const el = e.target;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const buffer = 600; // 600 pixels of buffer, i guess?
    if (scrollTop + clientHeight + buffer > scrollHeight) {
      this.props.onNextPage();
    }
  }

  render() {
    const { userHistory, puzzles } = this.props;
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
      <Flex
        wrap
        style={{justifyContent: 'space-around', overflowY: 'auto'}}
        onScroll={this.handleScroll}>
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
}

