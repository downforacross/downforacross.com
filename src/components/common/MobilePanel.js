import React from 'react';
import Flex from 'react-flexview';

// eslint-disable-next-line react/prefer-stateless-function
export default class MobileNav extends React.Component {
  render() {
    const style = {
      position: 'absolute',
      top: '0',
      left: '0',
    };
    return <Flex style={style} />;
  }
}
