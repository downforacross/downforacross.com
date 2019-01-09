import 'react-flexview/lib/flexView.css';

import React, {Component} from 'react';
import Flex from 'react-flexview';
import _ from 'lodash';

import * as powerups from '../lib/powerups';
import Player from '../components/Player';
import Toolbar from '../components/Toolbar';
import {toArr} from '../jsUtils';

// component for gameplay -- incl. grid/clues & toolbar
export default class GameV2 extends Component {
  constructor() {
    super();
    this.state = {
      pencilMode: false,
      screenWidth: 0,
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

  // TODO: this should be cached, sigh...
  get games() {
    const ownGame = this.props.historyWrapper && this.props.historyWrapper.getSnapshot();
    const opponentGame = this.props.opponentHistoryWrapper && this.props.opponentHistoryWrapper.getSnapshot();
    return powerups.apply(ownGame, opponentGame, this.props.ownPowerups, this.props.opponentPowerups);
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
    } else if (s === 'word') {
      return this.player.getSelectedAndHighlightedSquares();
    } else if (s === 'puzzle') {
      return this.player.getAllSquares();
    } else {
      return [];
    }
  }

  handleUpdateGrid = (r, c, value) => {
    const {id, myColor} = this.props;
    const {pencilMode} = this.state;
    this.gameModel.updateCell(r, c, id, myColor, pencilMode, value);
    this.props.onChange({isEdit: true});
  };

  handleUpdateCursor = ({r, c}) => {
    const {id} = this.props;
    if (this.game.solved && !_.find(this.game.cursors, (cursor) => cursor.id === id)) {
      return;
    }
    this.gameModel.updateCursor(r, c, id);
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

  handleTogglePencil = () => {
    this.setState({
      pencilMode: !this.state.pencilMode,
    });
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
    const {id, myColor, mobile} = this.props;
    if (!this.game) {
      return <div>Loading...</div>;
    }

    const {grid, circles, shades, cursors, colors, clues, solved, solution} = this.game;
    const opponentGrid = this.opponentGame && this.opponentGame.grid;
    const {screenWidth} = this.state;
    let cols = grid[0].length;
    let rows = grid.length;
    const width = Math.min((35 * 15 * cols) / rows, screenWidth);
    let size = width / cols;
    return (
      <Player
        ref={(c) => {
          this.player = c;
        }}
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
        colors={colors}
        frozen={solved}
        myColor={myColor}
        updateGrid={this.handleUpdateGrid}
        updateCursor={this.handleUpdateCursor}
        onPressEnter={this.handlePressEnter}
        onPressPeriod={this.handlePressPeriod}
        mobile={mobile}
        pickups={this.props.pickups}
      />
    );
  }

  renderToolbar() {
    if (!this.game) return;
    const {clock} = this.game;
    const {mobile} = this.props;
    const {pencilMode} = this.state;
    const {lastUpdated: startTime, totalTime: pausedTime, paused: isPaused} = clock;
    return (
      <Toolbar
        v2={true}
        mobile={mobile}
        startTime={startTime}
        pausedTime={pausedTime}
        isPaused={isPaused}
        pencilMode={pencilMode}
        onStartClock={this.handleStartClock}
        onPauseClock={this.handlePauseClock}
        onResetClock={this.handleResetClock}
        onCheck={this.handleCheck}
        onReveal={this.handleReveal}
        onReset={this.handleReset}
        onTogglePencil={this.handleTogglePencil}
        onToggleChat={this.handleToggleChat}
        onRefocus={this.handleRefocus}
        onToggleChat={this.handleToggleChat}
      />
    );
  }

  render() {
    const padding = this.props.mobile ? 0 : 20;
    return (
      <Flex column>
        {this.renderToolbar()}
        <div
          style={{
            padding,
          }}
        >
          {this.renderPlayer()}
        </div>
      </Flex>
    );
  }
}
