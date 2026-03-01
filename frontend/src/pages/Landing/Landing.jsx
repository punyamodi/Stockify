import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, Card, CardContent,
  AppBar, Toolbar, Container, Divider,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import StarIcon from '@mui/icons-material/Star';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const features = [
  { icon: <SpeedIcon sx={{ fontSize: 32 }} />, title: 'Real-time Quotes', description: 'Live stock prices with millisecond updates directly from NSE and BSE feeds.' },
  { icon: <AccountBalanceWalletIcon sx={{ fontSize: 32 }} />, title: 'Portfolio Tracking', description: 'Monitor your holdings, P&L, and overall portfolio performance in real time.' },
  { icon: <BarChartIcon sx={{ fontSize: 32 }} />, title: 'Advanced Charts', description: 'Professional candlestick and line charts with multiple timeframes and indicators.' },
  { icon: <ReceiptLongIcon sx={{ fontSize: 32 }} />, title: 'Order Management', description: 'Place market and limit orders instantly with full order history and tracking.' },
  { icon: <StarIcon sx={{ fontSize: 32 }} />, title: 'Smart Watchlists', description: 'Build custom watchlists and track your favorite stocks with live price alerts.' },
  { icon: <SecurityIcon sx={{ fontSize: 32 }} />, title: 'Secure Platform', description: 'Bank-grade encryption and 2FA to keep your account and funds secure.' },
];

const steps = [
  { num: '01', title: 'Create Your Account', desc: 'Sign up in minutes with your email and complete a quick KYC verification.' },
  { num: '02', title: 'Add Funds', desc: 'Instantly transfer money to your trading account via UPI, NEFT, or IMPS.' },
  { num: '03', title: 'Start Trading', desc: 'Search stocks, analyze charts, and place your first trade with a single click.' },
];

const stats = [
  { value: '1M+', label: 'Active Traders' },
  { value: '5000+', label: 'NSE Listed Stocks' },
  { value: '<1ms', label: 'Real-time Data' },
  { value: '0', label: 'Commission Fees' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#0a0e1a', minHeight: '100vh', color: '#fff' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(10,14,26,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 1.5, background: 'linear-gradient(135deg, #00d4aa, #7c4dff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CandlestickChartIcon sx={{ fontSize: 18, color: '#fff' }} />
            </Box>
            <Typography variant="h6" fontWeight={700} color="primary">Stockify</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="text" color="inherit" onClick={() => navigate('/login')} sx={{ color: 'text.secondary', fontWeight: 500 }}>Login</Button>
            <Button variant="contained" color="primary" onClick={() => navigate('/register')} sx={{ fontWeight: 600 }}>Get Started</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ py: { xs: 10, md: 16 }, textAlign: 'center', px: 2, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '20%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: '30%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,77,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Container maxWidth="md">
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 8, px: 2, py: 0.75, mb: 4 }}>
            <TrendingUpIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="caption" color="primary.main" fontWeight={600} letterSpacing={1}>INDIA'S FASTEST TRADING PLATFORM</Typography>
          </Box>
          <Typography variant="h1" sx={{ fontSize: { xs: '2.8rem', md: '4.5rem' }, fontWeight: 800, lineHeight: 1.1, mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #8899aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Trade Smarter,<br />Grow Faster
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 5, maxWidth: 560, mx: 'auto', fontWeight: 400, lineHeight: 1.7 }}>
            Professional-grade stock trading tools for every investor. Real-time data, advanced charts, and zero commission trading.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" color="primary" size="large" onClick={() => navigate('/register')} sx={{ px: 4, py: 1.5, fontSize: '1rem', fontWeight: 700 }}>
              Start Trading Free
            </Button>
            <Button variant="outlined" color="primary" size="large" onClick={() => navigate('/login')} sx={{ px: 4, py: 1.5, fontSize: '1rem', fontWeight: 600, borderColor: 'rgba(0,212,170,0.4)' }}>
              View Demo
            </Button>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: 4, borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', bgcolor: '#0d1120' }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {stats.map((stat) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="h4" fontWeight={800} color="primary.main">{stat.value}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>{stat.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 8, md: 12 }, px: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" color="primary.main" fontWeight={700} letterSpacing={2}>FEATURES</Typography>
            <Typography variant="h3" fontWeight={700} mt={1} mb={2}>Everything You Need to Trade</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
              A complete trading ecosystem built for both beginners and professional traders.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map((f) => (
              <Grid item xs={12} sm={6} md={4} key={f.title}>
                <Card sx={{ height: '100%', bgcolor: '#131929', p: 1, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>{f.icon}</Box>
                    <Typography variant="h6" fontWeight={700} mb={1}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.7}>{f.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 8, md: 12 }, px: 2, bgcolor: '#0d1120' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" color="primary.main" fontWeight={700} letterSpacing={2}>HOW IT WORKS</Typography>
            <Typography variant="h3" fontWeight={700} mt={1}>Get Started in 3 Steps</Typography>
          </Box>
          <Box sx={{ position: 'relative' }}>
            {steps.map((step, idx) => (
              <Box key={step.num} sx={{ display: 'flex', gap: 4, mb: idx < steps.length - 1 ? 6 : 0, alignItems: 'flex-start' }}>
                <Box sx={{ flexShrink: 0, width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,212,170,0.2), rgba(124,77,255,0.2))', border: '2px solid rgba(0,212,170,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" fontWeight={800} color="primary.main">{step.num}</Typography>
                </Box>
                <Box sx={{ pt: 1.5 }}>
                  <Typography variant="h5" fontWeight={700} mb={1}>{step.title}</Typography>
                  <Typography variant="body1" color="text.secondary" lineHeight={1.7}>{step.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Button variant="contained" color="primary" size="large" onClick={() => navigate('/register')} sx={{ px: 6, py: 1.75, fontSize: '1.05rem', fontWeight: 700 }}>
              Open Free Account
            </Button>
          </Box>
        </Container>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} Stockify Technologies Pvt. Ltd. All rights reserved.
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Investments in securities are subject to market risks. Please read all scheme related documents carefully.
        </Typography>
      </Box>
    </Box>
  );
}
