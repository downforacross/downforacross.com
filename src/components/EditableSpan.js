import './css/editableSpan.css';
import React, { Component } from 'react';
import Caret from '../utils/caret';
import _ from 'lodash';

export default class EditableSpan extends Component {
  constructor() {
    super();
    this.span = React.createRef();
    this.prevPosition = 0;
    this.focused = false;
  }

  startEditing() {
    this.span.current && this.span.current.focus();
  }

  stopEditing() {
    this.props.onBlur && this.props.onBlur();
  }

  handleFocus = () => {
    this.focused = true;
  }

  handleBlur = () => {
    this.focused = false;
  }

  get displayValue() {
    const { value = '(blank)' } = this.props;
    let result = value;
    const nbsp = String.fromCharCode('160');
    while (result.indexOf(' ') !== -1) {
      result = result.replace(' ', nbsp);
    }
    return result;
  }

  get caret() {
    if (!this.focused) return new Caret();
    return new Caret(this.span.current && this.span.current.childNodes[0]);
  }

  componentDidMount() {
    this.text = this.displayValue;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    return {
      start: this.caret.startPosition,
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.value !== this.props.value) {
      this.text = this.displayValue;
      if (snapshot.start !== undefined && snapshot.start !== this.caret.startPosition) {
        this.caret.startPosition = snapshot.start;
      }
    }
  }

  get text() {
    if (this.props.hidden) return '';
    let result = this.span.current.textContent;
    const nbsp = String.fromCharCode('160');
    while (result.indexOf(nbsp) !== -1) {
      result = result.replace(nbsp, ' ');
    }
    return result;
  }

  set text(val) {
    if (this.props.hidden) return;
    if (this.text === val) return;
    // set text while retaining cursor position
    this.span.current.innerHTML = val;
  }

  handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter' || e.key === 'Escape') {
      this.stopEditing();
    }
  }

  handleKeyUp = _.debounce((e) => {
    this.props.onChange(this.text);
  }, 500)

  render() {
    const { hidden } = this.props;
    if (hidden) return null;

    return (
      <div className={'editable-span'}
        ref={this.span}
        contentEditable={true}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}/>
    );
  }
}
