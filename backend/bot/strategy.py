import pandas as pd
import ta

def calculate_signals(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df['ma5'] = ta.trend.sma_indicator(df['close'], window=5)
    df['ma20'] = ta.trend.sma_indicator(df['close'], window=20)
    df['rsi'] = ta.momentum.rsi(df['close'], window=14)
    df['macd'] = ta.trend.macd_diff(df['close'])

    df['signal'] = 'HOLD'
    buy = (
        (df['ma5'] > df['ma20']) &
        (df['rsi'] < 65) &
        (df['macd'] > 0)
    )
    sell = (
        (df['ma5'] < df['ma20']) &
        (df['rsi'] > 35) &
        (df['macd'] < 0)
    )
    df.loc[buy, 'signal'] = 'BUY'
    df.loc[sell, 'signal'] = 'SELL'

    return df

def get_latest_signal(df: pd.DataFrame) -> dict:
    df = calculate_signals(df)
    last = df.iloc[-1]
    return {
        'signal': last['signal'],
        'price': round(last['close'], 2),
        'ma5': round(last['ma5'], 2) if pd.notna(last['ma5']) else None,
        'ma20': round(last['ma20'], 2) if pd.notna(last['ma20']) else None,
        'rsi': round(last['rsi'], 2) if pd.notna(last['rsi']) else None,
        'macd': round(last['macd'], 4) if pd.notna(last['macd']) else None,
    }
