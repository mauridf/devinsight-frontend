import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import SummaryCard from '../components/SummaryCard';
import DataTable from '../components/DataTable';

// Interface para tipar os dados do usuário
interface UserData {
  id?: string;
  nome?: string;
  email?: string;
  tipoUsuario?: number;
}

// Obter dados do usuário do localStorage de forma segura
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

  // Obter dados do usuário
  const userData = getUserData();
  const userName = userData.nome || 'Usuário';

  // Dados de exemplo para os projetos
  const projects = [
    { id: 1, name: 'Projeto 1', client: 'Cliente 1', startDate: '01/01/2023', deliveryDate: '30/06/2023', status: 'Em Andamento' },
    { id: 2, name: 'Projeto 2', client: 'Cliente 2', startDate: '15/02/2023', deliveryDate: '15/08/2023', status: 'Pausado' },
    { id: 3, name: 'Projeto 3', client: 'Cliente 3', startDate: '10/03/2023', deliveryDate: '10/09/2023', status: 'Finalizado' },
    { id: 4, name: 'Projeto 4', client: 'Cliente 4', startDate: '05/04/2023', deliveryDate: '05/10/2023', status: 'Finalizado' },
    { id: 5, name: 'Projeto 5', client: 'Cliente 5', startDate: '20/05/2023', deliveryDate: '20/11/2023', status: 'Cancelado' },
  ];

  interface Column {
    id: string;
    label: string;
    width: string;
    align?: 'left' | 'right' | 'center';
  }

  const columns: Column[] = [
    { id: 'name', label: 'Projeto', width: '25%' },
    { id: 'client', label: 'Cliente', width: '25%' },
    { id: 'startDate', label: 'Data Início', align: 'center', width: '15%' },
    { id: 'deliveryDate', label: 'Data Entrega', align: 'center', width: '15%' },
    { id: 'status', label: 'Status', align: 'center', width: '20%' }
  ];

  const renderStatusCell = (row: any) => {
    const statusColors: Record<string, string> = {
        'Em Andamento': '#A4D2F4',
        'Finalizado': '#E9EDF0',
        'Pausado': '#FFE0B2',
        'Cancelado': '#FFCDD2'
    };

    return (
      <Box 
        display="inline-block" 
        px={1} 
        py={0.5} 
        borderRadius={1}
        sx={{
          backgroundColor: statusColors[row.status] || '#E9EDF0',
          color: '#444',
          fontWeight: 'medium'
        }}
      >
        {row.status}
      </Box>
    );
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

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
            <SummaryCard title="PROJETOS CRIADOS" value="24" />
            <SummaryCard title="PROJETOS EM ANDAMENTO" value="8" />
            <SummaryCard title="PROJETOS FINALIZADOS" value="16" />
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
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            renderCell={(row, columnId) => {
              if (columnId === 'status') {
                return renderStatusCell(row);
              }
              return row[columnId];
            }}
          />
        </Box>
      </Box>
    </>
  );
};

export default DashboardPage;