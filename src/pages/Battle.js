import './css/battle.css';
import 'react-flexview/lib/flexView.css';

import React, {Component} from 'react';
import GameV2 from './GameV2';
import _ from 'lodash';
import {Helmet} from 'react-helmet';
import Flex from 'react-flexview';
import {BattleModel} from '../store';
import redirect from '../redirect';

export default class Battle extends Component {
  constructor(props) {
    super();
    this.state = {
      bid: undefined,
      team: undefined,
      games: undefined,
      started: false,
      redirecting: false,
    };
  }

  componentDidMount() {
    this.initializeBattle();
  }

  componentDidUpdate() {
    console.log(this.state.redirecting, this.state.started, this.state.team);
    if (this.state.started && this.state.team !== undefined && !this.state.redirecting) {
      console.log('REDIR');
      this.setState({redirecting: true}, () =>
        redirect(`/beta/game/${this.state.games[this.state.team - 1]}`)
      );
    }
  }

  // ================
  // Getters

  get bid() {
    return parseInt(this.props.match.params.bid, 10);
  }

  // ================

  initializeBattle() {
    if (this.battleModel) this.battleModel.detach();
    this.battleModel = new BattleModel(`/battle/${this.bid}`);
    this.battleModel.on('games', (games) => {
      console.log('SETGIN', games);
      this.setState({games});
    });
    this.battleModel.on('started', (started) => {
      this.setState({started});
    });
    this.battleModel.attach();
  }

  handleTeamSelect(team) {
    this.setState({team});
  }

  // ================
  // Render Methods

  renderTeamSelector() {
    return (
      <Flex className="battle--selector">
        <Flex className="battle--button" hAlignContent="center" onClick={() => this.handleTeamSelect(1)}>
          {'Team 1'}
        </Flex>
        <Flex className="battle--button" hAlignContent="center" onClick={() => this.handleTeamSelect(2)}>
          {'Team 2'}
        </Flex>
      </Flex>
    );
  }

  renderStartButton() {
    // TODO: show how many players connected / team comps
    return (
      <Flex className="battle--selector">
        <Flex className="battle--button" hAlignContent="center" onClick={() => this.battleModel.start()}>
          {'Start'}
        </Flex>
      </Flex>
    );
  }

  render() {
    return (
      <Flex
        className="battle"
        column
        grow={1}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Helmet>
          <title>Battle mode</title>
        </Helmet>
        <Flex className="battle--main" grow={1}>
          <Flex column shrink={0}>
            {!this.state.team && this.renderTeamSelector()}
            {this.state.team && !this.state.started && this.renderStartButton()}
          </Flex>
        </Flex>
      </Flex>
    );
  }
}
