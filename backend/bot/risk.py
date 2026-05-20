import os

STOP_LOSS_PCT = float(os.getenv('STOP_LOSS_PCT', '0.03'))      # 3%
TAKE_PROFIT_PCT = float(os.getenv('TAKE_PROFIT_PCT', '0.08'))  # 8%
MAX_PER_TRADE = float(os.getenv('MAX_PER_TRADE', '50'))        # $50 per trade

def calculate_qty(price: float, buying_power: float) -> int:
    budget = min(MAX_PER_TRADE, buying_power * 0.1)
    qty = int(budget // price)
    return max(qty, 1)

def stop_loss_price(entry_price: float) -> float:
    return round(entry_price * (1 - STOP_LOSS_PCT), 2)

def take_profit_price(entry_price: float) -> float:
    return round(entry_price * (1 + TAKE_PROFIT_PCT), 2)
