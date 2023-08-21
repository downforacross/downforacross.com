import './css/compose.css';

import {Helmet} from 'react-helmet';
import _ from 'lodash';
import React, {Component} from 'react';
import Flex from 'react-flexview';
import redirect from '../lib/redirect';
import actions from '../actions';

import Nav from '../components/common/Nav';
import {getUser, CompositionModel} from '../store';

export default class Compose extends Component {
  constructor() {
    super();
    this.state = {
      compositions: {},
      limit: 20,
    };
    this.puzzle = null;
  }

  componentDidMount() {
    this.initializeUser();
  }

  handleAuth = () => {
    this.user.listCompositions().then((compositions) => {
      this.setState({compositions});
    });
  };

  handleCreateClick = (e) => {
    e.preventDefault();
    actions.getNextCid((cid) => {
      const composition = new CompositionModel(`/composition/${cid}`);
      composition.initialize().then(() => {
        redirect(`/composition/${cid}`);
      });
    });
  };

  initializeUser() {
    this.user = getUser();
    this.user.onAuth(this.handleAuth);
    this.handleAuth();
  }

  linkToComposition(cid, {title, author}) {
    return (
      <span>
        <a href={`/composition/${cid}/`}>{cid}</a>: {title} by {author}
      </span>
    );
  }

  render() {
    const {limit, compositions} = this.state;
    return (
      <Flex column className="compositions">
        <Nav v2 composeEnabled />
        <Helmet>
          <title>Down for Across: Compose</title>
        </Helmet>
        <Flex shrink={0} hAlignContent="center">
          Limit: {limit}
          &nbsp;
          <button
            onClick={() => {
              this.setState({limit: limit + 10});
            }}
          >
            +
          </button>
          &nbsp;
          <button
            onClick={() => {
              this.setState({limit: limit + 50});
            }}
          >
            ++
          </button>
        </Flex>
        <Flex
          column
          style={{
            paddingLeft: 30,
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          <h3>Compositions</h3>
          <Flex column>
            {_.keys(compositions).length === 0 && 'Nothing found'}
            {_.keys(compositions).map((cid) => (
              <div>{this.linkToComposition(cid, compositions[cid])}</div>
            ))}
          </Flex>
          <br />
          <div>
            <button onClick={this.handleCreateClick}>New</button>
          </div>
        </Flex>
      </Flex>
    );
  }
}
