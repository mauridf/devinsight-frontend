import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Alert,
  IconButton
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import DataTable from '../components/DataTable';
import { FuncionalidadeService, ProjectService } from '../services/api';

interface UserData {
  id?: string;
  nome?: string;
  email?: string;
  tipoUsuario?: number;
}

interface ApiError {
  response?: {
    status: number;
    data: any;
    headers: any;
  };
  request?: any;
  message: string;
  config: any;
}

interface Funcionalidade {
  id: string;
  funcionalidade: string;
  projetoId: string;
}

interface Project {
  id: string;
  nome: string;
}

const getUserData = (): UserData => {
  try {
    const userString = localStorage.getItem('user');
    if (userString) return JSON.parse(userString) as UserData;
  } catch (error) {
    console.error('Erro ao ler dados do usuário:', error);
  }
  return {};
};

const FuncionalidadePage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [funcionalidade, setFuncionalidade] = useState<Funcionalidade[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');

  const [formData, setFormData] = useState({
    funcionalidade: '',
    projetoId: ''
  });

  const userData = getUserData();
  const userId = userData.id || '';

  // Carregar projetos do usuário
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await ProjectService.getByUser(userId);
        setProjects(response.data);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
        setError('Erro ao carregar projetos');
      }
    };

    if (userId) {
      loadProjects();
    }
  }, [userId]);

  // Carregar funcionalidades quando projeto é selecionado
  useEffect(() => {
    const loadFuncionalidades = async () => {
      if (selectedProject) {
        try {
          setLoading(true);
          const response = await FuncionalidadeService.list(selectedProject);
          setFuncionalidade(response.data);
          setFormData(prev => ({ ...prev, projetoId: selectedProject }));
        } catch (error: unknown) {
          const err = error as ApiError;
          console.error('Erro detalhado:', err);
          
          if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Data:', err.response.data);
            console.log('Headers:', err.response.headers);
          } else if (err.request) {
            console.log('Request:', err.request);
          }
          
          setError('Erro ao carregar funcionalidade: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadFuncionalidades();
  }, [selectedProject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string | number } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess(false);

  try {
    const payload = {
      funcionalidade: formData.funcionalidade,
      projetoId: selectedProject
    };
    console.log('Payload sendo enviado:', payload);
    if (isEditing && currentId) {
      await FuncionalidadeService.update(selectedProject, currentId, payload);
      setSuccess(true);
    } else {
      await FuncionalidadeService.create(selectedProject, payload);
      setSuccess(true);
    }

    // Recarregar funcionalidades
    const response = await FuncionalidadeService.list(selectedProject);
    setFuncionalidade(response.data);
    
    // Limpar formulário
    setFormData({
      funcionalidade: '',
      projetoId: selectedProject
    });
    setIsEditing(false);
    setCurrentId('');
  } catch (err: unknown) {
    const error = err as ApiError;
    console.error('Erro detalhado:', error.response?.data);
    setError('Erro ao salvar funcionalidade: ' + (error.response?.data?.message || error.message));
  } finally {
    setLoading(false);
  }
};

  const handleEdit = async (id: string) => {
    try {
      const response = await FuncionalidadeService.get(selectedProject, id);
      setFormData({
        funcionalidade: response.data.funcionalidade,
        projetoId: selectedProject
      });
      setIsEditing(true);
      setCurrentId(id);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Erro ao carregar funcionalidade:', err);
      setError('Erro ao carregar funcionalidade para edição: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta funcionalidade?')) {
      try {
        await FuncionalidadeService.delete(selectedProject, id);
        // Recarregar funcionalidade
        const response = await FuncionalidadeService.list(selectedProject);
        setFuncionalidade(response.data);
      } catch (error: unknown) {
        const err = error as ApiError;
        console.error('Erro ao excluir funcionalidade:', err);
        setError('Erro ao excluir funcionalidade: ' + err.message);
      }
    }
  };

  const columns = [
    { id: 'funcionalidade', label: 'Fase', width: '80%' },
    { 
      id: 'acao', 
      label: 'Ação', 
      width: '20%',
      align: 'center' as const
    }
  ];

  const renderCell = (row: Funcionalidade, columnId: string) => {
    switch (columnId) {
      case 'acao':
        return (
          <>
            <IconButton 
              size="small" 
              sx={{ color: '#6CB1E1' }}
              onClick={() => handleEdit(row.id)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ color: '#FF6B6B' }}
              onClick={() => handleDelete(row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        );
      default:
        return row[columnId as keyof Funcionalidade];
    }
  };

  return (
    <>
      <Header />
      <Box display="flex" minHeight="calc(100vh - 64px)">
        <SideMenu />
        
        <Box flex={1} p={3}>
          <Box display="flex" alignItems="center" mb={3}>
            <Button
              component={Link}
              to="/projetos"
              startIcon={<BackIcon />}
              sx={{ mr: 2, color: '#3B84C4' }}
            >
              Voltar
            </Button>
            <Typography variant="h4">
              Funcionalidade Desejada
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Funcionalidade {isEditing ? 'atualizada' : 'cadastrada'} com sucesso!
            </Alert>
          )}

          <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
            <form onSubmit={handleSubmit}>
              <Box 
                display="grid"
                gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }}
                gap={3}
              >
                {/* Projeto */}
                <Box sx={{ gridColumn: { xs: '1', md: '1' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Projeto</InputLabel>
                    <Select
                      name="projetoId"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value as string)}
                      label="Projeto"
                      required
                    >
                      {projects.map((project) => (
                        <MenuItem key={project.id} value={project.id}>
                          {project.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Funcionalidade */}
                <Box sx={{ gridColumn: { xs: '1', md: '2' } }}>
                  <TextField
                    label="Funcionalidade Desejada"
                    name="funcionalidade"
                    value={formData.funcionalidade}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Box>

                {/* Botão de Salvar */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading || !selectedProject}
                    sx={{
                      backgroundColor: '#3B84C4',
                      '&:hover': { backgroundColor: '#6CB1E1' }
                    }}
                  >
                    {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>

          {/* Lista de funcionalidade */}
          <Typography variant="h6" gutterBottom>
            Funcionalidades Cadastradas
          </Typography>
          
          {selectedProject ? (
            funcionalidade.length > 0 ? (
              <DataTable
                columns={columns}
                data={funcionalidade}
                count={funcionalidade.length}
                page={0}
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                renderCell={renderCell}
              />
            ) : (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Não existem funcionalidade cadastradas para o projeto selecionado
                </Typography>
              </Paper>
            )
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Selecione um projeto para visualizar as funcionalidades
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
};

export default FuncionalidadePage;