import os
from dotenv import load_dotenv
import alpaca_trade_api as tradeapi

load_dotenv()

def get_api():
    return tradeapi.REST(
        os.getenv('ALPACA_API_KEY'),
        os.getenv('ALPACA_SECRET_KEY'),
        base_url=os.getenv('ALPACA_BASE_URL', 'https://paper-api.alpaca.markets'),
        api_version='v2'
    )

def test_connection():
    api = get_api()
    account = api.get_account()
    print(f"Status      : {account.status}")
    print(f"Buying Power: ${float(account.buying_power):,.2f}")
    print(f"Portfolio   : ${float(account.portfolio_value):,.2f}")
    print(f"Cash        : ${float(account.cash):,.2f}")
    return account

if __name__ == '__main__':
    test_connection()
