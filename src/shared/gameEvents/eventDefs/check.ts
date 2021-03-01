import {stat} from 'fs';
import _ from 'lodash';
import {CellCoords} from '../../types';
import {EventDef} from '../types/EventDef';

export interface UpdateCellEvent {
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
const updateCell: EventDef<UpdateCellEvent> = {
  reducer(state, {scope, id}) {
    const teamId = state.users[id]?.teamId;
    if (!teamId) {
      return state; // illegal update if no user exists with id
    }
    if (scope.length !== 1) {
      return state; // illegal update if trying to check more than 1 cell
    }
    const grid = state.game?.teamGrids[teamId];
    const solution = state.game?.solution;
    if (
      !grid || // illegal update if grid is somehow undefined
      !solution // illegal update if solution is somehow undefined
    ) {
      return state;
    }
    const [{r, c}] = scope;
    if (
      grid[r][c].good || // if cell is already correct, no need to update
      !grid[r][c].value // if cell is not filled out, cannot check
    ) {
      return state;
    }

    if (solution[r][c] === grid[r][c].value) {
      const newGrid = _.assign([], grid, {
        [r]: _.assign([], grid[r], {
          [c]: {
            ...grid[r][c],
            bad: false,
            good: true,
          },
        }),
      });
      return {
        ...state,
        game: {
          ...state.game!,
          teamGrids: {
            ...state.game?.teamGrids,
            [teamId]: newGrid,
          },
        },
      };
    } else {
      const newGrid = _.assign([], grid, {
        [r]: _.assign([], grid[r], {
          [c]: {
            ...grid[r][c],
            bad: true,
          },
        }),
      });
      return {
        ...state,
        game: {
          ...state.game!,
          teamGrids: {
            ...state.game?.teamGrids,
            [teamId]: newGrid,
          },
        },
      };
    }
  },
};

export default updateCell;
