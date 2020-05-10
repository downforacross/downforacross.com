import {Brand} from 'utility-types';

export interface CellStyle {
  backgroundColor: string;
}
export interface CellStyles extends React.CSSProperties {
  selected: CellStyle;
  highlighted: CellStyle;
  frozen: CellStyle;
}

export interface Cursor {
  id: string;
  r: number; // Row in puzzle
  c: number; // Column in puzzle
  timestamp: number;
  color: string;
  active: boolean;
}

export interface Ping extends Cursor {
  age: number;
}

export interface CellData {
  value?: string;
  black?: boolean;
  number?: number;
  revealed?: boolean;
  bad?: boolean;
  good?: boolean;
  pencil?: boolean;
}
export type GridData = CellData[][];

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
