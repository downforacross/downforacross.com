import './css/welcomev2.css';

import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import Flex from 'react-flexview';
import _ from 'lodash';
import Nav from '../components/Nav';
import Upload from '../components/Upload';
import { getUser, PuzzlelistModel } from '../store';
import PuzzleList from '../components/PuzzleList';

export default class WelcomeV2 extends Component {

  constructor() {
    super();
    this.state = {
      puzzles: [],
      userHistory: {},
      pages: 0,
      statusFilter: {
        'Complete': true,
        'In progress': true,
        'New': true,
      },
      sizeFilter: {
        'Mini': true,
        'Standard': true,
      },
      search: '',
    };
    this.loading = false;
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
      this.user.listUserHistory(userHistory => {
        this.setState({ userHistory });
      });
    }
  }

  initializeUser() {
    this.user = getUser();
    this.user.onAuth(this.handleAuth);
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

  renderPuzzles() {
    const { userHistory, puzzles, sizeFilter, statusFilter, search } = this.state;
    return (
      <PuzzleList
        puzzles={puzzles}
        userHistory={userHistory}
        sizeFilter={sizeFilter}
        statusFilter={statusFilter}
        search={search}
        onNextPage={this.nextPage}
      />
    );
  }

  handleFilterChange = (header, name, on) => {
    const { sizeFilter, statusFilter } = this.state;
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
  }

  updateSearch = _.debounce((search) => {
    this.setState({search});
  }, 250)

  handleSearchInput = (e) => {
    const search = e.target.value;
    this.updateSearch(search);
  }

  renderFilters() {
    const { sizeFilter, statusFilter } = this.state;
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
        {_.keys(items).map((name, i) => (
          <label key={i} onMouseDown={e => {e.preventDefault();}}>
            <input type="checkbox" checked={items[name]} onChange={e => {
              handleChange(header, name, e.target.checked);
            }}/>
            <div className='checkmark'/>
            {name}
          </label>
        ))}
      </Flex>
    );

    return (
      <Flex className='filters' column hAlignContent='left' shrink={0}>
        {checkboxGroup('Size', sizeFilter, this.handleFilterChange)}
        {checkboxGroup('Status', statusFilter,  this.handleFilterChange)}
      </Flex>
    );
  }

  renderSearch() {
    const { search } = this.state;
    return (
      <Flex>
        <input placeholder='Search' onInput={this.handleSearchInput} val={search}/>
      </Flex>
    );
  }

  renderQuickUpload() {
    return (
      <Flex column className="quickplay">
        <Upload v2/>
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
        <Flex grow={1} basis={1}>
          <Flex className='welcomev2--sidebar' column shrink={0} style={{justifyContent: 'space-between'}}>
            { this.renderFilters() }
            { this.renderSearch() }
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


