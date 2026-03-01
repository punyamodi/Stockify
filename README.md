# Stockify

> A full-stack NSE stock trading simulator — real-time prices, portfolio tracking, order management, and advanced charting in a professional dark-themed interface.

![Dashboard](https://github.com/punyamodi/Stockify/assets/68418104/1b4fd8ef-dfdf-497b-86f2-da8a75e6d48b)

![Orders](https://github.com/punyamodi/Stockify/assets/68418104/326bbedd-a4a3-4074-a39e-598fbec6c1d4)

![Positions](https://github.com/punyamodi/Stockify/assets/68418104/565a239a-c30e-40eb-979d-d1ec7bc7cd94)

![Watchlist](https://github.com/punyamodi/Stockify/assets/68418104/88e251da-dc8a-4aaf-9572-65f430a13113)

![Chart](https://github.com/punyamodi/Stockify/assets/68418104/9bca4900-0ea6-4899-8d5f-8f6c7972faa7)

![Account](https://github.com/punyamodi/Stockify/assets/68418104/dda4c8a1-9454-45bf-abe4-9551c97426fa)

![Landing](https://github.com/punyamodi/Stockify/assets/68418104/c37dc143-4dd9-4578-b6cf-3457c3de8f41)

Stockify is a full-stack stock trading platform built with React and Node.js. It provides a complete trading experience with real-time price simulations, portfolio management, order execution, watchlists, and advanced charting — all in a professional dark-themed interface.

## Features

- **Real-time Price Simulation** — WebSocket server broadcasts live NSE stock price updates every 3 seconds with realistic random drift
- **Portfolio Management** — Track holdings, average prices, current value, and P&L across all positions
- **Advanced Charting** — Interactive candlestick and line charts with OHLCV data and multiple timeframes
- **Order Execution** — Place market and limit buy/sell orders with automatic fund management
- **Watchlists** — Build and manage custom watchlists with live price feeds
- **Account Management** — Profile editing, fund deposits, and detailed account statistics
- **JWT Authentication** — Secure login and registration with token-based auth
- **Responsive Design** — Fully responsive dark-themed UI built with Material UI v5

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│                   React 18 + MUI v5                     │
│                                                         │
│  Landing  Auth  Dashboard  Watchlist  Orders            │
│  Positions  Chart  Account                              │
└──────────────┬──────────────────────────────────────────┘
               │  HTTP REST (Axios)
               │  WebSocket (WS)
               ▼
┌─────────────────────────────────────────────────────────┐
│                  Express.js Backend                     │
│                                                         │
│  /api/auth     JWT registration & login                 │
│  /api/stocks   NSE stock data & search                  │
│  /api/orders   Order placement & history                │
│  /api/positions  Portfolio positions                    │
│  /api/watchlist  Watchlist management                   │
│  /api/user     Profile & funds                          │
│                                                         │
│  WebSocket Server — price broadcast every 3s            │
└──────────────┬──────────────────────────────────────────┘
               │  Mongoose ODM
               ▼
┌─────────────────────────────────────────────────────────┐
│               MongoDB Atlas                             │
│  Users  Orders  Positions  Watchlist                    │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Material UI v5 |
| Charting | ApexCharts, react-apexcharts |
| HTTP Client | Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT (jsonwebtoken), bcryptjs |
| Real-time | WebSocket (ws) |
| Validation | express-validator |

## Project Structure

```
Stockify/
├── backend/
│   ├── index.js               Express app + WebSocket server
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── config/
│       │   └── db.js          MongoDB connection
│       ├── data/
│       │   └── stocks.js      20 NSE stocks with base prices
│       ├── middleware/
│       │   └── auth.js        JWT verification middleware
│       ├── models/
│       │   ├── User.js
│       │   ├── Order.js
│       │   ├── Position.js
│       │   └── Watchlist.js
│       └── routes/
│           ├── auth.js        POST /register, POST /login
│           ├── stocks.js      GET /, GET /search, GET /gainers, GET /losers
│           ├── orders.js      GET /, POST /, DELETE /:id
│           ├── positions.js   GET /, POST /:id/exit
│           ├── watchlist.js   GET /, POST /, DELETE /:symbol
│           └── user.js        GET /profile, PUT /profile, GET /funds, POST /funds/add
└── frontend/
    ├── package.json
    ├── .env
    └── src/
        ├── api/
        │   └── client.js      Axios instance with auth interceptor
        ├── context/
        │   └── AuthContext.jsx  Global auth state
        ├── components/
        │   └── Layout/
        │       └── Layout.jsx   Sidebar + AppBar shell
        ├── theme.js             MUI dark theme
        ├── App.jsx              Router + protected routes
        └── pages/
            ├── Landing/         Marketing landing page
            ├── Auth/            Login + Register
            ├── Dashboard/       Portfolio overview + stats
            ├── Watchlist/       Live watchlist management
            ├── Orders/          Order placement + history
            ├── Positions/       Holdings + P&L
            ├── Chart/           Candlestick + line charts
            └── Account/         Profile + funds
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas account (or local MongoDB instance)

### Setup

**1. Clone the repository**

```bash
git clone https://github.com/punyamodi/Stockify.git
cd Stockify
```

**2. Configure the backend**

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

**3. Install backend dependencies**

```bash
cd backend
npm install
npm start
```

The API server starts on `http://localhost:5000`.

**4. Install frontend dependencies**

```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

The React app starts on `http://localhost:3000`.

### Default User Funds

New accounts start with **₹1,00,000** (one lakh INR) of simulated trading funds. Additional funds can be added from the Account page.

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |

### Stocks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocks` | All 20 NSE stocks |
| GET | `/api/stocks/search?q=` | Search by symbol or name |
| GET | `/api/stocks/gainers` | Top 5 gainers |
| GET | `/api/stocks/losers` | Top 5 losers |
| GET | `/api/stocks/:symbol` | Single stock details |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | All user orders |
| POST | `/api/orders` | Place new order |
| DELETE | `/api/orders/:id` | Cancel pending order |

### Positions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/positions` | All open positions |
| POST | `/api/positions/:id/exit` | Exit a position |

### Watchlist

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/watchlist` | User's watchlist |
| POST | `/api/watchlist` | Add stock |
| DELETE | `/api/watchlist/:symbol` | Remove stock |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/funds` | Get available funds |
| POST | `/api/user/funds/add` | Add funds |

## WebSocket Events

Connect to `ws://localhost:5000` to receive real-time price updates.

```json
{
  "type": "PRICE_UPDATE",
  "data": {
    "symbol": "RELIANCE",
    "price": 2461.32,
    "change": 4.57,
    "changePercent": 0.19
  }
}
```

Updates are broadcast every 3 seconds across 15 NSE stocks with realistic price drift.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

## Contact

For questions or feedback, reach out at [modipunya@gmail.com](mailto:modipunya@gmail.com).

## License

MIT License. See [LICENSE](LICENSE) for details.
