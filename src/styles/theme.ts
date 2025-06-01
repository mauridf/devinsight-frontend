import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6CB1E1',       // Azul Médio - para botões principais
      light: '#A4D2F4',     // Azul Claro - para detalhes
      dark: '#3B84C4',      // Azul Escuro Suave - para hover/active
      contrastText: '#fff', // Texto em contraste
    },
    secondary: {
      main: '#3B84C4',      // Azul Escuro Suave - para botões secundários
      light: '#D3E3EC',     // Cinza Azulado - para fundos alternativos
      contrastText: '#fff',
    },
    background: {
      default: '#E9EDF0',   // Cinza Claro - fundo principal
      paper: '#ffffff',     // Fundo de cards/paper
    },
    text: {
      primary: '#444',      // Cinza escuro - texto principal
      secondary: '#3B84C4', // Azul Escuro Suave - texto secundário
    },
    grey: {
      100: '#E9EDF0',      // Cinza Claro
      200: '#D3E3EC',      // Cinza Azulado
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      color: '#3B84C4',    // Azul Escuro Suave para títulos
    },
    h2: {
      color: '#3B84C4',
    },
    // ... outros níveis de heading conforme necessário
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Remove uppercase padrão dos botões
          fontWeight: 600,
          borderRadius: '8px',
          padding: '8px 16px',
          '&:hover': {
            backgroundColor: '#3B84C4', // Azul Escuro Suave no hover
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#3B84C4', // Azul Escuro Suave para o header
        },
      },
    },
  },
});

export default theme;