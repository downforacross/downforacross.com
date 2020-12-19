const pg = require('pg');
// ============= Database Operations ============
function connectPG() {
  return new pg.Pool({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || process.env.USER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
}
exports.connectPG = connectPG;
