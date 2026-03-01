const express = require('express');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Position = require('../models/Position');
const User = require('../models/User');
const stocks = require('../data/stocks');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  const { symbol, qty, orderType, productType, priceType } = req.body;
  let { price } = req.body;
  if (!qty || qty <= 0) return res.status(400).json({ message: 'Invalid quantity' });
  if (!['BUY', 'SELL'].includes(orderType)) return res.status(400).json({ message: 'Invalid order type' });

  const stock = stocks.find(s => s.symbol === symbol);
  if (!stock) return res.status(404).json({ message: 'Stock not found' });

  if (priceType === 'MARKET' || !price || price <= 0) {
    price = stock.lastPrice;
  }

  try {
    const user = await User.findOne({ userId: req.user.userId });
    const totalCost = qty * price;

    if (orderType === 'BUY') {
      if (user.availableFunds < totalCost) return res.status(400).json({ message: 'Insufficient funds' });
      user.availableFunds = parseFloat((user.availableFunds - totalCost).toFixed(2));
      await user.save();

      const existingPosition = await Position.findOne({ userId: req.user.userId, symbol, status: 'OPEN' });
      if (existingPosition) {
        const totalQty = existingPosition.qty + qty;
        const newAvgPrice = parseFloat(((existingPosition.avgPrice * existingPosition.qty + price * qty) / totalQty).toFixed(2));
        existingPosition.qty = totalQty;
        existingPosition.avgPrice = newAvgPrice;
        existingPosition.currentPrice = price;
        existingPosition.pnl = parseFloat(((price - newAvgPrice) * totalQty).toFixed(2));
        existingPosition.pnlPercent = parseFloat(((price - newAvgPrice) / newAvgPrice * 100).toFixed(2));
        await existingPosition.save();
      } else {
        await Position.create({
          userId: req.user.userId,
          symbol,
          companyName: stock.companyName,
          qty,
          avgPrice: price,
          currentPrice: price,
          pnl: 0,
          pnlPercent: 0,
          productType: productType || 'CNC',
          side: 'LONG',
          status: 'OPEN'
        });
      }
    } else {
      const position = await Position.findOne({ userId: req.user.userId, symbol, status: 'OPEN' });
      if (!position || position.qty < qty) return res.status(400).json({ message: 'Insufficient position quantity' });
      user.availableFunds = parseFloat((user.availableFunds + totalCost).toFixed(2));
      await user.save();
      if (position.qty === qty) {
        position.status = 'CLOSED';
      } else {
        position.qty -= qty;
        position.pnl = parseFloat(((position.currentPrice - position.avgPrice) * position.qty).toFixed(2));
        position.pnlPercent = parseFloat(((position.currentPrice - position.avgPrice) / position.avgPrice * 100).toFixed(2));
      }
      await position.save();
    }

    const order = await Order.create({
      userId: req.user.userId,
      symbol,
      companyName: stock.companyName,
      qty,
      price,
      orderType,
      productType: productType || 'CNC',
      priceType: priceType || 'MARKET',
      status: 'EXECUTED'
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, userId: req.user.userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'PENDING') return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    order.status = 'CANCELLED';
    await order.save();
    res.json({ message: 'Order cancelled', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
