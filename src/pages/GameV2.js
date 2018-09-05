import 'react-flexview/lib/flexView.css'

import React, { Component } from 'react';
import Nav from '../components/Nav';
import _ from 'lodash';
import { Helmet } from 'react-helmet';
import Flex from 'react-flexview';

import { GameModel, getUser } from '../store';
import HistoryWrapper from '../utils/historyWrapper';
import Game from '../components/Game';
import MobilePanel from '../components/MobilePanel';
import ChatV2 from '../components/ChatV2';
import redirect from '../redirect';
import { isMobile } from '../jsUtils';

export default class GameV2 extends Component {
  constructor(props) {
    super();
    this.state = {
      gid: undefined,
      mobile: isMobile(),
      mode: 'game',
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

  initializeGame() {
    if (this.gameModel) this.gameModel.detach();
    this.gameModel = new GameModel(`/game/${this.state.gid}`);
    this.historyWrapper = new HistoryWrapper();
    this.gameModel.on('createEvent', event => {
      if (!event.params || event.params.type) {
        redirect(`/game/${this.state.gid}`, 'Redirecting to old site...');
      }
      this.historyWrapper.setCreateEvent(event);
      this.handleUpdate();
    });
    this.gameModel.on('event', event => {
      if (!event.params || event.params.type) {
        redirect(`/game/${this.state.gid}`, 'Redirecting to old site...');
      }
      this.historyWrapper.addEvent(event);
      this.handleChange();
      this.handleUpdate();
    });
    this.gameModel.attach();
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

  handleToggleChat = () => {
    const toggledMode = this.state.mode === 'game' ? 'chat' : 'game';
    this.setState({ mode: toggledMode });
  }

  handleChat = (username, id, message) => {
    this.gameModel.chat(username, id, message)
  }

  handleUnfocusGame = () => {
    this.chat && this.chat.focus();
  }

  handleUnfocusChat = () => {
    this.gameComponent && this.gameComponent.focus();
  }

  handleUpdate = _.debounce(() => {
    this.forceUpdate();
  }, 0, {
    leading: true,
  });

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
    }
  });

  // ================
  // Render Methods

  renderGame() {
    if (!this.gameModel || !this.gameModel.attached) {
      return;
    }

    const { mobile } = this.state;
    const { id, color } = this.user;
    return (
      <Game
        ref={c => {this.gameComponent = c;}}
        id={id}
        myColor={color}
        historyWrapper={this.historyWrapper}
        gameModel={this.gameModel}
        onUnfocus={this.handleUnfocusGame}
        onChange={this.handleChange}
        onToggleChat={this.handleToggleChat}
        mobile={mobile}
      />
    );
  }

  renderChat() {
    if (!this.gameModel || !this.gameModel.attached) {
      return;
    }

    const { id, color } = this.user;
    return (
      <ChatV2
        ref={c => {this.chat = c;}}
        info={this.game.info}
        data={this.game.chat}
        id={id}
        myColor={color}
        onChat={this.handleChat}
        onUnfocus={this.handleUnfocusChat}
        onToggleChat={this.handleToggleChat}
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
    return (
      <Flex className='room' column grow={1}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Helmet>
          <title>{this.getPuzzleTitle()}</title>
        </Helmet>
        <Nav v2 hidden={this.state.mobile}/>
        <MobilePanel/>
        <Flex className='room--main' grow={1}>
          <Flex column shrink={0}>
            { this.showingGame && this.renderGame() }
          </Flex>
          <Flex grow={1}>
            { this.showingChat && this.renderChat() }
          </Flex>
        </Flex>
      </Flex>
    );
  }
}

