import 'react-flexview/lib/flexView.css'

import React, { Component } from 'react';
import Flex from 'react-flexview';

import Player from '../components/Player';
import Toolbar from '../components/Toolbar';
import { toArr } from '../jsUtils';
import _ from 'lodash';

// component for gameplay -- incl. grid/clues & toolbar
export default class GameV2 extends Component {
  constructor() {
    super();
    this.screenWidth = 0;
    this.state = {
      pencilMode: false,
    };
  }

  componentDidMount() {
    this.screenWidth = window.innerWidth;
  }

  get game() {
    if (!this.props.historyWrapper) return;
    return this.props.historyWrapper.getSnapshot();
  }

  get gameModel() {
    return this.props.gameModel;
  }

  scope(s) {
    if (s === 'square') {
      return this.refs.player.getSelectedSquares();
    } else if (s === 'word') {
      return this.refs.player.getSelectedAndHighlightedSquares();
    } else if (s === 'puzzle') {
      return this.refs.player.getAllSquares();
    } else {
      return [];
    }
  }


  handleUpdateGrid = (r, c, value) => {
    const { id, myColor } = this.props;
    const { pencilMode } = this.state;
    this.gameModel.updateCell(r, c, id, myColor, pencilMode, value);
  }

  handleUpdateCursor = ({r, c}) => {
    const { id, myColor } = this.props;
    this.gameModel.updateCursor(r, c, id, myColor);
  }

  handleStartClock = () => {
    this.props.gameModel.updateClock('start');
  }

  handlePauseClock = () => {
    this.props.gameModel.updateClock('pause');
  }

  handleResetClock = () => {
    this.props.gameModel.updateClock('reset');
  }

  handleCheck = (scopeString) => {
    const scope = this.scope(scopeString);
    this.props.gameModel.check(scope);
  }

  handleReveal = (scopeString) => {
    const scope = this.scope(scopeString);
    this.props.gameModel.reveal(scope);
  }


  handleReset = (scopeString) => {
    const scope = this.scope(scopeString);
    this.props.gameModel.reset(scope);
  }

  handleTogglePencil = () => {
    this.setState({
      pencilMode: !this.state.pencilMode,
    });
  }

  renderPlayer() {
    const {
      id,
      myColor,
      onPressEnter,
    } = this.props;
    if (!this.game) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    const { grid, circles, shades, cursors, clues, solved, } = this.game;
    const screenWidth = this.screenWidth;
    let cols = grid[0].length;
    let rows = grid.length;
    const width = Math.min(35 * 15 * cols / rows, screenWidth);
    let size = width / cols;
    return (
      <Player
        ref='player'
        size={size}
        grid={grid}
        circles={circles}
        shades={shades}
        clues={{
          across: toArr(clues.across),
          down: toArr(clues.down)
        }}
        id={id}
        cursors={cursors}
        frozen={solved}
        myColor={myColor}
        updateGrid={this.handleUpdateGrid}
        updateCursor={this.handleUpdateCursor}
        onPressEnter={onPressEnter}
        mobile={false}
      />
    );
  }

  renderToolbar() {
    if (!this.game) return;
    const { clock } = this.game;
    const { pencilMode } = this.state;
    const {
      lastUpdated: startTime,
      totalTime: pausedTime,
      paused: isPaused,
    } = clock;
    return (
      <Toolbar
        mobile={false}
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
      />
    );
  }

  render() {
    return (
      <Flex column>
        {this.renderToolbar()}
        <div
          style={{
            padding: 20,
          }}>
          {this.renderPlayer()}
        </div>
      </Flex>
    );
  }
}
