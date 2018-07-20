import React, { Component } from 'react';
import Flex from 'react-flexview';
import Nav from '../components/Nav';
import redirect from '../redirect';
import actions from '../actions';
import _ from 'lodash';
import { getUser, PuzzlelistModel, GameModel, PuzzleModel } from '../store';

export default class Play extends Component {
  componentDidMount() {
    const { pid } = this.props.match.params;
    const search = this.props.location.search;
    this.create(pid);
  }

  create(pid) {
    actions.getNextGid(gid => {
      const game = new GameModel(`/game/${gid}`);
      const puzzle = new PuzzleModel(`/puzzle/${pid}`);
      puzzle.attach();
      puzzle.on('ready', () => {
        const rawGame = puzzle.toGame();
        game.initialize(rawGame);
        const redirect = url => {
          this.props.history.push(url);
        };
        redirect(`/beta/game/${gid}`);
        this.props.history.push();
      });
    });
  }


  render() {
    return (
      <div>
        <Nav v2/>
        <div style={{padding: 20}}>
          Creating game...
        </div>
      </div>
    );
  }
}
