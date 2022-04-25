import {Brand} from 'utility-types';
import {CellData, Cursor} from '../../shared/types';
import {EnhancedCellData} from './Cell';

export interface CellStyle {
  backgroundColor: string;
}
export interface CellStyles extends React.CSSProperties {
  selected: CellStyle;
  highlighted: CellStyle;
  frozen: CellStyle;
}

export interface Ping extends Cursor {
  age: number;
}
export type GridDataWithColor = (CellData & {attributionColor: string})[][];

export type EnhancedGridData = EnhancedCellData[][];

export interface CellCoords {
  r: number;
  c: number;
}

export type ClueCoords = {
  ori: string;
  num: number;
};

// XXX fixme
export type BattlePickup = any;
