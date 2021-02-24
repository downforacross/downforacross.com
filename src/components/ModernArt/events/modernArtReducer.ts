import {ModernArtState, ModernArtEvent} from './types';

export const modernArtReducer = (state: ModernArtState, event: ModernArtEvent): ModernArtState => {
  if (event.type === 'start_game') {
    return {
      ...state,
      started: true,
    };
  }
  if (event.type === 'update_name') {
    return {
      ...state,
      users: {
        ...state.users,
        [event.params.id]: {
          name: [event.params.name],
          icon: [event.params.icon],
        },
      },
    };
  }
  return state;
};
