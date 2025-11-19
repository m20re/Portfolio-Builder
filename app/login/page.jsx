// app/register/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Link } from '@mui/material';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignIn = (event) => {
    event.preventDefault();

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const user = users.find((user) => user.email === email && user.password === password);

    if (!user) {
      setError('Invalid email or password.');
      return;
    }

    // Clear any previous error
    setError('');

    // Redirect to builder page
    window.location.href = '/builder';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        p: 2,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSignIn}
        elevation={5}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          alignItems: 'center',
          transform: mounted ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
          opacity: mounted ? 1 : 0,
          transition: 'all 0.5s ease',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center', color: '#111827' }}
        >
          Welcome Back
        </Typography>

        {error && (
          <Typography variant="body2" align="center" sx={{ color: 'red', mb: 1 }}>
            {error}
          </Typography>
        )}

        <TextField
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          size="small"
          fullWidth
          InputProps={{
            sx: {
              color: '#111827',
              backgroundColor: '#f9fafb',
              borderRadius: 2,
            },
          }}
          InputLabelProps={{ shrink: false }}
        />

        <TextField
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          size="small"
          fullWidth
          InputProps={{
            sx: {
              color: '#111827',
              backgroundColor: '#f9fafb',
              borderRadius: 2,
            },
          }}
          InputLabelProps={{ shrink: false }}
        />

        <Button
          type="submit"
          variant="contained"
          sx={{
            width: '100%',
            py: 1.5,
            borderRadius: 2,
            backgroundColor: '#3B82F6',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#2563eb' },
            mt: 1,
          }}
        >
          SIGN IN
        </Button>

        <Link
          href="/register"
          underline="hover"
          sx={{
            mt: 2,
            color: '#3B82F6',
            fontWeight: 'bold',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          Don't have an account? Sign up
        </Link>
      </Paper>
    </Box>
  );
}
