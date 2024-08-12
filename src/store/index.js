import {offline} from './firebase';
// eslint-disable-next-line import/no-cycle
import battle from './battle';
import demoGame from './demoGame';
import demoUser, {getUser as _demoGetUser} from './demoUser';
import demoComposition from './demoComposition';
import game from './game';
import user, {getUser as _getUser} from './user';
import puzzle from './puzzle';
import composition from './composition';

export const BattleModel = battle;
export const GameModel = offline ? demoGame : game;
export const UserModel = offline ? demoUser : user;
export const PuzzleModel = puzzle;

export const getUser = offline ? _demoGetUser : _getUser;
export const CompositionModel = offline ? demoComposition : composition;
