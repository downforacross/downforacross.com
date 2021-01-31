import './css/ActionMenu.css';
import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';

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
 * */

export default class ActionMenu extends Component {
  containerRef = React.createRef();

  constructor() {
    super();
    this.state = {
      active: false,
    };
  }

  handlePointerDown = (e) => {
    // eslint-disable-next-line react/no-find-dom-node
    const refNode = findDOMNode(this.containerRef.current);
    if (refNode?.contains(e.target)) {
      return;
    }
    this.setState({active: false});
  };

  onClick() {
    this.setState(
      (prevState) => ({active: !prevState.active}),
      () => {
        if (this.state.active) {
          window.addEventListener('pointerdown', this.handlePointerDown);
        } else {
          window.removeEventListener('pointerdown', this.handlePointerDown);
        }
      }
    );
  }

  onBlur() {
    this.setState({active: false});
    this.props.onBlur();
  }

  render() {
    return (
      <div
        ref={this.containerRef}
        className={`${this.state.active ? 'active ' : ''}action-menu`}
        onBlur={this.onBlur.bind(this)}
      >
        <button
          tabIndex={-1}
          className="action-menu--button"
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onClick={this.onClick.bind(this)}
        >
          {this.props.label}
        </button>
        <div className="action-menu--list">
          {Object.keys(this.props.actions).map((key, i) => (
            <div
              key={i}
              className="action-menu--list--action"
              onMouseDown={(ev) => {
                ev.preventDefault();
                this.props.actions[key]();
                this.onBlur();
                this.setState({active: false});
              }}
              onTouchStart={(ev) => {
                ev.preventDefault();
                this.props.actions[key]();
                this.onBlur();
                this.setState({active: false});
              }}
            >
              <span> 
                {' '}
                {key}
                {' '}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
