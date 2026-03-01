import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, CircularProgress,
  Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ReactApexChart from 'react-apexcharts';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const formatCurrency = (val) => `\u20B9${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusColors = { EXECUTED: 'success', PENDING: 'warning', CANCELLED: 'error' };

const generatePortfolioData = () => {
  const data = [];
  let val = 250000;
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    val += (Math.random() - 0.45) * 8000;
    data.push({ x: d.getTime(), y: Math.round(val) });
  }
  return data;
};

function StatCard({ title, value, sub, color, icon, loading }) {
  return (
    <Card sx={{ bgcolor: '#131929', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>{title}</Typography>
            {loading ? (
              <CircularProgress size={20} color="primary" />
            ) : (
              <>
                <Typography variant="h5" fontWeight={700} color={color || 'text.primary'}>{value}</Typography>
                {sub && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{sub}</Typography>}
              </>
            )}
          </Box>
          <Box sx={{ bgcolor: 'rgba(0,212,170,0.1)', p: 1.5, borderRadius: 2, color: 'primary.main' }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [funds, setFunds] = useState(null);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [liveData, setLiveData] = useState({});
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);
  const portfolioData = generatePortfolioData();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [fundsRes, posRes, ordersRes] = await Promise.allSettled([
          client.get('/user/funds'),
          client.get('/positions'),
          client.get('/orders'),
        ]);
        if (fundsRes.status === 'fulfilled') setFunds(fundsRes.value.data);
        if (posRes.status === 'fulfilled') setPositions(posRes.value.data?.positions || posRes.value.data || []);
        if (ordersRes.status === 'fulfilled') setOrders((ordersRes.value.data?.orders || ordersRes.value.data || []).slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    fetchAll();

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
    try {
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'PRICE_UPDATE') {
            setLiveData((prev) => ({ ...prev, [msg.data.symbol]: msg.data }));
          }
        } catch {}
      };
    } catch {}

    return () => { if (wsRef.current) wsRef.current.close(); };
  }, []);

  const totalInvested = positions.reduce((s, p) => s + (p.avgPrice * p.qty), 0);
  const currentValue = positions.reduce((s, p) => {
    const cp = liveData[p.symbol]?.price || p.currentPrice || p.avgPrice;
    return s + (cp * p.qty);
  }, 0);
  const totalPnl = currentValue - totalInvested;

  const gainers = [...positions].sort((a, b) => {
    const pa = liveData[a.symbol]?.changePercent || a.changePercent || 0;
    const pb = liveData[b.symbol]?.changePercent || b.changePercent || 0;
    return pb - pa;
  }).slice(0, 5);

  const losers = [...positions].sort((a, b) => {
    const pa = liveData[a.symbol]?.changePercent || a.changePercent || 0;
    const pb = liveData[b.symbol]?.changePercent || b.changePercent || 0;
    return pa - pb;
  }).slice(0, 5);

  const chartOptions = {
    chart: { type: 'area', background: 'transparent', toolbar: { show: false }, sparkline: { enabled: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] } },
    colors: ['#00d4aa'],
    xaxis: { type: 'datetime', labels: { style: { colors: '#8899aa' } } },
    yaxis: { labels: { formatter: (v) => `\u20B9${(v / 1000).toFixed(0)}K`, style: { colors: '#8899aa' } } },
    grid: { borderColor: 'rgba(255,255,255,0.06)' },
    tooltip: { theme: 'dark', x: { format: 'dd MMM' } },
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Welcome back, {user?.fullName?.split(' ')[0] || 'Trader'}</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total Portfolio Value" value={formatCurrency(currentValue)} sub={`Invested: ${formatCurrency(totalInvested)}`} icon={<AccountBalanceWalletIcon />} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Today's P&L" value={formatCurrency(totalPnl)} color={totalPnl >= 0 ? '#00c853' : '#ff1744'} sub={`${totalPnl >= 0 ? '+' : ''}${totalInvested ? ((totalPnl / totalInvested) * 100).toFixed(2) : '0.00'}%`} icon={totalPnl >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Available Funds" value={formatCurrency(funds?.availableFunds || 0)} sub="Usable margin" icon={<AccountBalanceWalletIcon />} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total Positions" value={positions.length} sub={`${orders.length} recent orders`} icon={<ReceiptLongIcon />} loading={loading} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#131929', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Top Movers</Typography>
              {positions.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                  <Typography color="text.secondary">No positions yet</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Symbol</TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Price</TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Change%</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...gainers, ...losers].slice(0, 6).map((p, i) => {
                        const live = liveData[p.symbol];
                        const cp = live?.price || p.currentPrice || p.avgPrice;
                        const pct = live?.changePercent || p.changePercent || 0;
                        return (
                          <TableRow key={`${p.symbol}-${i}`} sx={{ '&:last-child td': { border: 0 } }}>
                            <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 600 }}>{p.symbol}</TableCell>
                            <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{formatCurrency(cp)}</TableCell>
                            <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: pct >= 0 ? '#00c853' : '#ff1744', fontWeight: 600 }}>
                              {pct >= 0 ? '+' : ''}{Number(pct).toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#131929', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={1}>Portfolio Performance</Typography>
              <Typography variant="caption" color="text.secondary">7-day trend</Typography>
              <ReactApexChart
                options={chartOptions}
                series={[{ name: 'Portfolio Value', data: portfolioData }]}
                type="area"
                height={200}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ bgcolor: '#131929' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={3}>Recent Orders</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : orders.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">No orders placed yet</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Date', 'Symbol', 'Type', 'Qty', 'Price', 'Status'].map((h) => (
                      <TableCell key={h} sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 600 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id || order.id} sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'text.secondary' }}>{new Date(order.createdAt || order.date).toLocaleDateString('en-IN')}</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 600 }}>{order.symbol}</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <Chip label={order.orderType} size="small" color={order.orderType === 'BUY' ? 'success' : 'error'} variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{order.qty}</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{formatCurrency(order.price)}</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <Chip label={order.status} size="small" color={statusColors[order.status] || 'default'} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
