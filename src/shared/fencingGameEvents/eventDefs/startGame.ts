import {getTime} from '../../../store/firebase';
import {EventDef} from '../types/EventDef';

export interface StartEvent {}

const start: EventDef<StartEvent> = {
  reducer(state, params, timestamp) {
    return {
      ...state,
      started: true,
      startedAt: timestamp!,
    };
  },
};

export default start;
