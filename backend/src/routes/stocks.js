const express = require('express');
const auth = require('../middleware/auth');
const stocks = require('../data/stocks');

const router = express.Router();

router.get('/', auth, (req, res) => {
  const updated = stocks.map(s => {
    const variation = (Math.random() - 0.5) * 0.01;
    const newPrice = parseFloat((s.lastPrice * (1 + variation)).toFixed(2));
    return { ...s, lastPrice: newPrice };
  });
  res.json(updated);
});

router.get('/search', auth, (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const results = stocks.filter(s => s.symbol.toLowerCase().includes(q) || s.companyName.toLowerCase().includes(q));
  res.json(results);
});

router.get('/gainers', auth, (req, res) => {
  const gainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  res.json(gainers);
});

router.get('/losers', auth, (req, res) => {
  const losers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  res.json(losers);
});

router.get('/:symbol', auth, (req, res) => {
  const stock = stocks.find(s => s.symbol === req.params.symbol.toUpperCase());
  if (!stock) return res.status(404).json({ message: 'Stock not found' });
  res.json(stock);
});

module.exports = router;
