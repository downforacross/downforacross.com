/**
 * PuzzleJson: the json object returned by puzjs's PUZtoJSON function
 */

export interface PuzzleJson {
  grid: {
    type: 'white' | 'black';
    solution?: string;
  }[][];
  info: string[];
  circles: string[];
  shades: string[];
  across: string[];
  down: string[];
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
  }[];
}
