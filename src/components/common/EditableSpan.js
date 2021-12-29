import './css/editableSpan.css';
import React, {PureComponent} from 'react';
import _ from 'lodash';
import Caret from '../../lib/caret';

export default class EditableSpan extends PureComponent {
  constructor() {
    super();
    this.span = React.createRef();
    this.prevPosition = 0;
    this.focused = false;
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
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({caret: this.text.length});
    }
  }

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
    const {caret} = this.state;
    let newCaret = caret;
    if (key === '{enter}') {
      this.props.onPressEnter && this.props.onPressEnter();
      return;
    }
    if (key === '{del}') {
      this.text = this.text.substring(0, caret - 1) + this.text.substring(caret);
      newCaret = caret - 1;
    } else {
      this.text = this.text.substring(0, caret) + key + this.text.substring(caret);
      newCaret = caret + 1;
    }
    this.props.onChange(this.text);
    this.setState({caret: newCaret});
  };

  handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      return;
    }
    e.stopPropagation();
    if (e.key === 'Enter' || e.key === 'Escape') {
      this.props.onChange(this.text);
      e.preventDefault();
      setTimeout(() => {
        this.props.onUnfocus && this.props.onUnfocus();
      }, 100);
    }
  };

  handleKeyUp = _.debounce(() => {
    this.props.onChange(this.text);
  }, 500);

  render() {
    const {hidden, style, containerStyle} = this.props;
    if (hidden) return null;

    return (
      <div
        style={{
          display: 'inline-block',
          border: '1px solid #DDDDDD',
          position: 'relative',
          ...containerStyle,
        }}
      >
        <div
          style={style}
          className={`editable-span ${this.props.className || ''}`}
          ref={this.span}
          contentEditable={this.props.mobile ? undefined : true}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleKeyUp}
        />
      </div>
    );
  }
}
