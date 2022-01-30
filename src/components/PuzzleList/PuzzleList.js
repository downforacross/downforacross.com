import React, {PureComponent} from 'react';
import _ from 'lodash';
import './css/puzzleList.css';
import NewPuzzleList from './NewPuzzleList';

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

  handleScroll = () => {
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

  handleTouchEnd = () => {
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

    // Normalise case, and do it outside the filter loop for performance reasons
    const author = entry.info.author.toLowerCase();
    const title = entry.info.title.toLowerCase();
    // Next, we normalise the search term, and then split it to allow for non-contiguous searches
    const searchMatches = search
      .toLowerCase()
      .split(/\s/)
      .every(
        (token) =>
          // Each token can be either in the author's name or in the puzzle's title
          author.includes(token) || title.includes(token)
      );

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
    }
    return list;
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
            const {solved} = soloGames[pid];
            setStatus(pid, solved);
          });
        });
      } else {
        const {pid, solved} = userHistory[gid];
        setStatus(pid, solved);
      }
    });

    return puzzleStatuses;
  }

  render() {
    const filter = {
      nameOrTitleFilter: this.props.search,
      sizeFilter: this.props.sizeFilter,
    };
    return (
      <NewPuzzleList
        fencing={this.props.fencing}
        filter={filter}
        statusFilter={this.props.statusFilter}
        puzzleStatuses={this.puzzleStatuses}
        uploadedPuzzles={this.props.uploadedPuzzles}
      />
    );
  }
}
