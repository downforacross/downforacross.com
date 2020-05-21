import 'react-flexview/lib/flexView.css';

import React, {Component} from 'react';
import Nav from '../components/common/Nav';
import _ from 'lodash';
import querystring from 'querystring';
import {Helmet} from 'react-helmet';
import Flex from 'react-flexview';

import {GameModel, getUser, BattleModel} from '../store';
import HistoryWrapper from '../lib/wrappers/HistoryWrapper';
import GameComponent from '../components/Game';
import MobilePanel from '../components/common/MobilePanel';
import Chat from '../components/Chat';
import Powerups from '../components/common/Powerups';
import {isMobile} from '../lib/jsUtils';

import * as powerupLib from '../lib/powerups';

export default class Game extends Component {
  constructor(props) {
    super();
    window.gameComponent = this;
    this.state = {
      gid: undefined,
      mobile: isMobile(),
      mode: 'game',
      powerups: undefined,
      lastReadChat: 0,
    };
    this.initializeUser();
    window.addEventListener('resize', () => {
      this.setState({
        mobile: isMobile(),
      });
    });
  }

  // lifecycle stuff

  static getDerivedStateFromProps(props, prevState) {
    return {
      ...prevState,
      rid: props.match.params.rid,
      gid: props.match.params.gid,
    };
  }

  get beta() {
    return !!this.query.beta;
  }

  get query() {
    return querystring.parse(this.props.location.search.slice(1));
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
    this.gameModel.once('battleData', (battleData) => {
      this.initializeBattle(battleData);
    });
    if (this.beta) {
      this.gameModel.on('wsCreateEvent', (event) => {
        this.historyWrapper.setCreateEvent(event);
        this.handleUpdate();
      });
      this.gameModel.on('wsEvent', (event) => {
        this.historyWrapper.addEvent(event);
        this.handleChange();
        this.handleUpdate();
      });
      this.gameModel.on('wsOptimisticEvent', (event) => {
        this.historyWrapper.addOptimisticEvent(event);
        this.handleChange();
        this.handleUpdate();
      });
    } else {
      this.gameModel.on('createEvent', (event) => {
        this.historyWrapper.setCreateEvent(event);
        this.handleUpdate();
      });
      this.gameModel.on('event', (event) => {
        this.historyWrapper.addEvent(event);
        this.handleChange();
        this.handleUpdate();
      });
    }

    this.gameModel.on('archived', (event) => {
      this.setState({
        archived: true,
      });
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

      const victoryMessage = `Team ${Number(team) + 1} [${winningPlayersString}] won! `;
      const timeMessage = `Time taken: ${Number((completedAt - startedAt) / 1000)} seconds.`;

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
    if (!this.opponentGameModel || !this.opponentHistoryWrapper.ready || !this.opponentHistoryWrapper) {
      return undefined;
    }
    return this.opponentHistoryWrapper.getSnapshot();
  }

  get unreads() {
    const lastMessage = Math.max(...(this.game.chat.messages || []).map((m) => m.timestamp));
    return lastMessage > this.state.lastReadChat;
  }

  handleToggleChat = () => {
    const toggledMode = this.state.mode === 'game' ? 'chat' : 'game';
    this.setState({mode: toggledMode});
  };

  handleChat = (username, id, message) => {
    this.gameModel.chat(username, id, message);
  };

  handleUpdateDisplayName = (id, displayName) => {
    this.gameModel.updateDisplayName(id, displayName);
  };

  updateSeenChatMessage = (message) => {
    if (message.timestamp > this.state.lastReadChat) {
      this.setState({lastReadChat: message.timestamp});
    }
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
    if (!this.gameModel || !this.historyWrapper.ready) {
      return;
    }

    if (isEdit) {
      this.user.joinGame(this.state.gid, {
        pid: this.game.pid,
        solved: false,
        v2: true,
      });
    }
    if (this.game.solved) {
      if (this.gameModel.puzzleModel) {
        this.gameModel.puzzleModel.logSolve(this.state.gid, {
          solved: true,
          totalTime: this.game.clock.totalTime,
        });
      }
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
    if (!this.gameModel || !this.historyWrapper.ready) {
      return;
    }

    const {mobile} = this.state;
    const {id, color} = this.user;
    const ownPowerups = _.get(this.state.powerups, this.state.team);
    const opponentPowerups = _.get(this.state.powerups, 1 - this.state.team);
    return (
      <GameComponent
        ref={(c) => {
          this.gameComponent = c;
        }}
        beta={this.beta}
        id={id}
        myColor={color}
        historyWrapper={this.historyWrapper}
        gameModel={this.gameModel}
        onUnfocus={this.handleUnfocusGame}
        onChange={this.handleChange}
        onSolve={this.handleSolve}
        onToggleChat={this.handleToggleChat}
        mobile={mobile}
        opponentHistoryWrapper={
          this.opponentGameModel && this.opponentHistoryWrapper.ready && this.opponentHistoryWrapper
        }
        ownPowerups={ownPowerups}
        opponentPowerups={opponentPowerups}
        pickups={this.state.pickups}
        battleModel={this.battleModel}
        team={this.state.team}
        unreads={this.unreads}
      />
    );
  }

  renderChat() {
    if (!this.gameModel || !this.historyWrapper.ready) {
      return;
    }

    const {id, color} = this.user;
    const {mobile} = this.state;
    return (
      <Chat
        ref={(c) => {
          this.chat = c;
        }}
        info={this.game.info}
        data={this.game.chat}
        users={this.game.users}
        id={id}
        myColor={color}
        onChat={this.handleChat}
        onUpdateDisplayName={this.handleUpdateDisplayName}
        onUnfocus={this.handleUnfocusChat}
        onToggleChat={this.handleToggleChat}
        mobile={mobile}
        opponentData={this.opponentGame && this.opponentGame.chat}
        bid={this.state.bid}
        updateSeenChatMessage={this.updateSeenChatMessage}
      />
    );
  }

  getPuzzleTitle() {
    if (!this.gameModel || !this.historyWrapper.ready) {
      return;
    }
    const game = this.historyWrapper.getSnapshot();
    if (!game || !game.info) return '';
    return game.info.title;
  }

  renderContent() {
    const powerups = _.get(this.state.powerups, this.state.team);

    const mobileContent = (
      <React.Fragment>
        <MobilePanel />
        {this.showingGame && this.renderGame()}
        {this.showingChat && this.renderChat()}
      </React.Fragment>
    );

    const desktopContent = (
      <React.Fragment>
        <Nav v2 />
        <Flex grow={1} style={{overflow: 'auto'}}>
          <Flex column shrink={0}>
            {this.showingGame && this.renderGame()}
          </Flex>
          <Flex grow={1}>{this.showingChat && this.renderChat()}</Flex>
        </Flex>
        {powerups && <Powerups powerups={powerups} handleUsePowerup={this.handleUsePowerup} />}
      </React.Fragment>
    );

    return this.state.mobile ? mobileContent : desktopContent;
  }

  render() {
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
        {this.renderContent()}
      </Flex>
    );
  }
}
