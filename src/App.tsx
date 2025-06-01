import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyle from './styles/globalStyles';
import theme from './styles/theme';
import { isAuthenticated } from './services/auth';

// Páginas que serão criadas depois
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

// Componente de rota protegida
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <MuiThemeProvider theme={theme}>
      <StyledThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyle />
        <Router>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
        </Routes>
        </Router>
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
};

export default App;