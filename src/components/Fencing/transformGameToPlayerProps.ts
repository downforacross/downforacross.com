/**
 * Perhaps this whole file could live elsewhere, e.g. Player/transformGameToPlayerProps?
 * */
import {CluesJson, GameJson, GridData} from '../../shared/types';
import {CellCoords, CellIndex, Cursor, Ping} from '../Grid/types';
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

export const transformGameToPlayerProps = (
  game: GameJson,
  playerActions: PlayerActions,
  teamId: number
): PlayerProps => ({
  ...playerActions,
  beta: true,
  size: 35,
  grid: teamId ? game.teamGrids[teamId] : game.grid,
  solution: game.solution,
  circles: [],
  shades: [],
  clues: game.clues,
  id: 'null',
  cursors: [], // TODO filter for your teammates' cursors
  pings: [],
  users: null,
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
});
