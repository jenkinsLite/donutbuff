const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'orders.db');

let _db;

function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    migrate(_db);
  }
  return _db;
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id    TEXT NOT NULL UNIQUE,
      customer_name  TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      pickup_date TEXT NOT NULL,
      pickup_time TEXT NOT NULL,
      notes       TEXT,
      items_json  TEXT NOT NULL,
      total       REAL NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      stripe_session_id TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

module.exports = { getDb };
