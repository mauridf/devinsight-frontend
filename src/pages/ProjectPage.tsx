import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, Paper } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import DataTable from '../components/DataTable';
import { ProjectService } from '../services/api';

// Interfaces (podem ser movidas para um arquivo types.ts)
interface UserData {
  id?: string;
  nome?: string;
  email?: string;
  tipoUsuario?: number;
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
    console.error('Erro ao ler dados do usuário:', error);
  }
  return {};
};

const ProjectPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const userData = getUserData();
  const userName = userData.nome || 'Usuário';
  const userId = userData.id || '';
  const navigate = useNavigate();
  const handleEdit = (projectId: string) => {
    navigate(`/projetos/editar/${projectId}`);
    };

  const handleDelete = async (projectId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
        try {
        await ProjectService.delete(projectId);
        // Atualiza a lista após exclusão
        const updatedProjects = projects.filter(p => p.id !== projectId);
        setProjects(updatedProjects);
        setTotalCount(updatedProjects.length);
        } catch (error) {
        console.error('Erro ao excluir projeto:', error);
        alert('Erro ao excluir projeto');
        }
    }
    };

  // Colunas da tabela
  const columns = [
    { id: 'nome', label: 'Projeto', width: '20%' },
    { id: 'cliente', label: 'Cliente', width: '20%' },
    { id: 'dataInicio', label: 'Data Início', width: '15%', align: 'center' as const },
    { id: 'dataEntrega', label: 'Data Entrega', width: '15%', align: 'center' as const },
    { id: 'status', label: 'Status', width: '20%', align: 'center' as const },
    { id: 'acao', label: 'Ação', width: '10%', align: 'center' as const }
  ];

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Renderizar status com cores
  type ProjectStatus = 'Em Andamento' | 'Finalizado' | 'Pausado' | 'Cancelado';
  const renderStatus = (statusCode: number) => {
        const statusMap: Record<number, ProjectStatus> = {
            0: 'Em Andamento',
            1: 'Pausado',
            2: 'Cancelado',
            3: 'Finalizado'
        };

        const statusText = statusMap[statusCode] || 'Desconhecido';
        
        const statusColors: Record<ProjectStatus, string> = {
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
                backgroundColor: statusColors[statusText] || '#E9EDF0',
                color: '#444',
                fontWeight: 'medium'
            }}
            >
            {statusText}
            </Box>
        );
    };

  // Renderizar ações
  const renderActions = (projectId: string) => (
    <>
        <IconButton 
        size="small" 
        sx={{ color: '#6CB1E1' }}
        onClick={() => handleEdit(projectId)}
        >
        <EditIcon fontSize="small" />
        </IconButton>
        <IconButton 
        size="small" 
        sx={{ color: '#FF6B6B' }}
        onClick={() => handleDelete(projectId)}
        >
        <DeleteIcon fontSize="small" />
        </IconButton>
    </>
    );

  // Carregar projetos
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const response = await ProjectService.getByUser(userId);
        setProjects(response.data);
        setTotalCount(response.data.length);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProjects();
    }
  }, [userId]);

  return (
    <>
      <Header />
      <Box display="flex" minHeight="calc(100vh - 64px)">
        <SideMenu />
        
        <Box flex={1} p={3}>
          <Typography variant="h4" gutterBottom>
            PROJETO
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
            Consultor: {userName}
          </Typography>
          
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              component={Link}
              to="/projetos/cadastro"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: '#3B84C4',
                '&:hover': { backgroundColor: '#6CB1E1' }
              }}
            >
              Novo
            </Button>
          </Box>

          {loading ? (
            <Typography>Carregando projetos...</Typography>
          ) : projects.length === 0 ? (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                {userName} ainda não cadastrou nenhum Projeto para atuar
              </Typography>
            </Paper>
          ) : (
            <DataTable
              columns={columns}
              data={projects}
              count={totalCount}
              page={page}
              onPageChange={(newPage) => setPage(newPage)}
              onRowsPerPageChange={(newRowsPerPage) => {
                setRowsPerPage(newRowsPerPage);
                setPage(0);
              }}
              renderCell={(row, columnId) => {
                switch (columnId) {
                    case 'dataInicio':
                    case 'dataEntrega':
                    return formatDate(row[columnId]);
                    case 'status':
                    return renderStatus(row.status);
                    case 'acao':
                    return renderActions(row.id); // Passe o ID do projeto
                    default:
                    return row[columnId];
                }
                }}
            />
          )}
        </Box>
      </Box>
    </>
  );
};

export default ProjectPage;