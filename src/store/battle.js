import actions from '../actions';
import {db} from './firebase';

import EventEmitter from 'events';
import async from 'async';
import _ from 'lodash';

import powerupData from '../lib/powerups';
import GridObject from '../utils/Grid';
import {PuzzleModel} from '../store';

const STARTING_POWERUPS = 1;
const NUM_PICKUPS = 10;
const VALUE_LISTENERS = ['games', 'powerups', 'startedAt', 'players', 'winner', 'pickups'];

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
      if (toUse) {
        this.emit('usePowerup', toUse);
        toUse.used = Date.now();
        toUse.target = 1 - team; // For now use on other team.
        this.ref.child('powerups').set(allPowerups);
      }
    });
  }

  // TODO: This is going to have races, figure out how to use the game reducer later.
  checkPickups(r, c, game, team) {
    const {grid, solution} = game;
    const gridObj = new GridObject(grid);

    this.ref.child('pickups').once('value', (snapshot1) => {
      const pickups = snapshot1.val();

      this.ref.child('powerups').once('value', (snapshot2) => {
        const powerups = snapshot2.val();

        const pickupIfCorrect = (cells) => {
          const isCorrect = _.every(cells, ({i, j}) => grid[i][j].value === solution[i][j]);
          if (!isCorrect) return;

          _.forEach(pickups, (pickup) => {
            if (pickup.pickedUp) return;
            const {i, j, type} = pickup;
            const foundMatch = _.find(cells, {i, j});
            if (!foundMatch) return;

            pickup.pickedUp = true;
            powerups[team].push({type});
          });
        };

        const {across, down} = gridObj.getCrossingWords(r, c);
        pickupIfCorrect(across);
        pickupIfCorrect(down);

        this.ref.child('pickups').set(pickups);
        this.ref.child('powerups').set(powerups);
      });
    });
  }

  spawnPowerups(n, games, cbk) {
    const possibleLocationsPerGrid = _.map(games, (game) => {
      const {grid, solution} = game;
      const gridObj = new GridObject(grid);
      return gridObj.getPossiblePickupLocations(solution);
    });

    const possibleLocations = _.intersectionWith(...possibleLocationsPerGrid, _.isEqual);
    console.log(possibleLocations, possibleLocationsPerGrid);

    const locations = _.sampleSize(possibleLocations, n);

    const powerupTypes = _.keys(powerupData);
    const pickups = _.map(locations, ({i, j}) => ({i, j, type: _.sample(powerupTypes)}));

    async.map(
      pickups,
      (pickup, cbk) => {
        this.ref.child('pickups').push(pickup, () => cbk());
      },
      () => cbk && cbk()
    );
  }

  initialize(pid, bid, teams = 2) {
    const shiftCbkArg = (fn) => (args, cbk) => fn(args, (val) => cbk(null, val)); // async style fun

    const args = _.map(_.range(teams), (team) => ({
      pid,
      battleData: {bid, team},
    }));

    const powerupTypes = _.keys(powerupData);
    const powerups = _.map(_.range(teams), () =>
      _.map(_.sampleSize(powerupTypes, STARTING_POWERUPS), (type) => ({type}))
    );

    const puzzle = new PuzzleModel(`/puzzle/${pid}`);
    puzzle.attach();
    puzzle.once('ready', () => {
      const rawGame = puzzle.toGame();
      puzzle.detach();

      // Need to wait for all of these to finish otherwise the redirect on emit(ready) kills things.
      async.map(args, shiftCbkArg(actions.createGameForBattle), (err, gids) => {
        this.gids = gids;
        this.ref.child('games').set(gids, () => {
          this.ref.child('powerups').set(powerups, () => {
            this.spawnPowerups(NUM_PICKUPS, [rawGame], () => {
              this.emit('ready');
            });
          });
        });
      });
    });
  }
}
