import 'react-flexview/lib/flexView.css';

import React, {Component} from 'react';
import Flex from 'react-flexview';
import _ from 'lodash';
import Confetti from './Confetti.js';

import * as powerups from '../../lib/powerups';
import Player from '../Player';
import Toolbar from '../Toolbar';
import {toArr} from '../../lib/jsUtils';
import {toHex, darken, GREENISH} from '../../lib/colors';

// component for gameplay -- incl. grid/clues & toolbar
export default class Game extends Component {
  constructor() {
    super();
    this.state = {
      listMode: false,
      pencilMode: false,
      autocheckMode: false,
      screenWidth: 0,
      vimMode: false,
      vimInsert: false,
      colorAttributionMode: false,
    };
  }

  componentDidMount() {
    const screenWidth = window.innerWidth - 1; // this is important for mobile to fit on screen
    // with body { overflow: hidden }, it should disable swipe-to-scroll on iOS safari)
    this.setState({
      screenWidth,
    });
    this.componentDidUpdate({});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.myColor !== this.props.myColor) {
      this.handleUpdateColor(this.props.id, this.props.myColor);
    }
  }

  get rawGame() {
    return this.props.historyWrapper && this.props.historyWrapper.getSnapshot();
  }

  get rawOpponentGame() {
    return this.props.opponentHistoryWrapper && this.props.opponentHistoryWrapper.getSnapshot();
  }

  // TODO: this should be cached, sigh...
  get games() {
    return powerups.apply(
      this.rawGame,
      this.rawOpponentGame,
      this.props.ownPowerups,
      this.props.opponentPowerups
    );
  }

  get game() {
    return this.games.ownGame;
  }

  get opponentGame() {
    return this.games.opponentGame;
  }

  get gameModel() {
    return this.props.gameModel;
  }

  scope(s) {
    if (s === 'square') {
      return this.player.getSelectedSquares();
    }
    if (s === 'word') {
      return this.player.getSelectedAndHighlightedSquares();
    }
    if (s === 'puzzle') {
      return this.player.getAllSquares();
    }
    return [];
  }

  handleUpdateGrid = (r, c, value) => {
    const {id, myColor} = this.props;
    const {pencilMode} = this.state;
    const {autocheckMode} = this.state;
    if (autocheckMode) {
      this.gameModel.updateCellAutocheck(r, c, id, myColor, pencilMode, value);
    } else {
      this.gameModel.updateCell(r, c, id, myColor, pencilMode, value);
    }
    this.props.onChange({isEdit: true});

    this.props.battleModel && this.props.battleModel.checkPickups(r, c, this.rawGame, this.props.team);
  };

  handleUpdateCursor = ({r, c}) => {
    const {id} = this.props;
    if (this.game.solved && !_.find(this.game.cursors, (cursor) => cursor.id === id)) {
      return;
    }
    this.gameModel.updateCursor(r, c, id);
  };

  handleAddPing = ({r, c}) => {
    const {id} = this.props;
    this.gameModel.addPing(r, c, id);
  };

  handleUpdateColor = (id, color) => {
    this.gameModel.updateColor(id, color);
  };

  handleStartClock = () => {
    this.props.gameModel.updateClock('start');
  };

  handlePauseClock = () => {
    this.props.gameModel.updateClock('pause');
  };

  handleResetClock = () => {
    this.props.gameModel.updateClock('reset');
  };

  handleCheck = (scopeString) => {
    const scope = this.scope(scopeString);
    this.props.gameModel.check(scope);
  };

  handleReveal = (scopeString) => {
    const scope = this.scope(scopeString);
    this.props.gameModel.reveal(scope);
    this.props.onChange();
  };

  handleReset = (scopeString) => {
    const scope = this.scope(scopeString);
    this.props.gameModel.reset(scope);
  };

  handleKeybind = (mode) => {
    this.setState({
      vimMode: mode === 'vim',
    });
  };

  handleToggleVimMode = () => {
    this.setState((prevState) => ({
      vimMode: !prevState.vimMode,
    }));
  };

  handleVimInsert = () => {
    this.setState({
      vimInsert: true,
    });
  };

  handleVimNormal = () => {
    this.setState({
      vimInsert: false,
    });
  };

  handleTogglePencil = () => {
    this.setState((prevState) => ({
      pencilMode: !prevState.pencilMode,
    }));
  };

  handleToggleAutocheck = () => {
    this.setState((prevState) => ({
      autocheckMode: !prevState.autocheckMode,
    }));
  };

  handleToggleListView = () => {
    this.setState((prevState) => ({
      listMode: !prevState.listMode,
    }));
  };

  handleToggleChat = () => {
    this.props.onToggleChat();
  };

  handleRefocus = () => {
    this.focus();
  };

  handlePressPeriod = this.handleTogglePencil;

  handlePressEnter = () => {
    this.props.onUnfocus();
  };

  focus() {
    this.player && this.player.focus();
  }

  renderPlayer() {
    const {id, myColor, mobile, beta} = this.props;
    if (!this.game) {
      return <div>Loading...</div>;
    }

    const {
      grid,
      circles,
      shades,
      cursors,
      pings,
      users,
      solved,
      solution,
      themeColor,
      optimisticCounter,
    } = this.game;
    const clues = {
      ...this.game.clues,
    };
    if (window.location.host === 'foracross.com' || window.location.host.includes('.foracross.com')) {
      const dirToHide = window.location.host.includes('down') ? 'across' : 'down';
      clues[dirToHide] = _.assign([], clues[dirToHide]).map((val) => val && '-');
    }
    const opponentGrid = this.opponentGame && this.opponentGame.grid;
    const {screenWidth} = this.state;
    const themeStyles = {
      clueBarStyle: {
        backgroundColor: toHex(themeColor),
      },
      gridStyle: {
        cellStyle: {
          selected: {
            backgroundColor: myColor,
          },
          highlighted: {
            backgroundColor: toHex(darken(themeColor)),
          },
          frozen: {
            backgroundColor: toHex(GREENISH),
          },
        },
      },
    };
    const cols = grid[0].length;
    const rows = grid.length;
    const width = Math.min((35 * 15 * cols) / rows, screenWidth - 20);
    const minSize = this.props.mobile ? 1 : 20;
    const size = Math.max(minSize, width / cols);
    return (
      <Player
        ref={(c) => {
          this.player = c;
        }}
        beta={beta}
        size={size}
        grid={grid}
        solution={solution}
        opponentGrid={opponentGrid}
        circles={circles}
        shades={shades}
        clues={{
          across: toArr(clues.across),
          down: toArr(clues.down),
        }}
        id={id}
        cursors={cursors}
        pings={pings}
        users={users}
        frozen={solved}
        myColor={myColor}
        updateGrid={this.handleUpdateGrid}
        updateCursor={this.handleUpdateCursor}
        addPing={this.handleAddPing}
        onPressEnter={this.handlePressEnter}
        onPressPeriod={this.handlePressPeriod}
        listMode={this.state.listMode}
        vimMode={this.state.vimMode}
        vimInsert={this.state.vimInsert}
        onVimInsert={this.handleVimInsert}
        onVimNormal={this.handleVimNormal}
        colorAttributionMode={this.state.colorAttributionMode}
        mobile={mobile}
        pickups={this.props.pickups}
        optimisticCounter={optimisticCounter}
        onCheck={this.handleCheck}
        onReveal={this.handleReveal}
        {...themeStyles}
      />
    );
  }

  renderToolbar() {
    if (!this.game) return;
    const {clock, solved} = this.game;
    const {mobile} = this.props;
    const {pencilMode, autocheckMode, vimMode, vimInsert, listMode} = this.state;
    const {lastUpdated: startTime, totalTime: pausedTime, paused: isPaused} = clock;
    return (
      <Toolbar
        v2
        gid={this.props.gid}
        mobile={mobile}
        startTime={startTime}
        pausedTime={pausedTime}
        isPaused={isPaused}
        listMode={listMode}
        pencilMode={pencilMode}
        autocheckMode={autocheckMode}
        vimMode={vimMode}
        solved={solved}
        vimInsert={vimInsert}
        onStartClock={this.handleStartClock}
        onPauseClock={this.handlePauseClock}
        onResetClock={this.handleResetClock}
        onCheck={this.handleCheck}
        onReveal={this.handleReveal}
        onReset={this.handleReset}
        onKeybind={this.handleKeybind}
        onTogglePencil={this.handleTogglePencil}
        onToggleVimMode={this.handleToggleVimMode}
        onToggleAutocheck={this.handleToggleAutocheck}
        onToggleListView={this.handleToggleListView}
        onToggleChat={this.handleToggleChat}
        colorAttributionMode={this.state.colorAttributionMode}
        onToggleColorAttributionMode={() => {
          this.setState((prevState) => ({colorAttributionMode: !prevState.colorAttributionMode}));
        }}
        onRefocus={this.handleRefocus}
        unreads={this.props.unreads}
      />
    );
  }

  render() {
    const padding = this.props.mobile ? 0 : 20;
    return (
      <Flex column grow={1}>
        {this.renderToolbar()}
        <Flex
          grow={1}
          style={{
            padding,
          }}
        >
          {this.renderPlayer()}
        </Flex>
        {this.game.solved && <Confetti />}
      </Flex>
    );
  }
}
