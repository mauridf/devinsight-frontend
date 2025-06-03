import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import SummaryCard from '../components/SummaryCard';
import DataTable from '../components/DataTable';
import { DashboardService, ProjectService } from '../services/api';

interface UserData {
  id?: string;
  nome?: string;
  email?: string;
  tipoUsuario?: number;
}

interface DashboardData {
  totalProjetos: number;
  projetosEmAndamento: number;
  projetosFinalizados: number;
}

interface Project {
  id: string;
  nome: string;
  cliente: string;
  dataInicio: string;
  dataEntrega: string;
  status: number;
}

const getUserData = (): UserData => {
  try {
    const userString = localStorage.getItem('user');
    if (userString) {
      return JSON.parse(userString) as UserData;
    }
  } catch (error) {
    console.error('Erro ao ler dados do usuário do localStorage:', error);
  }
  return {};
};

const DashboardPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Obter dados do usuário
  const userData = getUserData();
  const userName = userData.nome || 'Usuário';
  const userId = userData.id || '';

  // Carregar dados do dashboard
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Carrega dados do dashboard
        const dashboardResponse = await DashboardService.dashboard(userId);
        setDashboardData(dashboardResponse.data);
        
        // Carrega projetos do usuário
        const projectsResponse = await ProjectService.getByUser(userId);
        setProjects(projectsResponse.data);
        
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadData();
    }
  }, [userId]);

  const columns = [
    { id: 'nome', label: 'Projeto', width: '25%' },
    { id: 'cliente', label: 'Cliente', width: '25%' },
    { id: 'dataInicio', label: 'Data Início', align: 'center' as const, width: '15%' },
    { id: 'dataEntrega', label: 'Data Entrega', align: 'center' as const, width: '15%' },
    { id: 'status', label: 'Status', align: 'center' as const, width: '20%' }
  ];

  const renderStatusCell = (row: Project) => {
    const statusMap: Record<number, string> = {
      0: 'Em Andamento',
      1: 'Finalizado',
      2: 'Pausado',
      3: 'Cancelado'
    };

    const statusColors: Record<string, string> = {
      'Em Andamento': '#A4D2F4',
      'Finalizado': '#E9EDF0',
      'Pausado': '#FFE0B2',
      'Cancelado': '#FFCDD2'
    };

    const statusText = statusMap[row.status] || 'Desconhecido';

    return (
      <Box 
        display="inline-block" 
        px={1} 
        py={0.5} 
        borderRadius={1}
        sx={{
          backgroundColor: statusColors[statusText] || '#E9EDF0',
          color: '#444',
          fontWeight: 'medium'
        }}
      >
        {statusText}
      </Box>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <>
        <Header />
        <Box display="flex" minHeight="calc(100vh - 64px)">
          <SideMenu />
          <Box flex={1} p={3} display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Box display="flex" minHeight="calc(100vh - 64px)">
          <SideMenu />
          <Box flex={1} p={3}>
            <Typography color="error">{error}</Typography>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <Header />
      <Box display="flex" minHeight="calc(100vh - 64px)">
        <SideMenu />
        
        {/* Conteúdo Principal */}
        <Box flex={1} p={3}>
          <Typography variant="h4" gutterBottom>
            DASHBOARD
          </Typography>

          {/* Cards de Resumo */}
          <Box display="flex" justifyContent="space-between" mb={4} flexWrap="wrap" gap={2}>
            <SummaryCard 
              title="PROJETOS CRIADOS" 
              value={dashboardData?.totalProjetos.toString() || '0'} 
            />
            <SummaryCard 
              title="PROJETOS EM ANDAMENTO" 
              value={dashboardData?.projetosEmAndamento.toString() || '0'} 
            />
            <SummaryCard 
              title="PROJETOS FINALIZADOS" 
              value={dashboardData?.projetosFinalizados.toString() || '0'} 
            />
          </Box>

          {/* Tabela de Projetos */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Projetos cadastrados por {userName}
          </Typography>
          <DataTable
            columns={columns}
            data={projects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
            count={projects.length}
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            onRowsPerPageChange={(newRowsPerPage) => {
              setRowsPerPage(newRowsPerPage);
              setPage(0);
            }}
            renderCell={(row, columnId) => {
              switch (columnId) {
                case 'status':
                  return renderStatusCell(row);
                case 'dataInicio':
                case 'dataEntrega':
                  return formatDate(row[columnId]);
                default:
                  return row[columnId];
              }
            }}
          />
        </Box>
      </Box>
    </>
  );
};

export default DashboardPage;