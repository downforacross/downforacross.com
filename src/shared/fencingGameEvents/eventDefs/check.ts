import _ from 'lodash';
import {CellCoords, GridData} from '../../types';
import {EventDef} from '../types/EventDef';

export interface CheckEvent {
  scope: CellCoords[];
  id: string;
}

/**
 * Handle the "check" event.
 * Preconditions:
 * - params.scope must be "cell"
 * - team must have filled out the cell with a value
 * - cell must not be "good" already
 * Effects:
 * - Case 1: cell.value is correct
 *   - update state.game.grid[r][c] to be { value, good, teamId }
 *   - update teamGrids[*][r][c].good = true, .teamId = teamId
 * - Case 2: cell is wrong
 *   - update the timeout? (skip this step in MVP)
 *   - update teamGrids[teamId][r][c].bad = true
 */
const check: EventDef<CheckEvent> = {
  reducer(state, {scope, id}) {
    const teamId = state.users[id]?.teamId;
    if (!teamId) {
      return state; // illegal update if no user exists with id
    }
    if (scope.length !== 1) {
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
      teamGrid[r][c].good || // if cell is already correct, no need to update
      !teamGrid[r][c].value // if cell is not filled out, cannot check
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
            solvedBy: {id, teamId},
          },
        }),
      });
      return newGrid;
    };

    const updateCellIncorrect = (grid: GridData): GridData => {
      const newGrid = _.assign([], grid, {
        [r]: _.assign([], grid[r], {
          [c]: {
            ...grid[r][c],
            bad: true,
            good: false,
          },
        }),
      });
      return newGrid;
    };

    const isCorrect = state.game.solution[r][c] === teamGrid[r][c].value;
    if (isCorrect) {
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
    }
    return {
      ...state,
      game: {
        ...state.game!,
        teamGrids: {
          ...state.game?.teamGrids,
          [teamId]: updateCellIncorrect(teamGrid),
        },
      },
      users: {
        ...state.users,
        [id]: {
          ...state.users[id],
          misses: (state.users[id].misses || 0) + 1,
        },
      },
      teams: {
        ...state.teams,
        [teamId]: {
          ...state.teams[teamId],
          guesses: state.teams[teamId]!.guesses + 1,
        },
      },
    };
  },
};

export default check;
