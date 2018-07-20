import './css/replay.css';

import React from 'react';
import Replay from './Replay'

export default class ReplayV2 extends Replay {
  constructor() {
    super();
  }

  historyPath() {
    return `game/${this.props.match.params.gid}`;
  }


}

