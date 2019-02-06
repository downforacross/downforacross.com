import './css/editableSpan.css';
import React, {PureComponent} from 'react';
import Caret from '../utils/caret';
import _ from 'lodash';
import {focusKeyboard, unfocusKeyboard, onUnfocusKeyboard} from './MobileKeyboard';

export default class EditableSpan extends PureComponent {
  constructor() {
    super();
    this.span = React.createRef();
    this.prevPosition = 0;
    this.focused = false;
    this.state = {
      mobileFocused: false,
    };
  }

  componentDidMount() {
    this.text = this.displayValue;
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  getSnapshotBeforeUpdate() {
    return {
      start: this.caret.startPosition,
      focused: this.focused,
    };
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

  focusMobile = () => {
    const shouldCapitalize = this.text.endsWith(' ') || this.text.length === 0;
    const layout = shouldCapitalize ? 'uppercase' : 'lowercase';
    console.log('focusmobile', layout);
    focusKeyboard(this.handleKeyDownMobile, layout);
    this.setState({
      mobileFocused: true,
      caret: this.text.length,
    });
    onUnfocusKeyboard(() => {
      if (this.mounted) {
        this.setState({
          mobileFocused: false,
        });
      }
    });
  };

  focus() {
    this.span.current && this.span.current.focus();
  }

  get displayValue() {
    const {value = '(blank)'} = this.props;
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
    while (result.startsWith(' ')) result = result.substring(1);
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
  };

  handleBlur = () => {
    this.focused = false;
    this.props.onBlur && this.props.onBlur();
  };

  get caret() {
    if (!this.focused) return new Caret();
    return new Caret(this.span.current && this.span.current.childNodes[0]);
  }

  handleKeyDownMobile = (key) => {
    console.log('handle key down', key);
    const {caret} = this.state;
    let newCaret = caret;
    if (key === '{del}') {
      this.text = this.text.substring(0, caret - 1) + this.text.substring(caret);
      newCaret = caret - 1;
    } else {
      this.text = this.text.substring(0, caret) + key + this.text.substring(caret);
      newCaret = caret + 1;
    }
    this.props.onChange(this.text);
    this.setState({caret: newCaret});
    this.focusMobile();
  };

  handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      return;
    }
    e.stopPropagation();
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      this.props.onUnfocus && this.props.onUnfocus();
    }
  };

  handleKeyUp = _.debounce((e) => {
    this.props.onChange(this.text);
  }, 500);

  renderCaret() {
    if (!this.state.mobileFocused) {
      return;
    }
    const text = this.text;
    const caret = this.state.caret;
    return (
      <div
        className={'editable-span ' + (this.props.className || '')}
        style={{width: '100%', position: 'absolute', top: 0, left: 0, ...this.props.style}}
      >
        <span style={{opacity: 0}}>{this.text.substring(0, caret)}</span>
        <span className="editable-span--caret" />
      </div>
    );
  }

  render() {
    const {hidden, style} = this.props;
    if (hidden) return null;

    return (
      <div
        style={{width: '100%', border: '1px solid #DDDDDD', position: 'relative'}}
        onTouchStart={this.focusMobile}
      >
        <div
          style={style}
          className={'editable-span ' + (this.props.className || '')}
          ref={this.span}
          contentEditable={this.props.mobile ? undefined : true}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleKeyUp}
        />
        {this.renderCaret()}
      </div>
    );
  }
}
