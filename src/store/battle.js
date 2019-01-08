import actions from '../actions';
import {db} from './firebase';

import EventEmitter from 'events';
import async from 'async';
import _ from 'lodash';

const STARTING_POWERUPS = _.map(['REVERSE', 'VOWELS', 'DARK_MODE'], (type) => ({type}));
const VALUE_LISTENERS = ['games', 'powerups', 'startedAt', 'players', 'winner'];

export default class Battle extends EventEmitter {
  constructor(path) {
    super();
    this.path = path;
    this.ref = db.ref(path);
  }

  attach() {
    _.forEach(VALUE_LISTENERS, (subpath) => {
      this.ref.child(subpath).on('value', (snapshot) => {
        this.emit(subpath, snapshot.val());
      });
    });
  }

  detach() {
    _.forEach(VALUE_LISTENERS, (subpath) => {
      this.ref.child(subpath).off('value');
    });
  }

  start() {
    this.ref.child('startedAt').set(Date.now());
  }

  setSolved(team) {
    // Obviously this has a race. TODO: Figure out atomicity later...
    this.ref.child('winner').once('value', (snapshot) => {
      if (snapshot.val()) {
        return;
      }

      this.ref.child('winner').set({
        team,
        completedAt: Date.now(),
      });
    });
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
