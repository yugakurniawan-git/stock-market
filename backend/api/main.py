import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'bot'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from connection import get_api
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
    api = get_api()
    acc = api.get_account()
    return {
        "portfolio_value": float(acc.portfolio_value),
        "buying_power": float(acc.buying_power),
        "cash": float(acc.cash),
        "status": acc.status,
    }

@app.get("/signals")
def signals():
    api = get_api()
    result = []
    for symbol in WATCHLIST:
        try:
            df = get_bars(api, symbol)
            data = get_latest_signal(df)
            data['symbol'] = symbol
            result.append(data)
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
    api = get_api()
    try:
        pos = api.list_positions()
        return [{"symbol": p.symbol, "qty": p.qty, "avg_price": float(p.avg_entry_price),
                 "current_price": float(p.current_price), "pnl": float(p.unrealized_pl),
                 "pnl_pct": float(p.unrealized_plpc) * 100} for p in pos]
    except:
        return []

@app.get("/chart/{symbol}")
def chart(symbol: str, days: int = 30):
    api = get_api()
    df = get_bars(api, symbol)
    df = calculate_signals(df).tail(days)
    return df[['date', 'close', 'ma5', 'ma20', 'rsi', 'signal']].to_dict(orient='records')
