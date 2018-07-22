import './css/replay.css';

import Replay from './Replay'
import redirect from '../redirect';

export default class ReplayV2 extends Replay {
  historyPath() {
    return `game/${this.props.match.params.gid}/events`;
  }

  backupHistoryPath() {
    return `history/${this.gid}`;
  }

  backupUrl() {
    return `/replay/${this.gid}`;
  }
}

