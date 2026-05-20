# market.yugakurniawan.com

Stock trading bot + dashboard for US stocks via Alpaca API.

## Structure

```
market.yugakurniawan.com/
├── backend/
│   ├── bot/          # Trading engine (strategy, signals, orders)
│   ├── api/          # FastAPI server (expose data to frontend)
│   └── data/         # SQLite database + logs
├── frontend/
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Dashboard pages
│   │   └── lib/          # API client, helpers
│   └── public/
└── .env.example
```

## Stack
- Backend: Python + FastAPI
- Bot: alpaca-trade-api, pandas, ta-lib
- Frontend: Next.js
- Database: SQLite
- Broker: Alpaca (paper → live)
- Deploy: VPS via Coolify
