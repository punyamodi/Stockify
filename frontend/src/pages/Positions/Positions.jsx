import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, CircularProgress,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import client from '../../api/client';

const formatCurrency = (val) => `\u20B9${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function SummaryCard({ title, value, color, icon }) {
  return (
    <Card sx={{ bgcolor: '#131929' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>{title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon && <Box sx={{ color: color || 'text.primary' }}>{icon}</Box>}
          <Typography variant="h5" fontWeight={700} color={color || 'text.primary'}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState({});
  const [exitDialog, setExitDialog] = useState(null);
  const [exitLoading, setExitLoading] = useState(false);
  const wsRef = useRef(null);

  const fetchPositions = async () => {
    try {
      const res = await client.get('/positions');
      const data = res.data?.positions || res.data || [];
      setPositions(data.map((p, i) => ({ ...p, id: p._id || p.id || i })));
    } catch {
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
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

  const handleExit = async () => {
    if (!exitDialog) return;
    setExitLoading(true);
    try {
      await client.post(`/positions/${exitDialog._id || exitDialog.id}/exit`);
      setExitDialog(null);
      fetchPositions();
    } catch {}
    setExitLoading(false);
  };

  const enriched = positions.map((p) => {
    const live = liveData[p.symbol];
    const cp = live?.price || p.currentPrice || p.avgPrice;
    const pnl = (cp - p.avgPrice) * p.qty;
    const pnlPct = p.avgPrice ? ((cp - p.avgPrice) / p.avgPrice) * 100 : 0;
    return { ...p, currentPrice: cp, pnl, pnlPct };
  });

  const totalInvested = enriched.reduce((s, p) => s + p.avgPrice * p.qty, 0);
  const currentValue = enriched.reduce((s, p) => s + p.currentPrice * p.qty, 0);
  const totalPnl = currentValue - totalInvested;

  const columns = [
    { field: 'symbol', headerName: 'Symbol', width: 120, renderCell: (p) => <Typography fontWeight={700}>{p.value}</Typography> },
    { field: 'companyName', headerName: 'Company', flex: 1, minWidth: 140, renderCell: (p) => <Typography color="text.secondary">{p.value || '-'}</Typography> },
    { field: 'qty', headerName: 'Qty', width: 80, type: 'number' },
    {
      field: 'avgPrice',
      headerName: 'Avg Price',
      width: 130,
      renderCell: (p) => formatCurrency(p.value),
    },
    {
      field: 'currentPrice',
      headerName: 'Current Price',
      width: 140,
      renderCell: (p) => <Typography fontWeight={600}>{formatCurrency(p.value)}</Typography>,
    },
    {
      field: 'pnl',
      headerName: 'P&L',
      width: 140,
      renderCell: (p) => (
        <Typography fontWeight={700} color={p.value >= 0 ? '#00c853' : '#ff1744'}>
          {p.value >= 0 ? '+' : ''}{formatCurrency(p.value)}
        </Typography>
      ),
    },
    {
      field: 'pnlPct',
      headerName: 'P&L%',
      width: 100,
      renderCell: (p) => (
        <Chip
          label={`${p.value >= 0 ? '+' : ''}${Number(p.value).toFixed(2)}%`}
          size="small"
          icon={p.value >= 0 ? <TrendingUpIcon sx={{ fontSize: '14px !important' }} /> : <TrendingDownIcon sx={{ fontSize: '14px !important' }} />}
          sx={{
            bgcolor: p.value >= 0 ? 'rgba(0,200,83,0.12)' : 'rgba(255,23,68,0.12)',
            color: p.value >= 0 ? '#00c853' : '#ff1744',
            fontWeight: 700,
          }}
        />
      ),
    },
    {
      field: 'productType',
      headerName: 'Product',
      width: 90,
      renderCell: (p) => <Chip label={p.value || 'CNC'} size="small" variant="outlined" sx={{ borderColor: 'rgba(255,255,255,0.2)', color: 'text.secondary' }} />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (p) => (
        <Button size="small" variant="outlined" color="error" onClick={() => setExitDialog(p.row)} sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
          Exit
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Positions</Typography>
        <Typography variant="body2" color="text.secondary">Your open holdings and P&L</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="Total Invested" value={formatCurrency(totalInvested)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard title="Current Value" value={formatCurrency(currentValue)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard
            title="Total P&L"
            value={`${totalPnl >= 0 ? '+' : ''}${formatCurrency(totalPnl)}`}
            color={totalPnl >= 0 ? '#00c853' : '#ff1744'}
            icon={totalPnl >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
          />
        </Grid>
      </Grid>

      <Card sx={{ bgcolor: '#131929' }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
          ) : enriched.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>No open positions</Typography>
              <Typography variant="body2" color="text.secondary">Your active holdings will appear here</Typography>
            </Box>
          ) : (
            <DataGrid
              rows={enriched}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              autoHeight
              sx={{
                border: 'none',
                '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' },
                '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,255,255,0.04)' },
                '& .MuiDataGrid-row:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                '& .MuiDataGrid-footerContainer': { borderTop: '1px solid rgba(255,255,255,0.06)' },
                color: '#fff',
              }}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={!!exitDialog} onClose={() => setExitDialog(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: '#131929' } }}>
        <DialogTitle fontWeight={700}>Exit Position</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to exit your position in{' '}
            <Typography component="span" fontWeight={700} color="text.primary">{exitDialog?.symbol}</Typography>?
            This will place a market sell order for {exitDialog?.qty} shares.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button variant="outlined" onClick={() => setExitDialog(null)} sx={{ borderColor: 'rgba(255,255,255,0.2)' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleExit} disabled={exitLoading} sx={{ fontWeight: 700 }}>
            {exitLoading ? <CircularProgress size={18} color="inherit" /> : 'Exit Position'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
