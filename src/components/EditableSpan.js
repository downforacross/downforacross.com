import './css/editableSpan.css';
import React, { PureComponent } from 'react';
import Caret from '../utils/caret';
import _ from 'lodash';

export default class EditableSpan extends PureComponent {
  constructor() {
    super();
    this.span = React.createRef();
    this.prevPosition = 0;
    this.focused = false;
  }
  componentDidMount() {
    this.text = this.displayValue;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    return {
      start: this.caret.startPosition,
      focused: this.focused,
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.key_ !== this.props.key_ || !this.focused) {
      this.text = this.displayValue;
      if (snapshot.start !== undefined && snapshot.start !== this.caret.startPosition) {
        this.caret.startPosition = snapshot.start;
      }
      if (snapshot.focused) this.focus();
    }
  }

  focus() {
    this.span.current && this.span.current.focus();
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

  get text() {
    if (this.props.hidden) return '';
    if (!this.span.current) return '';
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

  handleFocus = () => {
    this.focused = true;
  }

  handleBlur = () => {
    this.focused = false;
  }

  get caret() {
    if (!this.focused) return new Caret();
    return new Caret(this.span.current && this.span.current.childNodes[0]);
  }

  handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      return;
    }
    e.stopPropagation();
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      this.props.onUnfocus();
    }
  }

  handleKeyUp = _.debounce((e) => {
    this.props.onChange(this.text);
  }, 500)

  render() {
    const { hidden } = this.props;
    if (hidden) return null;

    return (
      <div className={'editable-span ' + (this.props.className || '')}
        ref={this.span}
        contentEditable={true}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}/>
    );
  }
}
