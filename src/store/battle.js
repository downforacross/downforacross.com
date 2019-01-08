import actions from '../actions';
import {db} from './firebase';

import EventEmitter from 'events';
import async from 'async';
import _ from 'lodash';

const STARTING_POWERUPS = _.map(['REVERSE', 'VOWELS', 'DARK_MODE'], (type) => ({type}));

export default class Battle extends EventEmitter {
  constructor(path) {
    super();
    this.path = path;
    this.ref = db.ref(path);
  }

  attach() {
    this.ref.child('games').on('value', (snapshot) => {
      this.emit('games', snapshot.val());
    });
    this.ref.child('powerups').on('value', (snapshot) => {
      this.emit('powerups', snapshot.val());
    });
    this.ref.child('started').on('value', (snapshot) => {
      this.emit('started', snapshot.val());
    });
    this.ref.child('players').on('value', (snapshot) => {
      this.emit('players', snapshot.val());
    });
  }

  detach() {
    this.ref.child('games').off('value');
    this.ref.child('powerups').off('value');
    this.ref.child('started').off('value');
    this.ref.child('players').off('value');
  }

  start() {
    this.ref.child('started').set(true);
  }

  addPlayer(name, team) {
    this.ref.child('players').push({name, team});
  }

  removePlayer(name, team) {
    this.ref.child('players').once('value', (snapshot) => {
      const players = snapshot.val();
      const playerToRemove = _.findKey(players, {name, team});
      this.ref
        .child('players')
        .child(playerToRemove)
        .remove();
    });
  }

  usePowerup(type, team) {
    this.ref.child('powerups').once('value', (snapshot) => {
      const allPowerups = snapshot.val();
      const ownPowerups = allPowerups[team];
      const toUse = _.find(ownPowerups, (powerup) => powerup.type === type && !powerup.used);
      toUse.used = Date.now();
      toUse.target = 1 - team; // For now use on other team.
      this.ref.child('powerups').set(allPowerups);
    });
  }

  initialize(pid, bid, teams = 2) {
    const shiftCbkArg = (fn) => (args, cbk) => fn(args, (val) => cbk(null, val)); // async style fun

    const args = _.map(_.range(teams), (team) => ({
      pid,
      battleData: {bid, team},
    }));

    const powerups = Array(teams).fill(STARTING_POWERUPS);

    async.map(args, shiftCbkArg(actions.createGameForBattle), (err, gids) => {
      this.ref.child('games').set(gids, () => {
        this.ref.child('powerups').set(powerups, () => {
          this.emit('ready');
        });
      });
    });
  }
}
