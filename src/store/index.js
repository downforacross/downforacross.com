import { offline } from './firebase';
import demoGame from './demoGame';
import demoRoom from './demoRoom';
import demoUser from './demoUser';
import game from './game';
import room from './room';
import user from './user';
import { getUser as _getUser } from './user';
import { getUser as _demoGetUser } from './demoUser';

export const GameModel = offline ? demoGame : game;
export const RoomModel = offline ? demoRoom : room;
export const UserModel = offline ? demoUser : user;

export const getUser = offline ? _demoGetUser : _getUser;
