import './css/compose.css';

import actions from '../actions';
import redirect from '../redirect';

import {Helmet} from 'react-helmet';
import _ from 'lodash';
import React, {Component} from 'react';
import Flex from 'react-flexview';

import Nav from '../components/Nav';
import {getUser, CompositionModel} from '../store';

const TimeFormatter = ({millis}) =>
  millis ? (
    <span>
      {Math.floor(millis / 60000)}m {Math.floor(millis / 1000) % 60}s
    </span>
  ) : null;

function getTime(game) {
  if (game.stopTime) {
    let t = game.stopTime - game.startTime;
    if (game.pauseTime) t += game.pauseTime;
    return t;
  }
}

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
    if (this.user.fb) {
      this.user.listCompositions().then((compositions) => {
        console.log('list compositions', compositions);
        this.setState({compositions});
      });
    }
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
            {_.keys(compositions).map((cid) => <div>{this.linkToComposition(cid, compositions[cid])}</div>)}
          </Flex>
          <div>
            <button onClick={this.handleCreateClick}>New</button>
          </div>
        </Flex>
      </Flex>
    );
  }
}
