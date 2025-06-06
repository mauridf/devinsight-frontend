import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyle from './styles/globalStyles';
import theme from './styles/theme';
import { isAuthenticated } from './services/auth';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import ProjectFormPage from './pages/ProjectFormPage';
import PersonaChavePage from './pages/PersonaChavePage';
import StakeHolderPage from './pages/StakeHolersPage';
import RequisitoPage from './pages/RequisitoPage';
import FasesProjetoPage from './pages/FasesProjetoPage';
import FuncionalidadePage from './pages/FuncionalidadePage';
import DocumentosPage from './pages/DocumentosPage';
import ReunioesPage from './pages/ReunioesPage';
import SolucaoPropostaPage from './pages/SolucaoPropostaPage';
import EstimativaCustoPage from './pages/EstimativaCustoPage';
import TarefasPage from './pages/TarefasPage';
import KanbanPage from './pages/KanbanPage';

// Componente de rota protegida
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = isAuthenticated();
  console.log('PrivateRoute - isAuthenticated:', auth);
  return auth ? <>{children}</> : <Navigate to="/login" />;
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
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/projetos" element={<PrivateRoute><ProjectPage /></PrivateRoute>} />
            <Route path="/projetos/cadastro" element={<PrivateRoute><ProjectFormPage /></PrivateRoute>} />
            <Route path="/projetos/editar/:id" element={<PrivateRoute><ProjectFormPage isEdit /></PrivateRoute>} />
            <Route path="/personaschave" element={<PrivateRoute><PersonaChavePage /></PrivateRoute>} />
            <Route path="/stakeholder" element={<PrivateRoute><StakeHolderPage /></PrivateRoute>} />
            <Route path="/requisito" element={<PrivateRoute><RequisitoPage /></PrivateRoute>} />
            <Route path="/fasesprojeto" element={<PrivateRoute><FasesProjetoPage /></PrivateRoute>} />
            <Route path="/funcionalidade" element={<PrivateRoute><FuncionalidadePage /></PrivateRoute>} />
            <Route path="/documentos" element={<PrivateRoute><DocumentosPage /></PrivateRoute>} />
            <Route path="/reunioes" element={<PrivateRoute><ReunioesPage /></PrivateRoute>} />
            <Route path="/solucoespropostas" element={<PrivateRoute><SolucaoPropostaPage /></PrivateRoute>} />
            <Route path="/estimativacusto" element={<PrivateRoute><EstimativaCustoPage /></PrivateRoute>} />
            <Route path="/tarefas" element={<PrivateRoute><TarefasPage /></PrivateRoute>} />
            <Route path="/kanban" element={<PrivateRoute><KanbanPage /></PrivateRoute>} />
        </Routes>
        </Router>
      </StyledThemeProvider>
    </MuiThemeProvider>
  );
};

export default App;