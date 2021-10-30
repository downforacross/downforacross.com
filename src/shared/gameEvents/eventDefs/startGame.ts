import {EventDef} from '../types/EventDef';

export interface StartEvent {}

const start: EventDef<StartEvent> = {
  reducer(state) {
    return {
      ...state,
      started: true,
    };
  },
};

export default start;
