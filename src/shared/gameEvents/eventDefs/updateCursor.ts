import {CellCoords} from '../../types';
import {EventDef} from '../types/EventDef';

export interface UpdateCursorEvent {
  id: string;
  cell: CellCoords;
}

const updateCursor: EventDef<UpdateCursorEvent> = {
  reducer(state, {id, cell}) {
    if (!state.users[id]) {
      return state; // illegal update if no user exists with id
    }
    return {
      ...state,
      users: {
        ...state.users,
        [id]: {
          ...state.users[id]!,
          cursor: cell,
        },
      },
    };
  },
};

export default updateCursor;
