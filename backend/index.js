require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/auth');
const stockRoutes = require('./src/routes/stocks');
const orderRoutes = require('./src/routes/orders');
const positionRoutes = require('./src/routes/positions');
const watchlistRoutes = require('./src/routes/watchlist');
const userRoutes = require('./src/routes/user');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/user', userRoutes);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const liveStocks = {
  RELIANCE: 2456.75,
  TCS: 3521.40,
  INFY: 1478.20,
  HDFCBANK: 1623.55,
  ICICIBANK: 987.30,
  KOTAKBANK: 1756.85,
  HINDUNILVR: 2634.10,
  ITC: 437.60,
  SBIN: 623.45,
  BHARTIARTL: 1123.70,
  WIPRO: 456.25,
  AXISBANK: 1034.90,
  LT: 3245.60,
  MARUTI: 10234.50,
  BAJFINANCE: 7123.80
};

const stockSymbols = Object.keys(liveStocks);
let stockIndex = 0;

setInterval(() => {
  if (wss.clients.size === 0) return;
  const symbol = stockSymbols[stockIndex % stockSymbols.length];
  stockIndex++;
  const basePrice = liveStocks[symbol];
  const changePercent = (Math.random() - 0.5) * 1.0;
  const change = parseFloat((basePrice * changePercent / 100).toFixed(2));
  const newPrice = parseFloat((basePrice + change).toFixed(2));
  liveStocks[symbol] = newPrice;
  const message = JSON.stringify({
    type: 'PRICE_UPDATE',
    data: {
      symbol,
      price: newPrice,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2))
    }
  });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}, 3000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
