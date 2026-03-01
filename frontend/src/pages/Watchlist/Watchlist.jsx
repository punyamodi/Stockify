import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Chip, InputAdornment, Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import client from '../../api/client';

const formatCurrency = (val) => `\u20B9${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState({});
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [removeLoading, setRemoveLoading] = useState('');
  const wsRef = useRef(null);

  const fetchWatchlist = async () => {
    try {
      const res = await client.get('/watchlist');
      setWatchlist(res.data?.watchlist || res.data || []);
    } catch {
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();

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

  const handleAdd = async () => {
    if (!newSymbol.trim()) return;
    setAdding(true);
    setError('');
    try {
      await client.post('/watchlist', { symbol: newSymbol.trim().toUpperCase() });
      await fetchWatchlist();
      setDialogOpen(false);
      setNewSymbol('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add stock.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (symbol) => {
    setRemoveLoading(symbol);
    try {
      await client.delete(`/watchlist/${symbol}`);
      setWatchlist((prev) => prev.filter((s) => s.symbol !== symbol));
    } catch {}
    setRemoveLoading('');
  };

  const filtered = watchlist.filter((s) =>
    s.symbol?.toLowerCase().includes(search.toLowerCase()) ||
    s.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Watchlist</Typography>
          <Typography variant="body2" color="text.secondary">Track your favorite stocks</Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ fontWeight: 600 }}>
          Add Stock
        </Button>
      </Box>

      <Card sx={{ bgcolor: '#131929' }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            placeholder="Search by symbol or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ mb: 3, width: { xs: '100%', sm: 340 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>Your watchlist is empty</Typography>
              <Typography variant="body2" color="text.secondary">Click "Add Stock" to start tracking stocks</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Symbol', 'Company', 'Price', 'Change', 'Change%', 'Volume', 'Actions'].map((h) => (
                      <TableCell key={h} sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 600 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((stock) => {
                    const live = liveData[stock.symbol];
                    const price = live?.price || stock.price || 0;
                    const change = live?.change || stock.change || 0;
                    const changePct = live?.changePercent || stock.changePercent || 0;
                    const isPositive = changePct >= 0;
                    return (
                      <TableRow key={stock.symbol} sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 700 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isPositive ? '#00c853' : '#ff1744' }} />
                            {stock.symbol}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'text.secondary' }}>{stock.companyName || '-'}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: 600 }}>{formatCurrency(price)}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: isPositive ? '#00c853' : '#ff1744', fontWeight: 600 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {isPositive ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
                            {isPositive ? '+' : ''}{formatCurrency(change)}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <Chip
                            label={`${isPositive ? '+' : ''}${Number(changePct).toFixed(2)}%`}
                            size="small"
                            sx={{ bgcolor: isPositive ? 'rgba(0,200,83,0.12)' : 'rgba(255,23,68,0.12)', color: isPositive ? '#00c853' : '#ff1744', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'text.secondary' }}>
                          {stock.volume ? Number(stock.volume).toLocaleString('en-IN') : '-'}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemove(stock.symbol)}
                            disabled={removeLoading === stock.symbol}
                          >
                            {removeLoading === stock.symbol ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                          </IconButton>
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

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setNewSymbol(''); setError(''); }} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: '#131929' } }}>
        <DialogTitle fontWeight={700}>Add Stock to Watchlist</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            fullWidth
            label="Stock Symbol"
            placeholder="e.g. RELIANCE, TCS, INFY"
            value={newSymbol}
            onChange={(e) => { setNewSymbol(e.target.value.toUpperCase()); setError(''); }}
            sx={{ mt: 1 }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button variant="outlined" onClick={() => { setDialogOpen(false); setNewSymbol(''); setError(''); }} sx={{ borderColor: 'rgba(255,255,255,0.2)' }}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleAdd} disabled={adding || !newSymbol.trim()} sx={{ fontWeight: 600 }}>
            {adding ? <CircularProgress size={18} color="inherit" /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
