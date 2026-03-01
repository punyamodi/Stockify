const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  symbol: { type: String, required: true },
  companyName: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  orderType: { type: String, enum: ['BUY', 'SELL'], required: true },
  productType: { type: String, enum: ['MIS', 'CNC'], default: 'CNC' },
  priceType: { type: String, enum: ['MARKET', 'LIMIT'], default: 'MARKET' },
  status: { type: String, enum: ['PENDING', 'EXECUTED', 'CANCELLED'], default: 'EXECUTED' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
