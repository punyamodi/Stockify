import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button,
  CircularProgress, Alert, Avatar, Divider, InputAdornment,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const formatCurrency = (val) => `\u20B9${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Account() {
  const { user, login, token } = useAuth();
  const [profile, setProfile] = useState({ fullName: '', email: '', mobile: '' });
  const [editing, setEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [funds, setFunds] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [fundsLoading, setFundsLoading] = useState(false);
  const [fundsError, setFundsError] = useState('');
  const [fundsSuccess, setFundsSuccess] = useState('');

  const [stats, setStats] = useState({ orders: 0, positions: 0, watchlist: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfile({ fullName: user.fullName || '', email: user.email || '', mobile: user.mobile || '' });
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fundsRes, ordersRes, posRes, wlRes] = await Promise.allSettled([
          client.get('/user/funds'),
          client.get('/orders'),
          client.get('/positions'),
          client.get('/watchlist'),
        ]);
        if (fundsRes.status === 'fulfilled') setFunds(fundsRes.value.data);
        setStats({
          orders: (ordersRes.status === 'fulfilled' ? (ordersRes.value.data?.orders || ordersRes.value.data || []).length : 0),
          positions: (posRes.status === 'fulfilled' ? (posRes.value.data?.positions || posRes.value.data || []).length : 0),
          watchlist: (wlRes.status === 'fulfilled' ? (wlRes.value.data?.watchlist || wlRes.value.data || []).length : 0),
        });
      } finally {
        setStatsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const res = await client.put('/user/profile', profile);
      login(res.data.user || { ...user, ...profile }, token);
      setEditing(false);
      setProfileSuccess('Profile updated successfully.');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!addAmount || Number(addAmount) <= 0) {
      setFundsError('Enter a valid amount.');
      return;
    }
    setFundsLoading(true);
    setFundsError('');
    setFundsSuccess('');
    try {
      const res = await client.post('/user/funds/add', { amount: Number(addAmount) });
      setFunds(res.data);
      setAddAmount('');
      setFundsSuccess(`${formatCurrency(addAmount)} added to your account.`);
      setTimeout(() => setFundsSuccess(''), 3000);
    } catch (err) {
      setFundsError(err.response?.data?.message || 'Failed to add funds.');
    } finally {
      setFundsLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Account</Typography>
        <Typography variant="body2" color="text.secondary">Manage your profile and funds</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ bgcolor: '#131929' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>Profile Information</Typography>
                {!editing ? (
                  <Button startIcon={<EditIcon />} variant="outlined" size="small" onClick={() => setEditing(true)} sx={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    Edit
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button startIcon={<CancelIcon />} variant="text" size="small" color="inherit" onClick={() => { setEditing(false); setProfile({ fullName: user?.fullName || '', email: user?.email || '', mobile: user?.mobile || '' }); }}>
                      Cancel
                    </Button>
                    <Button startIcon={<SaveIcon />} variant="contained" color="primary" size="small" onClick={handleProfileSave} disabled={profileLoading}>
                      {profileLoading ? <CircularProgress size={16} color="inherit" /> : 'Save'}
                    </Button>
                  </Box>
                )}
              </Box>

              {profileError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{profileError}</Alert>}
              {profileSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{profileSuccess}</Alert>}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 4 }}>
                <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', color: '#0a0e1a', fontSize: '1.8rem', fontWeight: 700 }}>
                  {profile.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>{profile.fullName || 'User'}</Typography>
                  <Typography variant="body2" color="text.secondary">{profile.email}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profile.fullName}
                  onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                  disabled={!editing}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  value={profile.email}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  disabled={!editing}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                />
                <TextField
                  fullWidth
                  label="Mobile Number"
                  value={profile.mobile}
                  onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))}
                  disabled={!editing}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ bgcolor: '#131929', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Funds</Typography>
              <Box sx={{ bgcolor: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 2, p: 2.5, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AccountBalanceWalletIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Available Balance</Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {statsLoading ? <CircularProgress size={18} /> : formatCurrency(funds?.available || funds?.balance || 0)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {fundsError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{fundsError}</Alert>}
              {fundsSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{fundsSuccess}</Alert>}

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                  fullWidth
                  label="Amount to Add"
                  type="number"
                  value={addAmount}
                  onChange={(e) => { setAddAmount(e.target.value); setFundsError(''); }}
                  size="small"
                  inputProps={{ min: 1 }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Typography variant="body2" fontWeight={600}>\u20B9</Typography></InputAdornment> }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddFunds}
                  disabled={fundsLoading}
                  startIcon={<AddIcon />}
                  sx={{ fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  {fundsLoading ? <CircularProgress size={18} color="inherit" /> : 'Add'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: '#131929' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3}>Account Statistics</Typography>
              {statsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>
              ) : (
                <Box>
                  {[
                    { label: 'Total Orders', value: stats.orders },
                    { label: 'Open Positions', value: stats.positions },
                    { label: 'Watchlist Stocks', value: stats.watchlist },
                  ].map((s, i, arr) => (
                    <Box key={s.label}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                        <Typography color="text.secondary">{s.label}</Typography>
                        <Typography fontWeight={700} variant="h6">{s.value}</Typography>
                      </Box>
                      {i < arr.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
