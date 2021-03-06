import {CellCoords} from '../../types';
import {EventDef} from '../types/EventDef';

export interface UpdateCursorEvent {
  id: string;
  cell: CellCoords;
  timestamp?: number;
}

const updateCursor: EventDef<UpdateCursorEvent> = {
  reducer(state, {id, cell, timestamp}) {
    if (!state.users[id]) {
      return state; // illegal update if no user exists with id
    }
    return {
      ...state,
      users: {
        ...state.users,
        [id]: {
          ...state.users[id]!,
          cursor: {
            ...cell,
            id,
            timestamp: timestamp!,
          },
        },
      },
    };
  },
};

export default updateCursor;
