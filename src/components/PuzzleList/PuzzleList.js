import React, {PureComponent} from 'react';
import _ from 'lodash';
import Entry from './Entry';
import './css/puzzleList.css';

export default class PuzzleList extends PureComponent {
  constructor() {
    super();
    this.container = React.createRef();
    this.previousScrollTop = 0;
  }

  componentDidUpdate() {
    setTimeout(this.handleScroll, 100);
    setTimeout(this.handleScroll, 1000);
    // when resizing / changing filters, check if we need to load more pages
    // for some reason we need to delay it.
    // calling handleScroll twice with different delays to be performant but also resistant to weirdly slow browsers that lag??
  }

  get fullyScrolled() {
    if (!this.container.current) return false;
    const {scrollTop, scrollHeight, clientHeight} = this.container.current;
    const buffer = 600; // 600 pixels of buffer, i guess?
    return scrollTop + clientHeight + buffer > scrollHeight;
  }

  handleScroll = (e) => {
    if (this.container.current) {
      const scrollTop = this.container.current.scrollTop;
      this.props.onScroll && this.props.onScroll(scrollTop);
      this.direction = scrollTop - this.previousScrollTop;
      this.previousScrollTop = scrollTop;
    }

    if (this.fullyScrolled) {
      if (this.isEmpty) {
        return; // if the filters are dead, don't load as they won't help
      }
      this.props.onNextPage();
    }
  };

  handleTouchEnd = (e) => {
    console.log('touchend');
    if (this.container.current) return;
    const scrollTop = this.container.scrollTop;
    const direction = this.direction;
    if (direction > 0) {
      if (scrollTop < 100) {
        this.container.scrollTop = 100;
      }
    } else if (scrollTop < 100) {
      this.container.scrollTop = 0;
    }
    this.handleScroll();
  };

  get isEmpty() {
    const {sizeFilter, statusFilter} = this.props;
    return !(_.some(_.values(sizeFilter)) && _.some(_.values(statusFilter)));
  }

  accept = (entry) => {
    const {sizeFilter, statusFilter, search} = this.props;
    const size = {
      'Daily Puzzle': 'Standard',
      'Mini Puzzle': 'Mini',
    }[entry.info.type];
    const status = {
      undefined: 'New',
      solved: 'Complete',
      started: 'In progress',
    }[this.puzzleStatuses[entry.pid]];

    const matches = (str, expr) => {
      if (expr.toLowerCase() === expr) {
        // case insensitive
        return str.toLowerCase().indexOf(expr) !== -1;
      } else {
        // case sensitive
        return str.indexOf(expr) !== -1;
      }
    };
    const searchMatches = matches(entry.info.author, search) || matches(entry.info.title, search);
    return statusFilter[status] && sizeFilter[size] && searchMatches;
  };

  get puzzles() {
    const {puzzles} = this.props;
    const list = [...puzzles]
      .reverse()
      .filter((entry) => entry && entry.info && !entry.private)
      .filter(this.accept);
    if (!this.fullyScrolled) {
      return list.slice(0, 100);
    } else {
      return list;
    }
  }

  get puzzleStatuses() {
    const {userHistory} = this.props;
    const puzzleStatuses = {};
    function setStatus(pid, solved) {
      if (solved) {
        puzzleStatuses[pid] = 'solved';
      } else if (!puzzleStatuses[pid]) {
        puzzleStatuses[pid] = 'started';
      }
    }

    _.keys(userHistory).forEach((gid) => {
      if (gid === 'solo') {
        _.keys(userHistory.solo).forEach((uid) => {
          const soloGames = userHistory.solo[uid];
          _.keys(soloGames).forEach((pid) => {
            let {solved} = soloGames[pid];
            setStatus(pid, solved);
          });
        });
      } else {
        let {pid, solved} = userHistory[gid];
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
          overflowY: 'auto',
        }}
        className="puzzlelist"
        onScroll={this.handleScroll}
        onTouchEnd={this.handleTouchEnd}
      >
        {this.puzzles.map((entry, i) => (
          <div className="entry--container" key={i}>
            <Entry
              {...entry}
              status={this.puzzleStatuses[entry.pid]}
              lastUpdateTime={lastUpdateTime}
              user={this.user}
              onPlay={this.handlePlay}
            />
          </div>
        ))}
      </div>
    );
  }
}
