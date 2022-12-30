import _ from 'lodash';
import {CellCoords, GridData} from '../../types';
import {EventDef} from '../types/EventDef';

export interface RevealEvent {
  scope: CellCoords[];
  id: string;
}

const reveal: EventDef<RevealEvent> = {
  reducer(state, {scope, id}) {
    const teamId = state.users[id]?.teamId;
    if (!teamId) {
      return state; // illegal update if no user exists with id
    }
    if (scope.length !== 1 || !scope[0]) {
      return state; // illegal update if trying to check more than 1 cell
    }
    const teamGrid = state.game?.teamGrids?.[teamId];
    if (
      !state.game ||
      !teamGrid // illegal update if teamGrid is somehow undefined
    ) {
      return state;
    }
    const [{r, c}] = scope;
    if (
      teamGrid[r][c].good // if cell is already correct, no need to update
    ) {
      return state;
    }

    const updateCellCorrect = (grid: GridData): GridData => {
      const newGrid = _.assign([], grid, {
        [r]: _.assign([], grid[r], {
          [c]: {
            ...grid[r][c],
            value: state.game!.solution[r][c],
            bad: false,
            good: true,
            revealed: true,
            solvedBy: {id, teamId},
          },
        }),
      });
      return newGrid;
    };

    return {
      ...state,
      game: {
        ...state.game!,
        teamClueVisibility: {
          ...state.game.teamClueVisibility,
          [teamId]: {
            across: _.assign(state.game.teamClueVisibility![teamId].across, {
              [teamGrid[r][c].parents!.across]: true,
            }),
            down: _.assign(state.game.teamClueVisibility![teamId].down, {
              [teamGrid[r][c].parents!.down]: true,
            }),
          },
        },
        teamGrids: _.fromPairs(
          _.toPairs(state.game!.teamGrids).map(([tId, tGrid]) => [tId, updateCellCorrect(tGrid)])
        ),
        grid: updateCellCorrect(state.game.grid),
      },
      users: {
        ...state.users,
        [id]: {
          ...state.users[id],
          score: (state.users[id].score || 0) + 1,
        },
      },
      teams: {
        ...state.teams,
        [teamId]: {
          ...state.teams[teamId],
          score: state.teams[teamId]!.score + 1,
        },
      },
    };
  },
};

export default reveal;
