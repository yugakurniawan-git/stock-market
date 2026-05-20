import sqlite3
import os
from datetime import datetime

DB_PATH = os.getenv('DATABASE_PATH', 'backend/data/trades.db')

def get_conn():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    return sqlite3.connect(DB_PATH)

def init_db():
    with get_conn() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                side TEXT NOT NULL,
                qty INTEGER NOT NULL,
                price REAL NOT NULL,
                stop_loss REAL,
                take_profit REAL,
                order_id TEXT,
                status TEXT DEFAULT 'open',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                closed_at TEXT
            )
        ''')
        conn.commit()

def save_trade(symbol, side, qty, price, stop_loss, take_profit, order_id):
    with get_conn() as conn:
        if side == 'SELL':
            conn.execute(
                "UPDATE trades SET status='closed', closed_at=? WHERE symbol=? AND status='open'",
                (datetime.now().isoformat(), symbol)
            )
        conn.execute(
            "INSERT INTO trades (symbol, side, qty, price, stop_loss, take_profit, order_id) VALUES (?,?,?,?,?,?,?)",
            (symbol, side, qty, price, stop_loss, take_profit, order_id)
        )
        conn.commit()

def get_open_position(symbol):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM trades WHERE symbol=? AND side='BUY' AND status='open' ORDER BY id DESC LIMIT 1",
            (symbol,)
        ).fetchone()
    if not row:
        return None
    return {'id': row[0], 'symbol': row[1], 'qty': row[3], 'price': row[4]}

def get_trade_history(limit=50):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM trades ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
    return rows

init_db()
