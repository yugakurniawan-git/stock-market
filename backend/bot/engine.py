import time
import os
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv
from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest, TakeProfitRequest, StopLossRequest
from alpaca.trading.enums import OrderSide, TimeInForce, OrderClass
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame
from connection import get_trading_client, get_data_client
from strategy import get_latest_signal
from risk import calculate_qty, stop_loss_price, take_profit_price
from database import save_trade, get_open_position

load_dotenv()

WATCHLIST = os.getenv('WATCHLIST', 'AAPL,NVDA,MSFT,GOOGL,META').split(',')
CHECK_INTERVAL = int(os.getenv('CHECK_INTERVAL', '60'))

def get_bars(data_client: StockHistoricalDataClient, symbol: str) -> pd.DataFrame:
    request = StockBarsRequest(
        symbol_or_symbols=symbol,
        timeframe=TimeFrame.Day,
        start=datetime.now() - timedelta(days=60),
    )
    bars = data_client.get_stock_bars(request).df
    bars = bars.reset_index(level=0, drop=True).reset_index()
    bars.columns = [c.lower() for c in bars.columns]
    bars = bars.rename(columns={'timestamp': 'date'})
    return bars[['date', 'open', 'high', 'low', 'close', 'volume']]

def is_market_open(client: TradingClient) -> bool:
    clock = client.get_clock()
    return clock.is_open

def run():
    trading = get_trading_client()
    data = get_data_client()
    print(f"🤖 Bot started | Watchlist: {', '.join(WATCHLIST)}")

    while True:
        try:
            if not is_market_open(trading):
                print(f"[{datetime.now().strftime('%H:%M')}] Market tutup, tunggu...")
                time.sleep(300)
                continue

            account = trading.get_account()
            buying_power = float(account.buying_power)
            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Buying power: ${buying_power:,.2f}")

            for symbol in WATCHLIST:
                try:
                    df = get_bars(data, symbol)
                    signal_data = get_latest_signal(df)
                    signal = signal_data['signal']
                    price = signal_data['price']

                    print(f"  {symbol}: ${price} | RSI:{signal_data['rsi']} | Signal:{signal}")

                    position = get_open_position(symbol)

                    if signal == 'BUY' and not position:
                        qty = calculate_qty(price, buying_power)
                        sl = stop_loss_price(price)
                        tp = take_profit_price(price)

                        order = trading.submit_order(MarketOrderRequest(
                            symbol=symbol,
                            qty=qty,
                            side=OrderSide.BUY,
                            time_in_force=TimeInForce.DAY,
                            order_class=OrderClass.BRACKET,
                            take_profit=TakeProfitRequest(limit_price=tp),
                            stop_loss=StopLossRequest(stop_price=sl),
                        ))
                        save_trade(symbol, 'BUY', qty, price, sl, tp, str(order.id))
                        print(f"  ✅ BUY {qty}x {symbol} @ ${price} | SL:${sl} TP:${tp}")

                    elif signal == 'SELL' and position:
                        order = trading.submit_order(MarketOrderRequest(
                            symbol=symbol,
                            qty=position['qty'],
                            side=OrderSide.SELL,
                            time_in_force=TimeInForce.DAY,
                        ))
                        save_trade(symbol, 'SELL', position['qty'], price, None, None, str(order.id))
                        print(f"  🔴 SELL {position['qty']}x {symbol} @ ${price}")

                except Exception as e:
                    print(f"  ⚠️ {symbol}: {e}")

        except Exception as e:
            print(f"❌ Error: {e}")

        time.sleep(CHECK_INTERVAL)

if __name__ == '__main__':
    run()
