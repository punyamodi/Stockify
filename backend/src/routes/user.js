const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', auth, async (req, res) => {
  const { fullName, mobile } = req.body;
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (fullName) user.fullName = fullName;
    if (mobile) user.mobile = mobile;
    await user.save();
    res.json({ userId: user.userId, fullName: user.fullName, email: user.email, mobile: user.mobile, availableFunds: user.availableFunds });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/funds', auth, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select('availableFunds');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ availableFunds: user.availableFunds });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/funds/add', auth, async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.availableFunds = parseFloat((user.availableFunds + amount).toFixed(2));
    await user.save();
    res.json({ availableFunds: user.availableFunds });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
