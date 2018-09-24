import './css/replay.css';

import Replay from './Replay';

export default class ReplaySolo extends Replay {
  historyPath() {
    return `history/solo/${this.props.match.params.uid}/${this.props.match.params.pid}`;
  }
}
