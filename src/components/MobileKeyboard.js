import React from 'react';
import Flex from 'react-flexview';
import SimpleKeyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './css/mobileKeyboard.css';
import _ from 'lodash';

const globalKeyboardState = {
  ref: null,
  callback: null,
  onUnfocusCallback: null,
};

export const focusKeyboard = (callback, layout = 'default') => {
  if (globalKeyboardState.callback !== callback) {
    if (globalKeyboardState.onUnfocusCallback) {
      globalKeyboardState.onUnfocusCallback();
    }
    globalKeyboardState.onUnfocusCallback = null;
    globalKeyboardState.callback = callback;
  }
  globalKeyboardState.ref.setState({
    layout,
    disabled: false,
  });
};

export const unfocusKeyboard = () => {
  console.trace();

  if (globalKeyboardState.onUnfocusCallback) {
    globalKeyboardState.onUnfocusCallback();
  }
  globalKeyboardState.callback = undefined;
  if (globalKeyboardState.ref) {
    globalKeyboardState.ref.setState({
      disabled: true,
    });
  }
};

export const onUnfocusKeyboard = (callback) => {
  globalKeyboardState.onUnfocusCallback = callback;
};

export default class MobileKeyboard extends React.PureComponent {
  constructor(props) {
    super();
    this.state = {
      layout: props.layout || 'default',
    };
  }

  componentDidMount() {
    globalKeyboardState.ref = this;
    console.log('MOUNT');
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    Array.from(document.querySelectorAll('.hg-button')).forEach((el) => {
      if (el.attributes['data-react']) return;
      console.log('killed', el);
      el.ontouchstart = () => {};
    });
  }

  handleTouchStart = (e) => {
    if (!e.target.attributes['data-skbtn']) return;
    const val = e.target.attributes['data-skbtn'].value;
    console.log(val);
    this.handleKeyPress(val);
    e.preventDefault();
    e.stopPropagation();
  };

  handleKeyPress = (button) => {
    const onKeyDown = globalKeyboardState.callback || _.noop;
    if (button === '{del}') {
      onKeyDown('{del}');
    } else if (button === '{more}') {
      this.setState({
        layout: 'more',
      });
    } else if (button === '{abc}') {
      this.setState({
        layout: 'default',
      });
    } else if (button === '{shift}') {
      this.setState({
        layout: {
          uppercase: 'lowercase',
          lowercase: 'uppercase',
        }[this.state.layout],
      });
    } else if (button === '{space}') {
      onKeyDown(' ');
    } else {
      onKeyDown(button);
    }
  };

  render() {
    return (
      <Flex grow={1} onTouchStart={this.handleTouchStart}>
        <SimpleKeyboard
          layout={{
            default: [
              '{x} Q W E R T Y U I O P {x}',
              '{x} A S D F G H J K L {x}',
              '{x} {more} Z X C V B N M {del} {x}',
            ],
            default: ['Q W E R T Y U I O P', 'A S D F G H J K L', '{more} Z X C V B N M {del}'],
            uppercase: [
              'Q W E R T Y U I O P',
              'A S D F G H J K L',
              ': Z X C V B N M #',
              '{shift} {emoji} {space} , . {del}',
            ],
            lowercase: [
              'q w e r t y u i o p',
              'a s d f g h j k l',
              ': z x c v b n m #',
              '{shift} {emoji} {space} , . {del}',
            ],
            more: ['1 2 3 4 5 6 7 8 9 0', '@ # $ % & * - = +', "{abc} ' , . : / {rebus} {del}"],
          }}
          display={{
            '{shift}': '⇧',
            '{del}': '⌫',
            '{more}': '123',
            '{abc}': 'ABC',
            '{rebus}': '{}',
            '{emoji}': ' ',
          }}
          useTouchEvents={true}
          layoutName={this.state.layout}
        />
      </Flex>
    );
  }
}
