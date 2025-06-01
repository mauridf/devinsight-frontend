import React, { useState } from 'react';
import { Container, Box, TextField, Typography, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Header from '../components/Header';
import { login } from '../services/auth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Email ou senha incorretos');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="sm">
        <Box my={4} textAlign="center">
          <Typography variant="h4" gutterBottom>
            Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} mt={3}>
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Senha"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Box mt={3}>
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Carregando...' : 'Entrar'}
              </Button>
            </Box>
            <Box mt={2}>
              <Typography variant="body2">
                Não tem uma conta? <Link href="/register">Cadastre-se</Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default LoginPage;