const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  symbol: { type: String, required: true },
  companyName: { type: String, required: true },
  qty: { type: Number, required: true },
  avgPrice: { type: Number, required: true },
  currentPrice: { type: Number, required: true },
  pnl: { type: Number, default: 0 },
  pnlPercent: { type: Number, default: 0 },
  productType: { type: String, enum: ['MIS', 'CNC'], default: 'CNC' },
  side: { type: String, enum: ['LONG', 'SHORT'], default: 'LONG' },
  status: { type: String, enum: ['OPEN', 'CLOSED'], default: 'OPEN' }
}, { timestamps: true });

module.exports = mongoose.model('Position', positionSchema);
