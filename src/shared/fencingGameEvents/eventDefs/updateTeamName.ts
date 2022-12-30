import {EventDef} from '../types/EventDef';

export interface UpdateTeamNameEvent {
  teamId: string;
  teamName: string;
}

const updateTeamName: EventDef<UpdateTeamNameEvent> = {
  reducer(state, {teamId, teamName}) {
    if (!state.teams[teamId]) throw new Error('no team id');
    return {
      ...state,
      teams: {
        ...state.teams,
        [teamId]: {
          ...state.teams[teamId]!,
          name: teamName,
        },
      },
    };
  },
};

export default updateTeamName;
