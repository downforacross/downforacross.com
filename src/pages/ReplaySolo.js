import './css/replay.css';

import React from 'react';
import Replay from './Replay'

export default class ReplaySolo extends Replay {
    constructor() {
        super();
    }

    historyPath() {
        return `history/solo/${this.props.match.params.uid}/${this.props.match.params.pid}`
    }


}
