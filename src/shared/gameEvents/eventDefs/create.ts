import {EventDef} from '../types/EventDef';

interface CreateJson {}

const create: EventDef<CreateJson> = {
  reducer(state, event) {
    return state;
  },
};

export default create;
