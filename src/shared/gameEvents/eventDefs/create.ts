import _ from 'lodash';
import {GameJson} from '../../types';
import {EventDef} from '../types/EventDef';
import {TEAM_IDS} from '../constants';

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
        teamGrids: _.fromPairs(TEAM_IDS.map((teamId) => [teamId, params.game.grid])),
      },
    };
  },
};

export default create;
