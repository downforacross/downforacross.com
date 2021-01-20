import {GameState} from '../../lib/reducers/gameV2';
import {CellIndex, Cursor, GridData, Ping} from '../Grid/types';

interface PlayerProps {
  beta: boolean;
  size: number;
  grid: GridData;
  solution: string[][];
  circles?: CellIndex[];
  shades?: CellIndex[];
  pings?: Ping[];
  cursors: Cursor[];
  clues: {
    across: null;
    down: null;
  };
  id: string;
  users: any;
  frozen: any;
  myColor: any;
  updateGrid: any;
  updateCursor: any;
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

export const transformGameStateToPlayerProps = (gameState: GameState): PlayerProps => ({
  beta: true,
  size: 35,
  grid: gameState.grid,
  solution: gameState.solution,
  circles: [],
  shades: [],
  clues: {
    across: null,
    down: null,
  },
  id: 'null',
  cursors: [],
  pings: [],
  users: null,
  frozen: null,
  myColor: null,
  updateGrid: null,
  updateCursor: null,
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
