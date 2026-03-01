import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Alert, IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import client from '../../api/client';

const formatCurrency = (val) => `\u20B9${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusColors = { EXECUTED: 'success', PENDING: 'warning', CANCELLED: 'error' };

const defaultForm = { symbol: '', qty: '', price: '', type: 'BUY', productType: 'CNC', priceType: 'MARKET' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState('');
  const [stocks, setStocks] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await client.get('/orders');
      const data = res.data?.orders || res.data || [];
      setOrders(data.map((o, i) => ({ ...o, id: o._id || o.id || i })));
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    client.get('/stocks').then((res) => setStocks(res.data?.stocks || res.data || [])).catch(() => setStocks([]));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.symbol || !form.qty || (form.priceType === 'LIMIT' && !form.price)) {
      setError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await client.post('/orders', {
        symbol: form.symbol,
        qty: Number(form.qty),
        price: form.priceType === 'MARKET' ? 0 : Number(form.price),
        orderType: form.type,
        productType: form.productType,
        priceType: form.priceType,
      });
      setDialogOpen(false);
      setForm(defaultForm);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Order placement failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (orderId) => {
    setCancelLoading(orderId);
    try {
      await client.delete(`/orders/${orderId}`);
      fetchOrders();
    } catch {}
    setCancelLoading('');
  };

  const columns = [
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 130,
      renderCell: (p) => (
        <Typography variant="body2" color="text.secondary">
          {p.value ? new Date(p.value).toLocaleDateString('en-IN') : '-'}
        </Typography>
      ),
    },
    { field: 'symbol', headerName: 'Symbol', width: 120, renderCell: (p) => <Typography fontWeight={700}>{p.value}</Typography> },
    {
      field: 'orderType',
      headerName: 'Type',
      width: 90,
      renderCell: (p) => (
        <Chip label={p.value} size="small" color={p.value === 'BUY' ? 'success' : 'error'} variant="outlined" />
      ),
    },
    { field: 'qty', headerName: 'Qty', width: 80, type: 'number' },
    {
      field: 'price',
      headerName: 'Price',
      width: 130,
      renderCell: (p) => formatCurrency(p.value),
    },
    { field: 'productType', headerName: 'Product', width: 90 },
    { field: 'priceType', headerName: 'Order Type', width: 110 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (p) => (
        <Chip label={p.value} size="small" color={statusColors[p.value] || 'default'} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (p) => {
        if (p.row.status !== 'PENDING') return null;
        const id = p.row._id || p.row.id;
        return (
          <IconButton
            size="small"
            color="error"
            onClick={() => handleCancel(id)}
            disabled={cancelLoading === id}
          >
            {cancelLoading === id ? <CircularProgress size={16} /> : <CancelIcon fontSize="small" />}
          </IconButton>
        );
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Orders</Typography>
          <Typography variant="body2" color="text.secondary">Manage your buy and sell orders</Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)} sx={{ fontWeight: 600 }}>
          Place Order
        </Button>
      </Box>

      <Card sx={{ bgcolor: '#131929' }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
          ) : orders.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>No orders yet</Typography>
              <Typography variant="body2" color="text.secondary">Place your first order to get started</Typography>
            </Box>
          ) : (
            <DataGrid
              rows={orders}
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

      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setForm(defaultForm); setError(''); }} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#131929' } }}>
        <DialogTitle fontWeight={700}>Place Order</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              select
              fullWidth
              label="Order Type"
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <MenuItem value="BUY">BUY</MenuItem>
              <MenuItem value="SELL">SELL</MenuItem>
            </TextField>
            {stocks.length > 0 ? (
              <TextField
                select
                fullWidth
                label="Symbol"
                name="symbol"
                value={form.symbol}
                onChange={handleChange}
              >
                {stocks.map((s) => (
                  <MenuItem key={s.symbol || s} value={s.symbol || s}>{s.symbol || s}</MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                fullWidth
                label="Symbol"
                name="symbol"
                placeholder="e.g. RELIANCE"
                value={form.symbol}
                onChange={(e) => setForm((p) => ({ ...p, symbol: e.target.value.toUpperCase() }))}
              />
            )}
            <TextField
              fullWidth
              label="Quantity"
              name="qty"
              type="number"
              value={form.qty}
              onChange={handleChange}
              inputProps={{ min: 1 }}
            />
            <TextField
              select
              fullWidth
              label="Price Type"
              name="priceType"
              value={form.priceType}
              onChange={handleChange}
            >
              <MenuItem value="MARKET">MARKET</MenuItem>
              <MenuItem value="LIMIT">LIMIT</MenuItem>
            </TextField>
            {form.priceType === 'LIMIT' && (
              <TextField
                fullWidth
                label="Limit Price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.05 }}
              />
            )}
            <TextField
              select
              fullWidth
              label="Product Type"
              name="productType"
              value={form.productType}
              onChange={handleChange}
            >
              <MenuItem value="CNC">CNC (Delivery)</MenuItem>
              <MenuItem value="MIS">MIS (Intraday)</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button variant="outlined" onClick={() => { setDialogOpen(false); setForm(defaultForm); setError(''); }} sx={{ borderColor: 'rgba(255,255,255,0.2)' }}>Cancel</Button>
          <Button
            variant="contained"
            color={form.type === 'BUY' ? 'success' : 'error'}
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ fontWeight: 700, px: 3 }}
          >
            {submitting ? <CircularProgress size={18} color="inherit" /> : `Place ${form.type} Order`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
