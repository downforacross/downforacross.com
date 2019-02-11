import './css/welcomev2.css';

import React, {Component} from 'react';
import {Helmet} from 'react-helmet';
import Flex from 'react-flexview';
import _ from 'lodash';
import Nav from '../components/Nav';
import Upload from '../components/Upload';
import {getUser, PuzzlelistModel} from '../store';
import PuzzleList from '../components/PuzzleList';
import {isMobile, colorAverage} from '../jsUtils';
import classnames from 'classnames';

const BLUE = '#6aa9f4';
const WHITE = '#FFFFFF';

export default class WelcomeV2 extends Component {
  constructor() {
    super();
    this.state = {
      puzzles: [],
      userHistory: {},
      pages: 0,
      statusFilter: {
        Complete: true,
        'In progress': true,
        New: true,
      },
      sizeFilter: {
        Mini: true,
        Standard: true,
      },
      search: '',
    };
    this.loading = false;
    this.mobile = isMobile();
    this.searchInput = React.createRef();
  }

  componentDidMount() {
    this.initializePuzzlelist();
    this.initializeUser();
  }

  componentWillUnmount() {
    this.user.offAuth(this.handleAuth);
  }

  handleAuth = () => {
    if (this.user.fb) {
      this.user.listUserHistory().then((userHistory) => {
        this.setState({userHistory});
      });
    }
  };

  initializeUser() {
    this.user = getUser();
    this.user.onAuth(this.handleAuth);
  }

  get done() {
    const {pages, puzzles} = this.state;
    return puzzles.length < pages * this.puzzleList.pageSize;
  }

  get showingSidebar() {
    // eventually, allow mobile to toggle sidebar
    return !this.mobile;
  }

  nextPage = () => {
    const {pages} = this.state;
    if (this.loading || this.done) {
      return;
    }
    this.loading = true;
    this.puzzleList.getPages(pages + 1, (page) => {
      this.setState(
        {
          puzzles: page,
          pages: pages + 1,
        },
        () => {
          this.loading = false;
        }
      );
    });
  };

  initializePuzzlelist() {
    this.puzzleList = new PuzzlelistModel();
    this.nextPage();
  }

  get navStyle() {
    if (!this.mobile) return;
    const motion = this.motion;
    const {searchFocused} = this.state;
    const offset = searchFocused ? Math.round(motion) : motion;
    const top = -50 * offset;
    const height = 50 * (1 - offset);
    return {
      position: 'relative',
      top,
      height,
    };
  }

  get navTextStyle() {
    if (!this.mobile) return;
    const motion = this.motion;
    const opacity = _.clamp(1 - 3 * motion, 0, 1);
    const translateY = 50 * motion;
    return {
      opacity,
      transform: `translateY(${translateY}px)`,
    };
  }

  get navLinkStyle() {
    if (!this.mobile) return;
    const motion = this.motion;
    const translateY = 50 * motion;
    return {
      transform: `translateY(${translateY}px)`,
      zIndex: 2,
    };
  }

  handleScroll = (top) => {
    if (!this.mobile) return;
    console.log(top);
    const motion = _.clamp(top / 100, 0, 1);
    this.setState({
      motion,
    });
  };

  renderPuzzles() {
    const {userHistory, puzzles, sizeFilter, statusFilter, search} = this.state;
    return (
      <PuzzleList
        puzzles={puzzles}
        userHistory={userHistory}
        sizeFilter={sizeFilter}
        statusFilter={statusFilter}
        search={search}
        onNextPage={this.nextPage}
        onScroll={this.handleScroll}
      />
    );
  }

  handleCreatePuzzle = () => {
    this.setState({
      pages: 0,
    });
    this.nextPage();
  };

  handleFilterChange = (header, name, on) => {
    const {sizeFilter, statusFilter} = this.state;
    if (header === 'Size') {
      this.setState({
        sizeFilter: {
          ...sizeFilter,
          [name]: on,
        },
      });
    } else if (header === 'Status') {
      this.setState({
        statusFilter: {
          ...statusFilter,
          [name]: on,
        },
      });
    }
  };

  updateSearch = _.debounce((search) => {
    this.setState({search});
  }, 250);

  handleSearchInput = (e) => {
    const search = e.target.value;
    this.updateSearch(search);
  };

  handleSearchFocus = (e) => {
    this.setState({searchFocused: true});
  };

  handleSearchBlur = (e) => {
    this.setState({searchFocused: false});
  };

  renderFilters() {
    const {sizeFilter, statusFilter} = this.state;
    const headerStyle = {
      fontWeight: 600,
      marginTop: 10,
      marginBottom: 10,
    };
    const groupStyle = {
      padding: 20,
    };
    const inputStyle = {
      margin: 'unset',
    };

    const checkboxGroup = (header, items, handleChange) => (
      <Flex column style={groupStyle} className="checkbox-group">
        <span style={headerStyle}>{header}</span>
        {_.keys(items).map((name, i) => (
          <label
            key={i}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="checkbox"
              style={inputStyle}
              checked={items[name]}
              onChange={(e) => {
                handleChange(header, name, e.target.checked);
              }}
            />
            <div className="checkmark" />
            {name}
          </label>
        ))}
      </Flex>
    );

    return (
      <Flex className="filters" column hAlignContent="left" shrink={0}>
        {checkboxGroup('Size', sizeFilter, this.handleFilterChange)}
        {checkboxGroup('Status', statusFilter, this.handleFilterChange)}
      </Flex>
    );
  }

  get motion() {
    const {motion, searchFocused} = this.state;
    if (this.state.motion === undefined) return 0;

    return searchFocused ? Math.round(motion) : motion;
  }

  get colorMotion() {
    if (!this.mobile) return 0;
    const motion = this.motion;
    const result = _.clamp(motion * 3, 0, 1);
    return result;
  }

  get searchStyle() {
    if (!this.mobile) return;
    const motion = this.motion;
    const color = colorAverage(BLUE, WHITE, this.colorMotion);
    const {searchFocused} = this.state;
    const width = searchFocused ? 1 : _.clamp(1 - motion, 0.1, 1);
    const zIndex = searchFocused ? 3 : 0;
    return {
      color,
      width: `${width * 100}%`,
      zIndex,
    };
  }

  get searchInputStyle() {
    if (!this.mobile) return;
    const color = colorAverage(BLUE, WHITE, this.colorMotion);
    const backgroundColor = colorAverage(WHITE, BLUE, this.colorMotion);
    return {
      color,
      backgroundColor,
    };
  }

  get iconStyle() {
    return {
      position: 'absolute',
      left: '10px',
    };
  }

  get searchIconGraphicsStyle() {
    if (!this.mobile) return;
    const stroke = colorAverage(BLUE, WHITE, this.colorMotion);
    return {
      stroke,
    };
  }

  handleSearchIconTouchEnd = (e) => {
    this.searchInput.current && this.searchInput.current.focus();
    e.preventDefault();
    e.stopPropagation();
  };

  renderSearch() {
    const {search} = this.state;
    const searchIcon = (
      <div className="welcomev2--searchicon">
        <svg viewBox="0 0 40 40">
          <circle cx={20} cy={20} r={15} style={this.searchIconGraphicsStyle} />
          <line x1={30} y1={30} x2={40} y2={40} style={this.searchIconGraphicsStyle} />
        </svg>
      </div>
    );
    return (
      <Flex className="welcomev2--searchbar--container" shrink={0} hAlignContent="right">
        <Flex vAlignContent="center" style={this.searchStyle} className="welcomev2--searchbar--wrapper">
          <div style={this.iconStyle} onTouchEnd={this.handleSearchIconTouchEnd}>
            {searchIcon}
          </div>
          <input
            ref={this.searchInput}
            style={this.searchInputStyle}
            placeholder=" "
            onFocus={this.handleSearchFocus}
            onBlur={this.handleSearchBlur}
            onInput={this.handleSearchInput}
            val={search}
            className="welcomev2--searchbar"
          />
        </Flex>
      </Flex>
    );
  }

  renderQuickUpload() {
    return (
      <Flex className="quickplay" style={{width: 200}}>
        <Upload v2 onCreate={this.handleCreatePuzzle} />
      </Flex>
    );
  }

  render() {
    return (
      <Flex className={classnames('welcomev2', {mobile: this.mobile})} column grow={1}>
        <Helmet>
          <title>Down for a Cross</title>
        </Helmet>
        <div className="welcomev2--nav" style={this.navStyle}>
          <Nav v2 mobile={this.mobile} textStyle={this.navTextStyle} linkStyle={this.navLinkStyle} />
        </div>
        <Flex grow={1} basis={1}>
          {this.showingSidebar && (
            <Flex className="welcomev2--sidebar" column shrink={0} style={{justifyContent: 'space-between'}}>
              {this.renderFilters()}
              {!this.mobile && this.renderQuickUpload()}
            </Flex>
          )}
          <Flex className="welcomev2--main" column grow={1}>
            {this.renderSearch()}
            {this.renderPuzzles()}
          </Flex>
        </Flex>
      </Flex>
    );
  }
}
