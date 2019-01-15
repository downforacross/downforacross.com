import 'react-flexview/lib/flexView.css';

import React, {Component} from 'react';
import Nav from '../components/Nav';
import _ from 'lodash';
import {Helmet} from 'react-helmet';
import Flex from 'react-flexview';

import {GameModel, getUser, BattleModel} from '../store';
import HistoryWrapper from '../utils/historyWrapper';
import Game from '../components/Game';
import MobilePanel from '../components/MobilePanel';
import ChatV2 from '../components/ChatV2';
import Powerups from '../components/Powerups';
import redirect from '../redirect';
import {isMobile} from '../jsUtils';

import * as powerupLib from '../lib/powerups';

export default class GameV2 extends Component {
  constructor(props) {
    super();
    this.state = {
      gid: undefined,
      mobile: isMobile(),
      mode: 'game',
      powerups: undefined,
    };
    this.initializeUser();
  }

  // lifecycle stuff

  static getDerivedStateFromProps(props, prevState) {
    return {
      ...prevState,
      rid: props.match.params.rid,
      gid: parseInt(props.match.params.gid, 10),
    };
  }

  initializeUser() {
    this.user = getUser();
    this.user.onAuth(() => {
      this.forceUpdate();
    });
  }

  initializeBattle(battleData) {
    if (!battleData) {
      return;
    }

    const {bid, team} = battleData;
    this.setState({bid, team});
    if (this.battleModel) this.battleModel.detach();

    this.battleModel = new BattleModel(`/battle/${bid}`);

    this.battleModel.once('games', (games) => {
      const opponent = games[1 - team];
      this.setState({opponent}, () => this.initializeOpponentGame());
    });

    this.battleModel.on('usePowerup', (powerup) => {
      const {gameModel, opponentGameModel} = this;
      const {selected} = this.gameComponent.player.state;
      powerupLib.applyOneTimeEffects(powerup, {gameModel, opponentGameModel, selected});
      this.handleChange();
    });

    _.forEach(['powerups', 'startedAt', 'winner', 'players', 'pickups'], (subpath) => {
      this.battleModel.on(subpath, (value) => {
        this.setState({[subpath]: value});
      });
    });
    this.battleModel.attach();
  }

  initializeGame() {
    if (this.gameModel) this.gameModel.detach();
    this.gameModel = new GameModel(`/game/${this.state.gid}`);
    this.historyWrapper = new HistoryWrapper();
    this.gameModel.on('createEvent', (event) => {
      if (!event.params || event.params.type) {
        redirect(`/game/${this.state.gid}`, 'Redirecting to old site...');
      }
      this.historyWrapper.setCreateEvent(event);
      this.handleUpdate();
    });
    this.gameModel.on('event', (event) => {
      if (!event.params || event.params.type) {
        redirect(`/game/${this.state.gid}`, 'Redirecting to old site...');
      }
      this.historyWrapper.addEvent(event);
      this.handleChange();
      this.handleUpdate();
    });
    this.gameModel.once('battleData', (battleData) => {
      this.initializeBattle(battleData);
    });
    this.gameModel.attach();
  }

  // TODO: combine this logic with the above...
  initializeOpponentGame() {
    if (!this.state.opponent) return;

    if (this.opponentGameModel) this.opponentGameModel.detach();

    this.opponentGameModel = new GameModel(`/game/${this.state.opponent}`);
    this.opponentHistoryWrapper = new HistoryWrapper();
    this.opponentGameModel.on('createEvent', (event) => {
      this.opponentHistoryWrapper.setCreateEvent(event);
      this.handleUpdate();
    });
    this.opponentGameModel.on('event', (event) => {
      this.opponentHistoryWrapper.addEvent(event);
      this.handleChange();
      this.handleUpdate();
    });

    // For now, every client spawns pickups. That makes sense maybe from a balance perpsective.
    // It's just easier to write. Also for now you can have multiple in the same tile oops.
    // TODO: fix these.
    setInterval(() => {
      this.battleModel.spawnPowerups(1, [this.game, this.opponentGame]);
    }, 6 * 1000);

    this.opponentGameModel.attach();
  }

  componentDidMount() {
    this.initializeGame();
  }

  componentWillUnmount() {
    if (this.gameModel) this.gameModel.detach();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.gid !== this.state.gid) {
      this.initializeGame();
    }
    if (prevState.winner !== this.state.winner && this.state.winner) {
      const {winner, startedAt, players} = this.state;
      const {team, completedAt} = winner;

      const winningPlayers = _.filter(_.values(players), {team});
      const winningPlayersString = _.join(_.map(winningPlayers, 'name'), ', ');

      const victoryMessage = `Team ${parseInt(team) + 1} [${winningPlayersString}] won! `;
      const timeMessage = `Time taken: ${parseInt((completedAt - startedAt) / 1000)} seconds.`;

      this.gameModel.chat('BattleBot', null, victoryMessage + timeMessage);
    }
  }

  get showingGame() {
    return !this.state.mobile || this.state.mode === 'game';
  }

  get showingChat() {
    return !this.state.mobile || this.state.mode === 'chat';
  }

  get game() {
    return this.historyWrapper.getSnapshot();
  }

  get opponentGame() {
    if (!this.opponentGameModel || !this.opponentGameModel.attached || !this.opponentHistoryWrapper) {
      return;
    }
    return this.opponentHistoryWrapper.getSnapshot();
  }

  handleToggleChat = () => {
    const toggledMode = this.state.mode === 'game' ? 'chat' : 'game';
    this.setState({mode: toggledMode});
  };

  handleChat = (username, id, message) => {
    this.gameModel.chat(username, id, message);
  };

  handleUnfocusGame = () => {
    this.chat && this.chat.focus();
  };

  handleUnfocusChat = () => {
    this.gameComponent && this.gameComponent.focus();
  };

  handleUpdate = _.debounce(
    () => {
      this.forceUpdate();
    },
    0,
    {
      leading: true,
    }
  );

  handleChange = _.debounce(({isEdit = false} = {}) => {
    if (isEdit) {
      this.user.joinGame(this.state.gid, {
        pid: this.game.pid,
        solved: false,
        v2: true,
      });
    }
    if (this.game.solved) {
      this.user.markSolved(this.state.gid);
      if (this.battleModel) {
        this.battleModel.setSolved(this.state.team);
      }
    }
  });

  handleUsePowerup = (powerup) => {
    this.battleModel.usePowerup(powerup.type, this.state.team);
  };

  // ================
  // Render Methods

  renderGame() {
    if (!this.gameModel || !this.gameModel.attached) {
      return;
    }

    const {mobile} = this.state;
    const {id, color} = this.user;
    const ownPowerups = _.get(this.state.powerups, this.state.team);
    const opponentPowerups = _.get(this.state.powerups, 1 - this.state.team);
    return (
      <Game
        ref={(c) => {
          this.gameComponent = c;
        }}
        id={id}
        myColor={color}
        historyWrapper={this.historyWrapper}
        gameModel={this.gameModel}
        onUnfocus={this.handleUnfocusGame}
        onChange={this.handleChange}
        onToggleChat={this.handleToggleChat}
        mobile={mobile}
        opponentHistoryWrapper={
          this.opponentGameModel && this.opponentGameModel.attached && this.opponentHistoryWrapper
        }
        ownPowerups={ownPowerups}
        opponentPowerups={opponentPowerups}
        pickups={this.state.pickups}
        battleModel={this.battleModel}
        team={this.state.team}
      />
    );
  }

  renderChat() {
    if (!this.gameModel || !this.gameModel.attached) {
      return;
    }

    const {id, color} = this.user;
    const {mobile} = this.state;
    return (
      <ChatV2
        ref={(c) => {
          this.chat = c;
        }}
        info={this.game.info}
        data={this.game.chat}
        colors={this.game.colors}
        id={id}
        myColor={color}
        onChat={this.handleChat}
        onUnfocus={this.handleUnfocusChat}
        onToggleChat={this.handleToggleChat}
        mobile={mobile}
        opponentData={this.opponentGame && this.opponentGame.chat}
        bid={this.state.bid}
      />
    );
  }

  getPuzzleTitle() {
    if (!this.gameModel || !this.gameModel.attached) {
      return;
    }
    const game = this.historyWrapper.getSnapshot();
    if (!game || !game.info) return '';
    return game.info.title;
  }

  render() {
    const powerups = _.get(this.state.powerups, this.state.team);
    return (
      <Flex
        className="room"
        column
        grow={1}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Helmet>
          <title>{this.getPuzzleTitle()}</title>
        </Helmet>
        <Nav v2 hidden={this.state.mobile} />
        <MobilePanel />
        <Flex className="room--main" grow={1}>
          <Flex column shrink={0}>
            {this.showingGame && this.renderGame()}
          </Flex>
          <Flex grow={1}>{this.showingChat && this.renderChat()}</Flex>
        </Flex>
        {powerups && <Powerups powerups={powerups} handleUsePowerup={this.handleUsePowerup} />}
      </Flex>
    );
  }
}
