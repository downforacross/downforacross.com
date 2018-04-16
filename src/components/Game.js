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
    this.state = {
    };
  }

  static getDerivedStateFromProps(props, prevState) {
    return prevState;
  }

  componentDidMount() {
    this.screenWidth = window.innerWidth;
  }

  renderPlayer() {
    const {
      id,
      myColor,
      game,
      onUpdateGrid,
      onUpdateCursor,
      onPressEnter,
    } = this.props;
    if (!game) {
      return (
        <div>
          Select a game
        </div>
      );
    }

    const { grid, circles, shades, cursors, clues, solved, } = game;
    const screenWidth = this.screenWidth;
    let cols = grid[0].length;
    let rows = grid.length;
    const width = Math.min(35 * 15 * cols / rows, screenWidth);
    let size = width / cols;
    return (
      <Player
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
        updateGrid={onUpdateGrid}
        updateCursor={onUpdateCursor}
        onPressEnter={onPressEnter}
        mobile={false}
      />
    );
  }
  render() {
    const { game } = this.props;
    return (
      <Flex column>
        <Toolbar/>
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
