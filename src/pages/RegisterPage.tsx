import React, { useState } from 'react';
import { Container, Box, TextField, Typography, Link, Alert, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Header from '../components/Header';
import { register } from '../services/auth';

const RegisterPage: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState(3); // Default para Cliente
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await register(nome, email, password, tipoUsuario);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Erro ao cadastrar usuário. Tente novamente.');
      console.error('Registration error:', err);
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
            Cadastro
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Cadastro realizado com sucesso! Redirecionando para login...
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} mt={3}>
            <TextField
              label="Nome Completo"
              variant="outlined"
              fullWidth
              margin="normal"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
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
            <TextField
              select
              label="Tipo de Usuário"
              variant="outlined"
              fullWidth
              margin="normal"
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(Number(e.target.value))}
              required
            >
              <MenuItem value={0}>Administrador</MenuItem>
              <MenuItem value={1}>Consultor</MenuItem>
              <MenuItem value={3}>Cliente</MenuItem>
            </TextField>
            <Box mt={3}>
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Carregando...' : 'Cadastrar'}
              </Button>
            </Box>
            <Box mt={2}>
              <Typography variant="body2">
                Já tem uma conta? <Link href="/login">Faça login</Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default RegisterPage;