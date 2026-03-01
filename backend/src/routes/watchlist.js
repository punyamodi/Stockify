const express = require('express');
const auth = require('../middleware/auth');
const Watchlist = require('../models/Watchlist');
const stocks = require('../data/stocks');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ userId: req.user.userId });
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ message: 'Symbol is required' });
  const stock = stocks.find(s => s.symbol === symbol.toUpperCase());
  if (!stock) return res.status(404).json({ message: 'Stock not found' });
  try {
    const existing = await Watchlist.findOne({ userId: req.user.userId, symbol: symbol.toUpperCase() });
    if (existing) return res.status(400).json({ message: 'Stock already in watchlist' });
    const item = await Watchlist.create({ userId: req.user.userId, symbol: stock.symbol, companyName: stock.companyName });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:symbol', auth, async (req, res) => {
  try {
    const result = await Watchlist.findOneAndDelete({ userId: req.user.userId, symbol: req.params.symbol.toUpperCase() });
    if (!result) return res.status(404).json({ message: 'Stock not found in watchlist' });
    res.json({ message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
