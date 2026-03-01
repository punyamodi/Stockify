import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, ToggleButton,
  ToggleButtonGroup, MenuItem, TextField, CircularProgress,
} from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import client from '../../api/client';

const formatCurrency = (val) => `\u20B9${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TIME_RANGES = ['1D', '1W', '1M', '3M', '1Y'];

const POINTS = { '1D': 78, '1W': 7 * 24, '1M': 30, '3M': 90, '1Y': 252 };

function generateOHLCV(basePrice, count) {
  const data = [];
  const volData = [];
  let price = basePrice;
  const now = Date.now();
  const interval = 5 * 60 * 1000;

  for (let i = count; i >= 0; i--) {
    const t = now - i * interval;
    const change = (Math.random() - 0.495) * price * 0.015;
    const open = price;
    price = Math.max(1, price + change);
    const high = Math.max(open, price) * (1 + Math.random() * 0.008);
    const low = Math.min(open, price) * (1 - Math.random() * 0.008);
    data.push({ x: new Date(t), y: [open, high, low, price].map((v) => Number(v.toFixed(2))) });
    volData.push({ x: new Date(t), y: Math.round(10000 + Math.random() * 90000) });
  }
  return { ohlcv: data, volume: volData };
}

export default function StockChart() {
  const [stocks, setStocks] = useState([]);
  const [selected, setSelected] = useState('');
  const [range, setRange] = useState('1M');
  const [chartType, setChartType] = useState('candlestick');
  const [ohlcv, setOhlcv] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    client.get('/stocks')
      .then((res) => {
        const list = res.data?.stocks || res.data || [];
        setStocks(list);
        if (list.length > 0) setSelected(list[0].symbol || list[0]);
      })
      .catch(() => {
        const defaults = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'WIPRO', 'SBIN', 'BAJFINANCE'];
        setStocks(defaults.map((s) => ({ symbol: s })));
        setSelected('RELIANCE');
      });
  }, []);

  const loadChart = useCallback(() => {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      const stockItem = stocks.find((s) => (s.symbol || s) === selected);
      const basePrice = stockItem?.price || stockItem?.currentPrice || (1000 + Math.random() * 2000);
      const count = POINTS[range] || 30;
      const { ohlcv: data, volume } = generateOHLCV(basePrice, count);
      setOhlcv(data);
      setVolumeData(volume);

      const highs = data.map((d) => d.y[1]);
      const lows = data.map((d) => d.y[2]);
      const last = data[data.length - 1];
      const first = data[0];
      setStats({
        open: first.y[0],
        high: Math.max(...highs),
        low: Math.min(...lows),
        close: last.y[3],
        volume: volume.reduce((s, v) => s + v.y, 0),
        change: last.y[3] - first.y[0],
        changePct: ((last.y[3] - first.y[0]) / first.y[0]) * 100,
      });
      setLoading(false);
    }, 300);
  }, [selected, range, stocks]);

  useEffect(() => {
    loadChart();
  }, [loadChart]);

  const candleOptions = {
    chart: { type: chartType, background: 'transparent', toolbar: { show: true, tools: { download: false } }, animations: { enabled: false } },
    xaxis: { type: 'datetime', labels: { style: { colors: '#8899aa' } } },
    yaxis: { labels: { formatter: (v) => `\u20B9${v.toFixed(0)}`, style: { colors: '#8899aa' } } },
    grid: { borderColor: 'rgba(255,255,255,0.06)' },
    plotOptions: {
      candlestick: {
        colors: { upward: '#00c853', downward: '#ff1744' },
        wick: { useFillColor: true },
      },
    },
    stroke: chartType === 'line' ? { curve: 'smooth', width: 2, colors: ['#00d4aa'] } : {},
    tooltip: { theme: 'dark' },
  };

  const volumeOptions = {
    chart: { type: 'bar', background: 'transparent', toolbar: { show: false }, animations: { enabled: false } },
    xaxis: { type: 'datetime', labels: { show: false } },
    yaxis: { labels: { formatter: (v) => `${(v / 1000).toFixed(0)}K`, style: { colors: '#8899aa' } } },
    grid: { borderColor: 'rgba(255,255,255,0.06)' },
    plotOptions: { bar: { columnWidth: '80%' } },
    colors: ['rgba(0,212,170,0.4)'],
    tooltip: { theme: 'dark' },
  };

  const lineSeries = ohlcv.map((d) => ({ x: d.x, y: d.y[3] }));

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Stock Chart</Typography>
        <Typography variant="body2" color="text.secondary">Analyze price movement with professional charts</Typography>
      </Box>

      <Card sx={{ bgcolor: '#131929', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
            <TextField
              select
              label="Select Stock"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              size="small"
              sx={{ minWidth: 180 }}
            >
              {stocks.map((s) => {
                const sym = s.symbol || s;
                return <MenuItem key={sym} value={sym}>{sym}</MenuItem>;
              })}
            </TextField>

            <ToggleButtonGroup
              value={range}
              exclusive
              onChange={(_, v) => { if (v) setRange(v); }}
              size="small"
              sx={{ '& .MuiToggleButton-root': { color: 'text.secondary', borderColor: 'rgba(255,255,255,0.12)', px: 2, '&.Mui-selected': { color: 'primary.main', bgcolor: 'rgba(0,212,170,0.1)' } } }}
            >
              {TIME_RANGES.map((r) => <ToggleButton key={r} value={r}>{r}</ToggleButton>)}
            </ToggleButtonGroup>

            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(_, v) => { if (v) setChartType(v); }}
              size="small"
              sx={{ '& .MuiToggleButton-root': { color: 'text.secondary', borderColor: 'rgba(255,255,255,0.12)', px: 2, '&.Mui-selected': { color: 'primary.main', bgcolor: 'rgba(0,212,170,0.1)' } } }}
            >
              <ToggleButton value="candlestick">Candle</ToggleButton>
              <ToggleButton value="line">Line</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {stats && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { label: 'Open', value: formatCurrency(stats.open) },
                { label: 'High', value: formatCurrency(stats.high), color: '#00c853' },
                { label: 'Low', value: formatCurrency(stats.low), color: '#ff1744' },
                { label: 'Close', value: formatCurrency(stats.close) },
                { label: 'Volume', value: Number(stats.volume).toLocaleString('en-IN') },
                { label: 'Change%', value: `${stats.changePct >= 0 ? '+' : ''}${stats.changePct.toFixed(2)}%`, color: stats.changePct >= 0 ? '#00c853' : '#ff1744' },
              ].map((s) => (
                <Grid item key={s.label}>
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.04)', px: 2, py: 1, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">{s.label}</Typography>
                    <Typography variant="body2" fontWeight={700} color={s.color || 'text.primary'}>{s.value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
          ) : (
            <>
              <ReactApexChart
                key={`${selected}-${range}-${chartType}`}
                options={candleOptions}
                series={[{ name: selected, data: chartType === 'line' ? lineSeries : ohlcv }]}
                type={chartType}
                height={380}
              />
              <ReactApexChart
                key={`vol-${selected}-${range}`}
                options={{ ...volumeOptions, chart: { ...volumeOptions.chart, id: `vol-${selected}` } }}
                series={[{ name: 'Volume', data: volumeData }]}
                type="bar"
                height={100}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
