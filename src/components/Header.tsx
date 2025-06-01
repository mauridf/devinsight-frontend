import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button, Avatar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/auth';
import CircleIcon from '@mui/icons-material/Circle';

const Header: React.FC = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Função para converter o tipo de usuário numérico para texto
  const getUserTypeText = (tipoUsuario: number) => {
    switch(tipoUsuario) {
      case 0: return 'Admin';
      case 1: return 'Consultor';
      case 3: return 'Cliente';
      default: return 'Usuário';
    }
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Box display="flex" alignItems="center" width="100%">
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: '#fff', textDecoration: 'none' }}>
            DevInsight
          </Typography>
          
          {user ? (
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: '#A4D2F4', mr: 1 }}>
                {user.nome.charAt(0)}
              </Avatar>
              <Typography variant="subtitle1" sx={{ color: '#fff', mr: 2 }}>
                {user.nome}
              </Typography>
              {/* Separador com ícone */}
              <CircleIcon sx={{ 
                color: '#fff', 
                fontSize: '6px', 
                mx: 1,
                opacity: 0.7
              }} />
              
              <Typography variant="subtitle1" sx={{ 
                color: '#fff', 
                mr: 2,
                fontWeight: 500
              }}>
                {getUserTypeText(user.tipoUsuario)}
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ color: '#fff', borderColor: '#fff' }}
                onClick={handleLogout}
              >
                Sair
              </Button>
            </Box>
          ) : (
            <Box>
              <Button color="secondary" href="/login" sx={{ mr: 2 }}>
                Entrar
              </Button>
              <Button variant="outlined" sx={{ color: '#fff', borderColor: '#fff' }} href="/register">
                Cadastrar
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;