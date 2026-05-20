import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'bot'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import datetime, timedelta
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame
from connection import get_trading_client, get_data_client
from database import get_trade_history, get_open_position
from strategy import get_latest_signal, calculate_signals
from engine import get_bars

load_dotenv()

app = FastAPI(title="Market API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

WATCHLIST = os.getenv('WATCHLIST', 'AAPL,NVDA,MSFT,GOOGL,META').split(',')

@app.get("/account")
def account():
    client = get_trading_client()
    acc = client.get_account()
    return {
        "portfolio_value": float(acc.portfolio_value),
        "buying_power": float(acc.buying_power),
        "cash": float(acc.cash),
        "status": acc.status,
    }

@app.get("/signals")
def signals():
    data = get_data_client()
    result = []
    for symbol in WATCHLIST:
        try:
            df = get_bars(data, symbol)
            signal = get_latest_signal(df)
            signal['symbol'] = symbol
            result.append(signal)
        except Exception as e:
            result.append({'symbol': symbol, 'error': str(e)})
    return result

@app.get("/trades")
def trades(limit: int = 50):
    rows = get_trade_history(limit)
    keys = ['id', 'symbol', 'side', 'qty', 'price', 'stop_loss', 'take_profit', 'order_id', 'status', 'created_at', 'closed_at']
    return [dict(zip(keys, row)) for row in rows]

@app.get("/positions")
def positions():
    client = get_trading_client()
    try:
        pos = client.get_all_positions()
        return [{
            "symbol": p.symbol,
            "qty": p.qty,
            "avg_price": float(p.avg_entry_price),
            "current_price": float(p.current_price),
            "pnl": float(p.unrealized_pl),
            "pnl_pct": float(p.unrealized_plpc) * 100
        } for p in pos]
    except:
        return []

@app.get("/chart/{symbol}")
def chart(symbol: str, days: int = 30):
    import math
    data = get_data_client()
    df = get_bars(data, symbol)
    df = calculate_signals(df).tail(days)
    df['date'] = df['date'].astype(str)
    records = df[['date', 'close', 'ma5', 'ma20', 'rsi', 'signal']].to_dict(orient='records')
    def clean(v):
        if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
            return None
        return v
    return [{k: clean(v) for k, v in r.items()} for r in records]
