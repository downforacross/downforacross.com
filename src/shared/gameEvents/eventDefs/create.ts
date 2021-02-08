import {GameJson} from '../../types';
import {EventDef} from '../types/EventDef';

export interface CreateEvent {
  pid: string;
  game: GameJson;
}

const create: EventDef<CreateEvent> = {
  reducer(state, event) {
    return {
      loaded: true,
      game: {
        ...state.game,
        pid: event.pid,
        ...event.game,
      },
    };
  },
};

export default create;
