import 'react-flexview/lib/flexView.css'

import React, { Component } from 'react';
import Player from '../components/Player';
import Toolbar from '../components/Toolbar';
import Nav from '../components/Nav';
import _ from 'lodash';
import Flex from 'react-flexview';
import RoomModel from '../store/room';
import GameModel from '../store/game';
import { pure } from '../jsUtils';

const GameLink = pure(({
  onSelectGame,
  info,
  progress,
  createdAt,
  updatedAt,
  gid,
  selectedGid,
}) => (
  <Flex
    grow={1}
    hAlignContent={'center'}
    style={{
      cursor: 'pointer',
      marginTop: 5,
      padding: 5,
      border: '1px solid rgba(0, 0, 0, 0.5)',
      borderRadius: 5,
      overflow: 'auto',
      userSelect: 'none',
    }}
    onClick={(e) => { onSelectGame(gid); }}
  >
    {info.title}
  </Flex>
));

export default class Room extends Component {
  constructor(props) {
    super();
    this.state = {
      rid: undefined,
      gid: undefined,
      showingSidebar: true,
      users: {},
      games: {},
    };
  }

  // lifecycle stuff

  static getDerivedStateFromProps(nextProps, prevState) {
    return {
      ...prevState,
      rid: nextProps.match.params.rid,
      gid: nextProps.match.params.gid,
    };
  }

  initializeRoom() {
    if (this.room) this.room.unload();
    if (this.state.rid === undefined) {
      this.room = undefined;
      return;
    }
    this.room = new RoomModel(`/room/${this.state.rid}`);
    this.room.addListener('games', games => {
      this.setState({ games });
    });
    this.room.addListener('users', users => {
      this.setState({ users });
    });
  }

  initializeGame() {
    if (this.game) this.game.unload();
    if (this.state.rid === undefined) {
      this.game = undefined;
      return;
    }
    this.game = this.room.getGame(this.gid);
    if (this.game) {
      // add listeners
    }
  }

  componentDidMount() {
    this.initializeRoom();
    this.initializeGame();
  }

  componentWillUnmount() {
    if (this.game) this.game.unload();
    if (this.room) this.room.unload();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.rid !== this.state.rid) {
      this.initializeRoom();
    }
    if (prevState.games !== this.state.games ||
      prevState.gameid !== this.state.gameid) {
      this.initializeGame();
    }
  }

  // ================
  // Event Handlers

  handleSelectGame = (gid) => {
    this.props.history.push(`/room/${this.state.rid}/${gid}`);
  }

  handleNewGameClick = (e) => {
    const pid = 2546;
    this.room.createGame(pid, gid => {
      this.handleSelectGame(gid);
    });
  }

  handleToggleShowingSidebar = (e) => {
    const { showingSidebar } = this.state;
    this.setState({
      showingSidebar: !showingSidebar,
    });
  }

  // ================
  // Render Methods

  renderGameLink(game) {
    return (
      <GameLink
        {...game}
        selectedGid={this.state.gid}
        onSelectGame={this.handleSelectGame}
      />
    );
  }

  renderSidebar() {
    const { games } = this.state;
    return (
      <Flex column style={{
        padding: 20,
      }}>
      <div
        style={{
          alignSelf: 'center',
          cursor: 'pointer',
          paddingLeft: 15,
          paddingRight: 15,
          paddingTop: 12,
          paddingBottom: 12,
          color: 'white',
          fontWeight: 500,
          fontSize: 16,
          backgroundColor: '#6AA9F4',
          marginBottom: 5,
        }}
        onClick={this.handleNewGameClick}
      >
        New Game
      </div>
      {_.values(games).map((game, i) => (
        <Flex key={i}>
          {this.renderGameLink(game)}
        </Flex>
      ))}
    </Flex>
    );
  }

  renderSidebarToggler() {
    const {
      showingSidebar,
    } = this.state;
    return (
      <Flex
        vAlignContent='center'
        style={{
          padding: 3,
          backgroundColor: 'rgb(0, 0, 0, 0.02)',
          borderRight: '1px solid rgb(0, 0, 0, 0.5)',
          color: 'rgb(0, 0, 0, 0.7)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={this.handleToggleShowingSidebar}
      >
        {showingSidebar ? '<' : '>'}
      </Flex>
    );
  }

  renderPlayer() {
  }

  render() {
    const {
      showingSidebar,
    } = this.state;
    return (
      <Flex className='room' column grow={1}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Nav/>
        <Flex className='room--main' grow={1}>
          { showingSidebar && (
            <Flex column basis={200}>
              {this.renderSidebar()}
            </Flex>
          )}
          <Flex>
            {this.renderSidebarToggler()}
          </Flex>
          <Flex grow={7}>
            { this.renderPlayer() }
          </Flex>
        </Flex>
      </Flex>
    );
  }
}
