import {GameJson} from '../../types';
import {EventDef} from '../types/EventDef';

export interface CreateEvent {
  pid: string;
  game: GameJson;
}

const create: EventDef<CreateEvent> = {
  reducer(state, params) {
    return {
      ...state,
      loaded: true,
      game: {
        ...state.game,
        pid: params.pid,
        ...params.game,
      },
    };
  },
};

export default create;
