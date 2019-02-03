import React from 'react';
import Flex from 'react-flexview';
import SimpleKeyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import './css/mobileKeyboard.css';

export default class MobileKeyboard extends React.Component {
  handleKeyPress = (button) => {
    console.log('keypress', button);
    this.props.onKeyDown(button);
  };

  render() {
    return (
      <Flex grow={1}>
        <SimpleKeyboard
          layout={{
            default: ['Q W E R T Y U I O P', 'A S D F G H J K L', '{more} Z X C V B N M {del}'],
            more: ['1 2 3 4 5 6 7 8 9 0', '@ # $ % & * - = +', "{abc} ' , . : / {rebus} {del}"],
          }}
          display={{
            '{del}': '⌫',
            '{more}': '123',
          }}
          onKeyPress={this.handleKeyPress}
        />
      </Flex>
    );
  }
}
