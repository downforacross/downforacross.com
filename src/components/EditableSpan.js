import './css/create.css';
import React, { Component } from 'react';

export default class EditableSpan extends Component {
  constructor() {
    super();
    console.log('new EditableSpan');
    this.state = {
      editing: false
    };
  }

  startEditing() {
    console.log('start editing');
    this.setState({ editing: true}, () => {
      this.refs.input && this.refs.input.focus();
    });
  }

  stopEditing() {
    console.log('stop editing');
    this.setState({ editing: false});
    this.props.onBlur && this.props.onBlur();
  }

  shouldComponentUpdate(prevProps) {
    return true;
  }

  render() {
    console.log('render', this.state.editing);
    return this.state.editing
      ? (
        <span className='editable-span on'>
          <input
            ref='input'
            className='text'
            value={this.props.value}
            onChange={(e) => this.props.onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                this.stopEditing();
              }
            }}
            size={this.props.value.length + 2 }
          />
          <i
            className='fa fa-check-square-o'
            onClick={this.stopEditing.bind(this)}
            style={{ cursor: 'pointer' }}
          />
        </span>
      )
      : (
        <span className='editable-span off'>
          <span className='text'>
            {this.props.value}
          </span>
          <i
            className='fa fa-pencil-square-o'
            onClick={this.startEditing.bind(this)}
            style={{ cursor: 'pointer' }}
          />
        </span>
      );
  }
}
