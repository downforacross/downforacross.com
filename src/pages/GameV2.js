import 'react-flexview/lib/flexView.css'

import React, { Component } from 'react';
import Nav from '../components/Nav';
import _ from 'lodash';
import { Helmet } from 'react-helmet';
import Flex from 'react-flexview';

import { GameModel, getUser } from '../store';
import HistoryWrapper from '../utils/historyWrapper';
import Game from '../components/Game';
import ChatV2 from '../components/ChatV2';
import redirect from '../redirect';
import { isMobile } from '../jsUtils';

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
    this.setState({
      mobile: isMobile(),
    });
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

  handleChange = _.debounce(({isEdit = false} = {}) => {
    const game = this.historyWrapper.getSnapshot();
    if (isEdit) {
      this.user.joinGame(this.state.gid, {
        pid: game.pid,
        solved: false,
        v2: true,
      });
    }
    if (game.solved) {
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
        ref={c => {this.game = c;}}
        id={id}
        myColor={color}
        historyWrapper={this.historyWrapper}
        gameModel={this.gameModel}
        onPressEnter={this.handlePressEnter}
        onChange={this.handleChange}
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
        id={id}
        myColor={color}
        historyWrapper={this.historyWrapper}
        gameModel={this.gameModel}
        onPressEnter={this.handlePressEnter}
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

