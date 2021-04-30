/**
 * Perhaps this whole file could live elsewhere, e.g. Player/transformGameToPlayerProps?
 * */
import _ from 'lodash';
import {CluesJson, GameJson, Cursor, GridData, UserJson, CellIndex} from '../../shared/types';
import {CellCoords, Ping} from '../Grid/types';
import {PlayerActions} from './usePlayerActions';

interface PlayerProps {
  beta: boolean;
  size: number;
  grid: GridData;
  solution: string[][];
  circles?: CellIndex[];
  shades?: CellIndex[];
  pings?: Ping[];
  cursors: Cursor[];
  clues: CluesJson;
  currentCursor?: Cursor;
  id: string;
  updateCursor(nCursor: CellCoords): void;
  users: any;
  frozen: any;
  myColor: any;
  updateGrid: any;
  addPing: any;
  onPressEnter: any;
  onPressPeriod: any;
  vimMode: any;
  vimInsert: any;
  onVimInsert: any;
  onVimNormal: any;
  mobile: any;
  pickups: any;
  optimisticCounter: any;
}

function applyClueVisibility(vis: {across: boolean[]; down: boolean[]}, clues: CluesJson) {
  return {
    across: clues.across.map((clue, i) => (vis.across[i] ? clue : clue && '')),
    down: clues.down.map((clue, i) => (vis.down[i] ? clue : clue && '')),
  };
}

function applyClueVisibilityToGrid(vis: {across: boolean[]; down: boolean[]}, grid: GridData) {
  return grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      hidden: !!cell.parents && !vis.across[cell.parents!.across] && !vis.down[cell.parents!.down],
    }))
  );
}

export const transformGameToPlayerProps = (
  game: GameJson,
  users: UserJson[],
  playerActions: PlayerActions,
  id: string,
  teamId: number | undefined
): PlayerProps => {
  const clues = teamId ? applyClueVisibility(game.teamClueVisibility![teamId], game.clues) : game.clues;
  const cursors = _.compact(users.map((user) => user.cursor));
  return {
    ...playerActions,
    beta: true,
    size: 35,
    grid: teamId
      ? applyClueVisibilityToGrid(game.teamClueVisibility![teamId], game.teamGrids![teamId])
      : game.grid,
    solution: game.solution,
    circles: game.circles,
    shades: game.shades,
    clues,
    id,
    cursors,
    currentCursor: cursors.find((cursor) => cursor.id === id),
    pings: [],
    users,
    frozen: null,
    myColor: null,
    addPing: null,
    onPressEnter: null,
    onPressPeriod: null,
    vimMode: null,
    vimInsert: null,
    onVimInsert: null,
    onVimNormal: null,
    mobile: null,
    pickups: null,
    optimisticCounter: null,
  };
};
