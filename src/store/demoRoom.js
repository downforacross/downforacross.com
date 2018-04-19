import Room from './room';
import DemoGame from './demoGame';
import { makeGame } from '../gameUtils';
import { db, SERVER_TIME } from './firebase';
import EventEmitter from 'events';

export default class DemoRoom extends EventEmitter {
  constructor(path) {
    super();
    this.path = path;
    this.ref = db.ref(path);
  }

  attach() {
    this.emit('games', [
      {
        gid: 1,
        info: {
          title: 'demo game',
        },
      },
      {
        gid: 2,
        info: {
          title: 'demo game 2',
        },
      },
    ]);
  }

  detach() {
    this.ref.child('games').off('value');
    this.ref.child('users').off('value');
  }

  listGames() {
  }

  sendChatMessage(uid, msg) {
    this.ref.child('chat').push({
      uid,
      msg,
    });
  }

  tickUser(uid) {
    this.ref.child('users').child(uid)
      .set({
        lastActive: SERVER_TIME,
      });
  }

  getGame(gid) {
    return new DemoGame(`${this.path}/history/${gid}`);
  }

  createGame(pid, cbk) {
    const puzzleRef = db.ref(`/puzzle/${pid}`);
    const gamesRef = this.ref.child('games');
    puzzleRef.once('value', snapshot => {

      gamesRef.once('value', gamesSnapshot => {
        const gid = gamesSnapshot.numChildren() + 1;
        const puzzle = snapshot.val();
        const game = new DemoGame(
          `${this.path}/history/${gid}`,
          {
            events: false,
          }
        );
        game.initialize(
          makeGame('', '', puzzle)
        );
        gamesRef.child(gid).set({
          gid,
          info: puzzle.info,
          progress: 0,
          solved: false,
          createdAt: SERVER_TIME,
          updatedAt: SERVER_TIME,
        });
        if (cbk) {
          cbk(gid);
        }
      });
    });
  }
};


