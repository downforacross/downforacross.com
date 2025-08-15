import _ from 'lodash';
import {EventDef} from '../types/EventDef';
import {TEAM_IDS} from '../constants';

export interface RevealAllCluesEvent {
  // no params needed
}

const revealAllClues: EventDef<RevealAllCluesEvent> = {
  reducer(state) {
    if (!state.game) {
      return state;
    }

    const allCluesVisible = {
      across: state.game.clues.across.map(() => true),
      down: state.game.clues.down.map(() => true),
    };

    return {
      ...state,
      game: {
        ...state.game,
        teamClueVisibility: _.fromPairs(
          TEAM_IDS.map(teamId => [teamId, allCluesVisible])
        ),
      },
    };
  },
};

export default revealAllClues;