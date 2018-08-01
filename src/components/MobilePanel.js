import React  from 'react';
import Flex from 'react-flexview';

export default class MobileNav extends React.Component {
  constructor() {
    super();
    this.state = {
      expanded: false,
    };
  }

  render() {
    const style = {
      position: 'absolute',
      top: '0',
      left: '0',
    };
    return (
      <Flex style={style}>
      </Flex>
    );
  }
}
