import os
from dotenv import load_dotenv
from alpaca.trading.client import TradingClient
from alpaca.data.historical import StockHistoricalDataClient

load_dotenv()

def get_trading_client() -> TradingClient:
    return TradingClient(
        api_key=os.getenv('ALPACA_API_KEY'),
        secret_key=os.getenv('ALPACA_SECRET_KEY'),
        paper=True
    )

def get_data_client() -> StockHistoricalDataClient:
    return StockHistoricalDataClient(
        api_key=os.getenv('ALPACA_API_KEY'),
        secret_key=os.getenv('ALPACA_SECRET_KEY'),
    )

def test_connection():
    client = get_trading_client()
    account = client.get_account()
    print(f"Status      : {account.status}")
    print(f"Buying Power: ${float(account.buying_power):,.2f}")
    print(f"Portfolio   : ${float(account.portfolio_value):,.2f}")
    print(f"Cash        : ${float(account.cash):,.2f}")
    return account

if __name__ == '__main__':
    test_connection()
