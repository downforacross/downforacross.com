const _ = require('lodash');
const uuid = require('uuid');
const {pid} = require('process');
const {connectPG} = require('./connectPG');

class PuzzleModel {
  constructor() {
    this.pool = connectPG();
  }

  async listPuzzles(filter, limit, offset) {
    const startTime = Date.now();
    const res = await this.pool.query('SELECT * FROM puzzles ORDER BY pid DESC LIMIT $1 OFFSET $2', [
      limit,
      offset,
    ]);
    const puzzles = res.rows; // TODO omit the clues to save bandwidth
    const ms = Date.now() - startTime;
    console.log(`listPuzzles (${pid}) took ${ms}ms`);
    return puzzles;
  }

  async addPuzzle(puzzle, isPublic = false) {
    await this.pool.connect();

    let pid = uuid.v4().substr(0, 8);
    const uploaded_at = Date.now();
    await this.pool.query(
      `
      INSERT INTO puzzles (pid, uploaded_at, is_public, content)
      VALUES ($1, $2, $3, $4)`,
      [pid, uploaded_at, isPublic, puzzle]
    );
    const ms = Date.now() - startTime;
    console.log(`addEvent(${gid}, ${event.type}) took ${ms}ms`);
    return pid;
  }
}

exports.PuzzleModel = PuzzleModel;
