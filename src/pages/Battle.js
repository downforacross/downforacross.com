import './css/battle.css';
import 'react-flexview/lib/flexView.css';

import React, {Component} from 'react';
import _ from 'lodash';
import {Helmet} from 'react-helmet';
import Flex from 'react-flexview';
// eslint-disable-next-line import/no-extraneous-dependencies
import classnames from 'classnames';
import {BattleModel} from '../store';
import redirect from '../lib/redirect';
import {isMobile} from '../lib/jsUtils';

export default class Battle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bid: undefined,
      team: undefined,
      games: undefined,
      startedAt: undefined,
      redirecting: false,
      name: undefined,
      players: undefined,
    };
    this.mobile = isMobile();
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
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({redirecting: true}, () => redirect(`/beta/game/${self}`));
    }
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.handleUnload);
  }

  // ================
  // Getters

  get bid() {
    return Number(this.props.match.params.bid);
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

  handleTeamSelect = (team) => {
    this.battleModel.addPlayer(this.state.name, team);
    this.setState({team});
  };

  handleChangeName = (name) => {
    localStorage.setItem(`battle_${this.state.bid}`, name);
    this.setState({name});
  };

  handleUnload = () => {
    if (this.state.name && _.isNumber(this.state.team) && !this.state.redirecting) {
      this.battleModel.removePlayer(this.state.name, this.state.team);
    }
  };

  // ================
  // Render Methods

  renderTeamSelector() {
    const disabled = !this.state.name; // both undefined & '' are falsy
    const buttonClass = classnames('battle--button', {
      disabled,
    });
    return (
      <Flex className="battle--selector">
        <Flex className="battle--buttons">
          <Flex
            className={buttonClass}
            hAlignContent="center"
            onClick={() => !disabled && this.handleTeamSelect(0)}
          >
            Team 1
          </Flex>
          <Flex
            className={buttonClass}
            hAlignContent="center"
            onClick={() => !disabled && this.handleTeamSelect(1)}
          >
            Team 2
          </Flex>
        </Flex>
        <Flex className="battle--name">
          <input
            className="battle--input"
            placeholder="Name..."
            onChange={(event) => this.handleChangeName(event.target.value)}
          />
        </Flex>
        {this.renderTeams()}
      </Flex>
    );
  }

  renderPlayer = (player, idx) => (
    <Flex className="battle--player" key={idx}>
      {' '}
      {player.name}
      {' '}
    </Flex>
  );

  renderTeam = (team, idx) => (
    <Flex className="battle--team" key={idx}>
      <Flex className="battle--team-name">
        {' '}
        Team
        {Number(idx) + 1}
      </Flex>
      {_.map(team, this.renderPlayer)}
    </Flex>
  );

  renderTeams() {
    const numTeams = Math.max(_.max(_.map(this.state.players, 'team')), 2);
    const teams = _.map(_.range(numTeams), (team) => _.filter(this.state.players, {team}));

    return <Flex className="battle--teams">{_.map(teams, this.renderTeam)}</Flex>;
  }

  renderPreGameLobby() {
    return (
      <Flex className="battle--selector">
        <Flex className="battle--teams">(This starts the game for all players)</Flex>
        <Flex className="battle--buttons">
          <Flex className="battle--button" hAlignContent="center" onClick={() => this.battleModel.start()}>
            Start
          </Flex>
        </Flex>
        {this.renderTeams()}
      </Flex>
    );
  }

  render() {
    return (
      <Flex
        className={classnames('battle', {mobile: this.mobile})}
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
