import crypto from 'crypto';
import {CellCoords} from './types';

type GridRow = {};
export const hashGridRow = (row: GridRow[], misc: object) => {
  return JSON.stringify([row, misc]);
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(row));
  return hash.digest('hex');
};
