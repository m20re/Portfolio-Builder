// app/register/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Link } from '@mui/material';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRegister = (event) => {
    event.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    if (users.some((user) => user.email === email)) {
      setError('This email is already in use.');
      return;
    }

    users.push({ email, password, createdAt: new Date().toISOString() });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Account created successfully!');
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
        onSubmit={handleRegister}
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
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center', color: '#111827' }}
        >
          Create Account
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
            sx: { color: '#111827', backgroundColor: '#ffffff', borderRadius: 2 },
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
            sx: { color: '#111827', backgroundColor: '#ffffff', borderRadius: 2 },
          }}
          InputLabelProps={{ shrink: false }}
        />

        <TextField
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
          size="small"
          fullWidth
          InputProps={{
            sx: { color: '#111827', backgroundColor: '#ffffff', borderRadius: 2 },
          }}
          InputLabelProps={{ shrink: false }}
        />

        {/* Sign Up Button */}
        <Box sx={{ display: 'flex', mt: 2, width: '100%' }}>
          <Button
            type="submit"
            variant="contained"
            sx={{
              flex: 1,
              py: 1.2,
              borderRadius: 2,
              backgroundColor: '#3B82F6',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#2563eb' },
            }}
          >
            SIGN UP
          </Button>
        </Box>

        {/* Clickable link below Sign Up */}
        <Link
          href="/login"
          underline="hover"
          sx={{
            mt: 2,
            color: '#3B82F6',
            fontWeight: 'bold',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          You already have an account? Sign in
        </Link>
      </Paper>
    </Box>
  );
}
