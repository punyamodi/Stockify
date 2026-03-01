const express = require('express');
const auth = require('../middleware/auth');
const Position = require('../models/Position');
const User = require('../models/User');
const stocks = require('../data/stocks');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const positions = await Position.find({ userId: req.user.userId, status: 'OPEN' });
    const updatedPositions = positions.map(pos => {
      const stock = stocks.find(s => s.symbol === pos.symbol);
      const currentPrice = stock ? stock.lastPrice : pos.currentPrice;
      const pnl = parseFloat(((currentPrice - pos.avgPrice) * pos.qty).toFixed(2));
      const pnlPercent = parseFloat(((currentPrice - pos.avgPrice) / pos.avgPrice * 100).toFixed(2));
      return { ...pos.toObject(), currentPrice, pnl, pnlPercent };
    });
    res.json(updatedPositions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:positionId/exit', auth, async (req, res) => {
  try {
    const position = await Position.findOne({ _id: req.params.positionId, userId: req.user.userId, status: 'OPEN' });
    if (!position) return res.status(404).json({ message: 'Position not found' });
    const stock = stocks.find(s => s.symbol === position.symbol);
    const exitPrice = stock ? stock.lastPrice : position.currentPrice;
    const proceeds = exitPrice * position.qty;
    const user = await User.findOne({ userId: req.user.userId });
    user.availableFunds = parseFloat((user.availableFunds + proceeds).toFixed(2));
    await user.save();
    position.status = 'CLOSED';
    position.currentPrice = exitPrice;
    position.pnl = parseFloat(((exitPrice - position.avgPrice) * position.qty).toFixed(2));
    position.pnlPercent = parseFloat(((exitPrice - position.avgPrice) / position.avgPrice * 100).toFixed(2));
    await position.save();
    res.json({ message: 'Position exited', position });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
