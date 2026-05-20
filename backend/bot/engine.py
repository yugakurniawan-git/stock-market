import time
import os
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
from connection import get_api
from strategy import get_latest_signal
from risk import calculate_qty, stop_loss_price, take_profit_price
from database import save_trade, get_open_position

load_dotenv()

WATCHLIST = os.getenv('WATCHLIST', 'AAPL,NVDA,MSFT,GOOGL,META').split(',')
CHECK_INTERVAL = int(os.getenv('CHECK_INTERVAL', '60'))  # detik

def get_bars(api, symbol: str) -> pd.DataFrame:
    bars = api.get_bars(symbol, '1Day', limit=50).df
    bars = bars.reset_index()
    bars.columns = [c.lower() for c in bars.columns]
    if 'timestamp' in bars.columns:
        bars = bars.rename(columns={'timestamp': 'date'})
    return bars[['date', 'open', 'high', 'low', 'close', 'volume']]

def is_market_open(api) -> bool:
    clock = api.get_clock()
    return clock.is_open

def run():
    api = get_api()
    print(f"🤖 Bot started | Watchlist: {', '.join(WATCHLIST)}")

    while True:
        try:
            if not is_market_open(api):
                print(f"[{datetime.now().strftime('%H:%M')}] Market tutup, tunggu...")
                time.sleep(300)
                continue

            account = api.get_account()
            buying_power = float(account.buying_power)
            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Buying power: ${buying_power:,.2f}")

            for symbol in WATCHLIST:
                try:
                    df = get_bars(api, symbol)
                    signal_data = get_latest_signal(df)
                    signal = signal_data['signal']
                    price = signal_data['price']

                    print(f"  {symbol}: ${price} | RSI:{signal_data['rsi']} | Signal:{signal}")

                    position = get_open_position(symbol)

                    if signal == 'BUY' and not position:
                        qty = calculate_qty(price, buying_power)
                        sl = stop_loss_price(price)
                        tp = take_profit_price(price)

                        order = api.submit_order(
                            symbol=symbol,
                            qty=qty,
                            side='buy',
                            type='market',
                            time_in_force='day',
                            order_class='bracket',
                            stop_loss={'stop_price': sl},
                            take_profit={'limit_price': tp}
                        )
                        save_trade(symbol, 'BUY', qty, price, sl, tp, order.id)
                        print(f"  ✅ BUY {qty}x {symbol} @ ${price} | SL:${sl} TP:${tp}")

                    elif signal == 'SELL' and position:
                        order = api.submit_order(
                            symbol=symbol,
                            qty=position['qty'],
                            side='sell',
                            type='market',
                            time_in_force='day'
                        )
                        save_trade(symbol, 'SELL', position['qty'], price, None, None, order.id)
                        print(f"  🔴 SELL {position['qty']}x {symbol} @ ${price}")

                except Exception as e:
                    print(f"  ⚠️ {symbol}: {e}")

        except Exception as e:
            print(f"❌ Error: {e}")

        time.sleep(CHECK_INTERVAL)

if __name__ == '__main__':
    run()
