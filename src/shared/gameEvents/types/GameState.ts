import {GameJson} from '../../types';

export interface GameState {
  loaded: boolean;
  game: null | GameJson;
}
