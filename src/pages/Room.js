import 'react-flexview/lib/flexView.css';

import React, {Component} from 'react';
import Nav from '../components/common/Nav';
import _ from 'lodash';
import Flex from 'react-flexview';
import {RoomModel, getUser} from '../store';
import HistoryWrapper from '../utils/historyWrapper';
import Game from '../components/Game';
import {pure} from '../jsUtils';

const GameLink = pure(({onSelectGame, info, progress, createdAt, updatedAt, gid, selectedGid}) => (
  <Flex
    grow={1}
    hAlignContent={'center'}
    style={{
      backgroundColor: gid === selectedGid ? '#00DDDD' : 'transparent',
      cursor: 'pointer',
      marginTop: 5,
      padding: 5,
      border: '1px solid rgba(0, 0, 0, 0.5)',
      borderRadius: 5,
      overflow: 'auto',
      userSelect: 'none',
    }}
    onClick={(e) => {
      onSelectGame(gid);
    }}
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
      showingSidebar: false,
      users: {},
      games: {},
    };
    this.initializeUser();
  }

  // lifecycle stuff

  static getDerivedStateFromProps(props, prevState) {
    return {
      ...prevState,
      rid: props.match.params.rid,
      gid: Number(props.match.params.gid),
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

  initializeRoom() {
    if (this.roomModel) this.roomModel.detach();
    if (this.state.rid === undefined) {
      this.roomModel = undefined;
      return;
    }
    this.roomModel = new RoomModel(`/room/${this.state.rid}`);
    this.roomModel.addListener('games', (games) => {
      this.setState({games});
    });
    this.roomModel.addListener('users', (users) => {
      this.setState({users});
    });
    this.roomModel.attach();
  }

  initializeGame() {
    if (this.gameModel) this.gameModel.detach();
    if (this.state.rid === undefined) {
      this.gameModel = undefined;
      return;
    }
    this.gameModel = this.roomModel.getGame(this.state.gid);
    if (this.gameModel) {
      this.historyWrapper = new HistoryWrapper();
      this.gameModel.addListener('event', (event) => {
        this.historyWrapper.addEvent(event);
        this.handleUpdate();
      });
      this.gameModel.attach();
      // add listeners
    }
    this.handleUpdate();
  }

  componentDidMount() {
    this.initializeRoom();
    this.initializeGame();
  }

  componentWillUnmount() {
    if (this.gameModel) this.gameModel.detach();
    if (this.roomModel) this.roomModel.detach();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.rid !== this.state.rid) {
      this.initializeRoom();
    }
    if (prevState.games !== this.state.games || prevState.gid !== this.state.gid) {
      this.initializeGame();
    }
  }

  // ================
  // Event Handlers

  handleSelectGame = (gid) => {
    this.props.history.push(`/room/${this.state.rid}/${gid}`);
  };

  handleNewGameClick = (e) => {
    const pid = 2546;
    this.roomModel.createGame(pid, (gid) => {
      this.handleSelectGame(gid);
    });
  };

  handleToggleShowingSidebar = (e) => {
    e.preventDefault();
    const {showingSidebar} = this.state;
    this.setState({
      showingSidebar: !showingSidebar,
    });
  };

  handlePressEnter = () => {
    // noop for now
  };

  handleUpdate = _.debounce(
    () => {
      this.forceUpdate();
    },
    50,
    {
      leading: true,
    }
  );

  // ================
  // Render Methods

  renderGameLink(game) {
    return <GameLink {...game} selectedGid={this.state.gid} onSelectGame={this.handleSelectGame} />;
  }

  renderSidebar() {
    const {games} = this.state;
    return (
      <Flex column>
        <div
          style={{
            padding: 30,
            paddingTop: 24,
            paddingBottom: 24,
            fontSize: 20,
            fontFamily: 'Helvetica',
            textAlign: 'center',
            color: 'rgb(0, 0, 0)',
            backgroundColor: 'rgb(0, 0, 0, 0.04)',
          }}
        >
          Steven's Lair
        </div>
        <Flex
          column
          style={{
            padding: 20,
          }}
        >
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
              marginBottom: 15,
            }}
            onClick={this.handleNewGameClick}
          >
            New Game
          </div>
          {_.values(games).map((game, i) => (
            <Flex key={i}>{this.renderGameLink(game)}</Flex>
          ))}
        </Flex>
      </Flex>
    );
  }

  renderSidebarToggler() {
    const {showingSidebar} = this.state;
    return (
      <Flex
        vAlignContent="center"
        style={{
          padding: 3,
          backgroundColor: 'rgb(0, 0, 0, 0.04)',
          borderRight: '1px solid rgb(0, 0, 0, 0.5)',
          color: 'rgb(0, 0, 0, 0.7)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        onClick={this.handleToggleShowingSidebar}
      >
        {showingSidebar ? '<' : '>'}
      </Flex>
    );
  }

  renderGame() {
    if (!this.gameModel) {
      return;
    }

    const {id, color} = this.user;
    return (
      <Game
        ref="game"
        id={id}
        myColor={color}
        historyWrapper={this.historyWrapper}
        gameModel={this.gameModel}
        onPressEnter={this.focusChat}
        onUpdateGrid={this.handleUpdateGrid}
        onUpdateCursor={this.handleUpdateCursor}
      />
    );
  }

  render() {
    const {showingSidebar} = this.state;
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
        <Nav />
        <Flex className="room--main" grow={1}>
          {showingSidebar && (
            <Flex column basis={200}>
              {this.renderSidebar()}
            </Flex>
          )}
          <Flex>{/*this.renderSidebarToggler()*/}</Flex>
          <Flex grow={7} column>
            {this.renderGame()}
          </Flex>
        </Flex>
      </Flex>
    );
  }
}
