import {EventDef} from '../types/EventDef';

export interface UpdateDisplayNameEvent {
  id: string;
  displayName: string;
}

const updateDisplayName: EventDef<UpdateDisplayNameEvent> = {
  reducer(state, {id, displayName}) {
    return {
      ...state,
      users: {
        ...state.users,
        [id]: {
          ...state.users[id],
          id,
          displayName,
        },
      },
    };
  },
};

export default updateDisplayName;
