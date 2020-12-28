/**
 * PuzzleJson: the json format of puzzles stored in the db (both firebase & postgres)
 * Fields are a bit messy & don't correspond perfectly with puzjs formats... see logic in FileUploader.js
 */

export interface PuzzleJson {
  grid: {
    type: 'white' | 'black';
    solution?: string;
  }[][];
  info: {
    type?: string; // this is sometimes set by the frontend, e.g. by the FileUpload module
    title: string;
    author: string;
    copyright: string;
    description: string;
  };
  circles: string[];
  shades: string[];
  clues: {
    across: string[];
    down: string[];
  };
}

export interface PuzzleStatsJson {
  numSolves: number;
}

export interface AddPuzzleRequest {
  puzzle: PuzzleJson;
  isPublic: boolean;
}

export interface AddPuzzleResponse {
  pid: string;
}

export interface ListPuzzleResponse {
  puzzles: {
    pid: string;
    content: PuzzleJson;
    stats: PuzzleStatsJson;
  }[];
}

export interface CreateGameResponse {}

export interface CreateGameRequest {
  gid: string;
  pid: string;
}
