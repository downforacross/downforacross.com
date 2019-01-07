import './css/powerups.css';
import React from 'react';
import Flex from 'react-flexview';

export default class Powerups extends React.Component {
  constructor() {
    super();
  }

  render() {
    return <Flex className="powerups--main" />;
  }
}
