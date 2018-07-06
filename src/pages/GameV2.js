import 'react-flexview/lib/flexView.css'

import React, { Component } from 'react';
import Player from '../components/Player';
import Toolbar from '../components/Toolbar';
import Nav from '../components/Nav';
import _ from 'lodash';
import Flex from 'react-flexview';
import { GameModel, UserModel } from '../store';
import { getUser } from '../store';
import HistoryWrapper from '../utils/historyWrapper';
import Game from '../components/Game';
import ChatV2 from '../components/ChatV2';
import { pure } from '../jsUtils';

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
      gid: parseInt(props.match.params.gid),
    };
  }

  initializeUser() {
    this.user = getUser();
    this.user.onAuth(() => {
      const id = this.user.id;
      const color = this.user.color;
      console.log('init user', id, color);
    });
  }

  initializeGame() {
    if (this.gameModel) this.gameModel.detach();
    this.gameModel = new GameModel(`/history/${this.state.gid}`);
    if (this.gameModel) {
      this.historyWrapper = new HistoryWrapper();
      this.gameModel.addListener('event', event => {
        this.historyWrapper.addEvent(event);
        this.handleUpdate();
      });
      this.gameModel.attach();
      // add listeners
    }
    this.handleUpdate();
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

  handlePressEnter = () => {
    // noop for now
  }

  handleUpdate = _.debounce(() => {
    this.forceUpdate();
  }, 50, {
    leading: true,
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
        ref='game'
        id={id}
        myColor={color}
        historyWrapper={this.historyWrapper}
        gameModel={this.gameModel}
        onPressEnter={this.handlePressEnter}

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
        ref='chat'
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
        <Nav/>
        <Flex className='room--main' grow={1}>
          <Flex grow={7} column>
            { this.renderGame() }
          </Flex>
          <Flex>
            { this.renderChat() }
          </Flex>
        </Flex>
      </Flex>
    );
  }
}

