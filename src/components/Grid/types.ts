import {Brand} from 'utility-types';
import {CellData, Cursor} from '../../shared/types';

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

export interface CellCoords {
  r: number;
  c: number;
}

export type CellIndex = Brand<number, 'CellIndex'>;
export const toCellIndex = (r: number, c: number, cols: number) => (r * cols + c) as CellIndex;

export type ClueCoords = {
  ori: string;
  num: number;
};

// XXX fixme
export type BattlePickup = any;
