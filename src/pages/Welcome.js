import './css/welcome.css';

import React, {Component} from 'react';
import {Helmet} from 'react-helmet';
import Flex from 'react-flexview';
import {MdSearch, MdCheckBoxOutlineBlank, MdCheckBox} from 'react-icons/md';
import _ from 'lodash';
import Nav from '../components/common/Nav';
import Upload from '../components/Upload';
import {getUser, PuzzlelistModel} from '../store';
import PuzzleList from '../components/PuzzleList';
import {isMobile, colorAverage} from '../lib/jsUtils';
import classnames from 'classnames';
import {fetchPuzzleList} from '../store/api';

const BLUE = '#6aa9f4';
const WHITE = '#FFFFFF';

export default class Welcome extends Component {
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
    this.nav = React.createRef();
  }

  componentDidMount() {
    this.initializePuzzlelist();
    this.initializeUser();
    this.navHeight = this.nav.current.getBoundingClientRect().height;
  }

  componentWillUnmount() {
    this.user.offAuth(this.handleAuth);
  }

  handleAuth = () => {
    this.user.listUserHistory().then((userHistory) => {
      this.setState({userHistory});
    });
  };

  initializeUser() {
    this.user = getUser();
    this.user.onAuth(this.handleAuth);
  }

  get pageSize() {
    return 40;
  }

  get done() {
    return this.state.puzzles.length < this.state.pages * this.pageSize;
  }

  get showingSidebar() {
    // eventually, allow mobile to toggle sidebar
    return !this.mobile;
  }

  nextPage = async () => {
    const {pages} = this.state;
    if (this.loading || this.done) {
      return;
    }
    this.loading = true;
    const query = {
      page: this.state.pages,
      pageSize: this.pageSize,
    };

    const puzzles = await fetchPuzzleList(query);
    this.setState({
      puzzles,
      pages: pages + 1,
    });
    this.loading = false;
  };

  initializePuzzlelist() {
    this.nextPage();
  }

  get navStyle() {
    if (!this.mobile) return undefined;
    const motion = this.motion;
    const {searchFocused} = this.state;
    const offset = motion;
    const top = -this.navHeight * offset;
    const height = this.navHeight * (1 - offset);
    return {
      position: 'relative',
      top,
      height,
      opacity: searchFocused && motion === 1 ? 0 : 1,
    };
  }

  get navTextStyle() {
    if (!this.mobile) return undefined;
    const motion = this.motion;
    const opacity = _.clamp(1 - 3 * motion, 0, 1);
    const translateY = this.navHeight * motion;
    return {
      opacity,
      transform: `translateY(${translateY}px)`,
    };
  }

  get navLinkStyle() {
    if (!this.mobile) return undefined;
    const motion = this.motion;
    const translateY = this.navHeight * motion;
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
            {items[name] ? (
              <MdCheckBox className="checkbox-icon" />
            ) : (
              <MdCheckBoxOutlineBlank className="checkbox-icon" />
            )}
            <span>{name}</span>
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
    // if (this.state.searchFocused) return 0;
    const motion = this.motion;
    const result = _.clamp(motion * 3, 0, 1);
    return result;
  }

  get searchStyle() {
    if (!this.mobile) return {flexGrow: 1};
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
    if (!this.mobile) return undefined;
    const color = colorAverage(BLUE, WHITE, this.colorMotion);
    const backgroundColor = colorAverage(WHITE, BLUE, this.colorMotion);
    const paddingTop = (1 - this.motion) * 10;
    const paddingBottom = paddingTop;
    return {
      color,
      backgroundColor,
      paddingTop,
      paddingBottom,
    };
  }

  get searchIconGraphicsStyle() {
    if (!this.mobile) return undefined;
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
    const hAlignContent = this.mobile ? 'right' : 'left';
    const grow = this.mobile ? 0 : 1;
    return (
      <Flex className="welcome--searchbar--container" shrink={0} hAlignContent={hAlignContent}>
        <Flex
          vAlignContent="center"
          style={this.searchStyle}
          grow={grow}
          className="welcome--searchbar--wrapper"
        >
          <MdSearch className="welcome--searchicon" onTouchEnd={this.handleSearchIconTouchEnd} />
          <input
            ref={this.searchInput}
            style={this.searchInputStyle}
            placeholder=" "
            onFocus={this.handleSearchFocus}
            onBlur={this.handleSearchBlur}
            onInput={this.handleSearchInput}
            val={search}
            className="welcome--searchbar"
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
      <Flex className={classnames('welcome', {mobile: this.mobile})} column grow={1}>
        <Helmet>
          <title>Down for a Cross</title>
        </Helmet>
        <div className="welcome--nav" style={this.navStyle}>
          <Nav
            v2
            mobile={this.mobile}
            textStyle={this.navTextStyle}
            linkStyle={this.navLinkStyle}
            divRef={this.nav}
          />
        </div>
        <Flex grow={1} basis={1}>
          {this.showingSidebar && (
            <Flex className="welcome--sidebar" column shrink={0} style={{justifyContent: 'space-between'}}>
              {this.renderFilters()}
              {!this.mobile && this.renderQuickUpload()}
            </Flex>
          )}
          <Flex className="welcome--main" column grow={1}>
            {this.renderSearch()}
            {this.renderPuzzles()}
          </Flex>
        </Flex>
      </Flex>
    );
  }
}
