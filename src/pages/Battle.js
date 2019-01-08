import './css/battle.css';
import 'react-flexview/lib/flexView.css';

import React, {Component} from 'react';
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
      startedAt: undefined,
      redirecting: false,
      name: undefined,
      players: undefined,
    };
    this.handleChangeName = this.handleChangeName.bind(this);
    this.handleUnload = this.handleUnload.bind(this);
    this.renderTeam = this.renderTeam.bind(this); // Why do I have to do this?
  }

  componentDidMount() {
    this.initializeBattle();
    window.addEventListener('beforeunload', this.handleUnload);
  }

  componentDidUpdate() {
    if (
      this.state.startedAt &&
      this.state.team !== undefined &&
      this.state.games &&
      !this.state.redirecting
    ) {
      const self = this.state.games[this.state.team];
      this.setState({redirecting: true}, () => redirect(`/beta/game/${self}`));
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleUnload);
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
      this.setState({games});
    });
    this.battleModel.on('startedAt', (startedAt) => {
      this.setState({startedAt});
    });
    this.battleModel.on('players', (players) => {
      this.setState({players: _.values(players)});
    });
    this.battleModel.attach();
  }

  handleTeamSelect(team) {
    this.battleModel.addPlayer(this.state.name, team);
    this.setState({team});
  }

  handleChangeName(name) {
    localStorage.setItem(`battle_${this.state.bid}`, name);
    this.setState({name});
  }

  handleUnload() {
    if (this.state.name && _.isNumber(this.state.team) && !this.state.redirecting) {
      this.battleModel.removePlayer(this.state.name, this.state.team);
    }
  }

  // ================
  // Render Methods

  renderTeamSelector() {
    const isDisabled = !this.state.name || this.state.name === '';
    const buttonClass = isDisabled ? 'battle--button-disabled' : 'battle--button';
    return (
      <Flex className="battle--selector">
        <Flex className="battle--buttons">
          <Flex
            className={buttonClass}
            hAlignContent="center"
            onClick={() => !isDisabled && this.handleTeamSelect(0)}
          >
            {'Team 1'}
          </Flex>
          <Flex
            className={buttonClass}
            hAlignContent="center"
            onClick={() => !isDisabled && this.handleTeamSelect(1)}
          >
            {'Team 2'}
          </Flex>
        </Flex>
        <Flex className="battle--name">
          <input
            className="battle--input"
            placeholder="Name..."
            onChange={(event) => this.handleChangeName(event.target.value)}
          />
        </Flex>
      </Flex>
    );
  }

  renderPlayer(player, idx) {
    return (
      <Flex className="battle--player" key={idx}>
        {' '}
        {player.name}{' '}
      </Flex>
    );
  }

  renderTeam(team, idx) {
    return (
      <Flex className="battle--team" key={idx}>
        <Flex className="battle--team-name"> Team {parseInt(idx) + 1} </Flex>
        {_.map(team, this.renderPlayer)}
      </Flex>
    );
  }

  renderPreGameLobby() {
    const numTeams = Math.max(_.max(_.map(this.state.players, 'team')), 2);
    const teams = _.map(_.range(numTeams), (team) => _.filter(this.state.players, {team}));

    return (
      <Flex className="battle--selector">
        <Flex className="battle--teams">(This starts the game for all players)</Flex>
        <Flex className="battle--buttons">
          <Flex className="battle--button" hAlignContent="center" onClick={() => this.battleModel.start()}>
            {'Start'}
          </Flex>
        </Flex>
        <Flex className="battle--teams">{_.map(teams, this.renderTeam)}</Flex>
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
          <title>Down For A Battle</title>
        </Helmet>
        <Flex className="battle--main" grow={1}>
          <Flex column shrink={0}>
            {!_.isNumber(this.state.team) && this.renderTeamSelector()}
            {_.isNumber(this.state.team) && !this.state.startedAt && this.renderPreGameLobby()}
          </Flex>
        </Flex>
      </Flex>
    );
  }
}
