const stocks = [
  { symbol: 'RELIANCE', companyName: 'Reliance Industries Ltd', exchange: 'NSE', sector: 'Energy', lastPrice: 2456.75, open: 2440.00, high: 2478.50, low: 2435.20, close: 2444.30, change: 12.45, changePercent: 0.51, volume: 8234567 },
  { symbol: 'TCS', companyName: 'Tata Consultancy Services Ltd', exchange: 'NSE', sector: 'IT', lastPrice: 3521.40, open: 3498.00, high: 3545.00, low: 3490.25, close: 3510.75, change: 10.65, changePercent: 0.30, volume: 2156789 },
  { symbol: 'INFY', companyName: 'Infosys Ltd', exchange: 'NSE', sector: 'IT', lastPrice: 1478.20, open: 1465.00, high: 1492.30, low: 1460.50, close: 1471.85, change: 6.35, changePercent: 0.43, volume: 5432198 },
  { symbol: 'HDFCBANK', companyName: 'HDFC Bank Ltd', exchange: 'NSE', sector: 'Banking', lastPrice: 1623.55, open: 1610.00, high: 1638.90, low: 1605.30, close: 1618.40, change: 5.15, changePercent: 0.32, volume: 6789012 },
  { symbol: 'ICICIBANK', companyName: 'ICICI Bank Ltd', exchange: 'NSE', sector: 'Banking', lastPrice: 987.30, open: 978.00, high: 995.60, low: 975.40, close: 982.15, change: 5.15, changePercent: 0.52, volume: 9123456 },
  { symbol: 'KOTAKBANK', companyName: 'Kotak Mahindra Bank Ltd', exchange: 'NSE', sector: 'Banking', lastPrice: 1756.85, open: 1742.00, high: 1768.50, low: 1738.20, close: 1750.30, change: 6.55, changePercent: 0.37, volume: 1987654 },
  { symbol: 'HINDUNILVR', companyName: 'Hindustan Unilever Ltd', exchange: 'NSE', sector: 'FMCG', lastPrice: 2634.10, open: 2618.00, high: 2650.75, low: 2610.30, close: 2625.90, change: 8.20, changePercent: 0.31, volume: 1234567 },
  { symbol: 'ITC', companyName: 'ITC Ltd', exchange: 'NSE', sector: 'FMCG', lastPrice: 437.60, open: 433.00, high: 440.85, low: 431.50, close: 435.20, change: 2.40, changePercent: 0.55, volume: 15678901 },
  { symbol: 'SBIN', companyName: 'State Bank of India', exchange: 'NSE', sector: 'Banking', lastPrice: 623.45, open: 618.00, high: 628.90, low: 615.30, close: 620.10, change: 3.35, changePercent: 0.54, volume: 18901234 },
  { symbol: 'BHARTIARTL', companyName: 'Bharti Airtel Ltd', exchange: 'NSE', sector: 'Telecom', lastPrice: 1123.70, open: 1112.00, high: 1132.45, low: 1108.60, close: 1118.35, change: 5.35, changePercent: 0.48, volume: 4567890 },
  { symbol: 'WIPRO', companyName: 'Wipro Ltd', exchange: 'NSE', sector: 'IT', lastPrice: 456.25, open: 451.00, high: 460.80, low: 449.30, close: 453.70, change: 2.55, changePercent: 0.56, volume: 6789012 },
  { symbol: 'AXISBANK', companyName: 'Axis Bank Ltd', exchange: 'NSE', sector: 'Banking', lastPrice: 1034.90, open: 1025.00, high: 1042.60, low: 1021.40, close: 1029.55, change: 5.35, changePercent: 0.52, volume: 7890123 },
  { symbol: 'LT', companyName: 'Larsen and Toubro Ltd', exchange: 'NSE', sector: 'Infrastructure', lastPrice: 3245.60, open: 3220.00, high: 3268.90, low: 3215.50, close: 3238.75, change: 6.85, changePercent: 0.21, volume: 1345678 },
  { symbol: 'MARUTI', companyName: 'Maruti Suzuki India Ltd', exchange: 'NSE', sector: 'Automobile', lastPrice: 10234.50, open: 10150.00, high: 10298.75, low: 10130.25, close: 10198.30, change: 36.20, changePercent: 0.35, volume: 345678 },
  { symbol: 'BAJFINANCE', companyName: 'Bajaj Finance Ltd', exchange: 'NSE', sector: 'Finance', lastPrice: 7123.80, open: 7068.00, high: 7165.50, low: 7050.30, close: 7092.40, change: 31.40, changePercent: 0.44, volume: 987654 },
  { symbol: 'NESTLEIND', companyName: 'Nestle India Ltd', exchange: 'NSE', sector: 'FMCG', lastPrice: 24356.40, open: 24200.00, high: 24480.75, low: 24180.50, close: 24312.80, change: 43.60, changePercent: 0.18, volume: 123456 },
  { symbol: 'TITAN', companyName: 'Titan Company Ltd', exchange: 'NSE', sector: 'Consumer', lastPrice: 3412.65, open: 3385.00, high: 3435.90, low: 3378.40, close: 3398.20, change: 14.45, changePercent: 0.42, volume: 876543 },
  { symbol: 'ULTRACEMCO', companyName: 'UltraTech Cement Ltd', exchange: 'NSE', sector: 'Cement', lastPrice: 9876.30, open: 9810.00, high: 9925.60, low: 9795.40, close: 9845.70, change: 30.60, changePercent: 0.31, volume: 234567 },
  { symbol: 'ASIANPAINT', companyName: 'Asian Paints Ltd', exchange: 'NSE', sector: 'Consumer', lastPrice: 3198.75, open: 3172.00, high: 3220.40, low: 3165.80, close: 3185.30, change: 13.45, changePercent: 0.42, volume: 567890 },
  { symbol: 'TECHM', companyName: 'Tech Mahindra Ltd', exchange: 'NSE', sector: 'IT', lastPrice: 1287.40, open: 1275.00, high: 1298.60, low: 1270.30, close: 1280.95, change: 6.45, changePercent: 0.50, volume: 3456789 }
];

module.exports = stocks;
