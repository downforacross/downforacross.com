import 'react-flexview/lib/flexView.css'

import React, { Component } from 'react';
import Nav from '../components/Nav';
import _ from 'lodash';
import Flex from 'react-flexview';
import { GameModel } from '../store';
import { getUser } from '../store';
import HistoryWrapper from '../utils/historyWrapper';
import Game from '../components/Game';
import ChatV2 from '../components/ChatV2';
import redirect from '../redirect';

export default class GameV2 extends Component {
  constructor(props) {
    super();
    this.state = {
      gid: undefined,
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
      const id = this.user.id;
      const color = this.user.color;
    });
  }

  initializeGame() {
    if (this.gameModel) this.gameModel.detach();
    this.gameModel = new GameModel(`/game/${this.state.gid}`);
    this.historyWrapper = new HistoryWrapper();
    this.gameModel.addListener('event', event => {
      if (!event.params || event.params.type) {
        redirect(`/game/${this.state.gid}`, 'Redirecting to old site...');
      }
      this.historyWrapper.addEvent(event);
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

  handlePressEnter = (el) => {
    if (el === this.chat) {
      this.game && this.game.focus();
    } else if (el === this.game) {
      this.chat && this.chat.focus();
    }
  }

  handleUpdate = _.debounce(() => {
    this.forceUpdate();
  }, 0, {
    leading: true,
  });

  handleChange = _.debounce(() => {
    const game = this.historyWrapper.getSnapshot();
    if (game.solved) {
      this.user.markSolved(this.state.gid);
    } else {
      this.user.joinGame(this.state.gid, game);
    }
  });

  // ================
  // Render Methods

  renderGame() {
    if (!this.gameModel) {
      return;
    }

    const { id, color } = this.user;
    return (
      <Game
        ref={c => {this.game = c;}}
        id={id}
        myColor={color}
        historyWrapper={this.historyWrapper}
        gameModel={this.gameModel}
        onPressEnter={this.handlePressEnter}
        onChange={this.handleChange}

      />
    );
  }

  renderChat() {
    if (!this.gameModel) {
      return;
    }

    const { id, color } = this.user;
    return (
      <ChatV2
        ref={c => {this.chat = c;}}
        id={id}
        myColor={color}
        historyWrapper={this.historyWrapper}
        gameModel={this.gameModel}
        onPressEnter={this.handlePressEnter}
      />
    );
  }

  render() {
    return (
      <Flex className='room' column grow={1}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Nav v2/>
        <Flex className='room--main' grow={1}>
          <Flex column shrink={0}>
            { this.renderGame() }
          </Flex>
          <Flex grow={1}>
            { this.renderChat() }
          </Flex>
        </Flex>
      </Flex>
    );
  }
}

