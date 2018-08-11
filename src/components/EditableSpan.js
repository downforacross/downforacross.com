import './css/editableSpan.css';
import React, { Component } from 'react';

export default class EditableSpan extends Component {
  constructor() {
    super();
    this.state = {
      editing: false
    };
    this.span = React.createRef();
  }

  startEditing() {
    this.setState({ editing: true}, () => {
      this.refs.input && this.refs.input.focus();
    });
  }

  stopEditing() {
    this.setState({ editing: false});
    this.props.onBlur && this.props.onBlur();
  }

  shouldComponentUpdate(prevProps) {
    return true;
  }

  get text() {
    let result = this.span.current.textContent;
    const nbsp = String.fromCharCode('160');
    while (result.indexOf(nbsp) !== -1) {
      result = result.replace(nbsp, ' ');
    }
    return result;
  }

  handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      this.stopEditing();
    } else {
      this.props.onChange(this.text);
    }
  }

  handleKeyDown = (e) => {
    e.stopPropagation();
  }

  render() {
    const { value = '' } = this.props;
    const { editing } = this.state;
    const displayValue = value === '' ? '(blank)' : value;
    return (
      <span className={'editable-span' + (editing ? ' editing' : '')}
        ref={this.span}
        contentEditable={true}
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}>
        {displayValue}
      </span>
    );

    return (
      <span>{this.state.editing
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
              {!this.props.disabled && <i
                className='fa fa-pencil-square-o'
                onClick={this.startEditing.bind(this)}
                style={{ cursor: 'pointer' }}
              />}
            </span>
          )
      }</span>
    );
  }
}
