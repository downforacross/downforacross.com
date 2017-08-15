import React, { Component } from 'react';
import './actionMenu.css';

/*
 * Summary of ActionMenu component
 *
 * Props: { grid, clues }
 *
 * State: { selected, direction }
 *
 * Children: [ GridControls, Grid, Clues ]
 * - GridControls.props:
 *   - attributes: { selected, direction, grid, clues }
 *   - callbacks: { setSelected, setDirection }
 * - Grid.props:
 *   - attributes: { grid, selected, direction }
 *   - callbacks: { setSelected, changeDirection }
 * - Clues.props:
 *   - attributes: { getClueList() }
 *   - callbacks: { selectClue }
 *
 * Potential parents (so far):
 * - Toolbar
 **/


export default class ActionMenu extends Component {
  constructor() {
    super();
    this.state = {
      active: false
    };
  }

  onClick() {
    this.setState({active: !this.state.active});
  }

  onBlur() {
    this.setState({active: false});
  }

  render() {
    return (
      <div
        className={ (this.state.active ? 'active ' : '') + 'action-menu'}
        onBlur={this.onBlur.bind(this)}>
        <button
          className='action-menu--button'
          onClick={this.onClick.bind(this)} >
          {this.props.label}
        </button>
        <div className='action-menu--list'>
          {Object.keys(this.props.actions).map((key, i) => (
              <div
                key={i}
                className='action-menu--list--action'
                onClick={
                  this.props.actions[key]
                } >
                <span> {key} </span>
              </div>
          ))}
        </div>
      </div>
    );
  }
};
