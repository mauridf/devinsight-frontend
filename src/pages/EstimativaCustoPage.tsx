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
  IconButton,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon, Edit as EditIcon, Delete as DeleteIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import DataTable from '../components/DataTable';
import { EstimativasCustosService, ProjectService } from '../services/api';

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

interface EstimativaCusto {
  id: string;
  item: string;
  estimativaHoras: number;
  valorHoras: number;
  custoEstimado: number;
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

const EstimativaCustoPage: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [estimativas, setEstimativas] = useState<EstimativaCusto[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');

  const [formData, setFormData] = useState({
    item: '',
    estimativaHoras: 1,
    valorHoras: 0,
    custoEstimado: 0,
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

  // Carregar estimativas quando projeto é selecionado
  useEffect(() => {
    const loadEstimativas = async () => {
      if (selectedProject) {
        try {
          setLoading(true);
          const response = await EstimativasCustosService.list(selectedProject);
          setEstimativas(response.data);
          setFormData(prev => ({ ...prev, projetoId: selectedProject }));
        } catch (error: unknown) {
          const err = error as ApiError;
          console.error('Erro detalhado:', err);
          setError('Erro ao carregar estimativas: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadEstimativas();
  }, [selectedProject]);

  // Calcula custo estimado automaticamente
  useEffect(() => {
    const custo = formData.estimativaHoras * formData.valorHoras;
    setFormData(prev => ({ ...prev, custoEstimado: custo }));
  }, [formData.estimativaHoras, formData.valorHoras]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'estimativaHoras' || name === 'valorHoras' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        item: formData.item,
        estimativaHoras: formData.estimativaHoras,
        valorHoras: formData.valorHoras,
        custoEstimado: formData.custoEstimado,
        projetoId: selectedProject
      };

      if (isEditing && currentId) {
        await EstimativasCustosService.update(selectedProject, currentId, payload);
        setSuccess(true);
      } else {
        await EstimativasCustosService.create(selectedProject, payload);
        setSuccess(true);
      }

      // Recarregar estimativas
      const response = await EstimativasCustosService.list(selectedProject);
      setEstimativas(response.data);
      
      // Limpar formulário
      resetForm();
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error('Erro detalhado:', error.response?.data);
      setError('Erro ao salvar estimativa: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await EstimativasCustosService.get(selectedProject, id);
      setFormData({
        item: response.data.item,
        estimativaHoras: response.data.estimativaHoras,
        valorHoras: response.data.valorHoras,
        custoEstimado: response.data.custoEstimado,
        projetoId: selectedProject
      });
      setIsEditing(true);
      setCurrentId(id);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Erro ao carregar estimativa:', err);
      setError('Erro ao carregar estimativa para edição: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta estimativa?')) {
      try {
        await EstimativasCustosService.delete(selectedProject, id);
        // Recarregar estimativas
        const response = await EstimativasCustosService.list(selectedProject);
        setEstimativas(response.data);
      } catch (error: unknown) {
        const err = error as ApiError;
        console.error('Erro ao excluir estimativa:', err);
        setError('Erro ao excluir estimativa: ' + err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      item: '',
      estimativaHoras: 1,
      valorHoras: 0,
      custoEstimado: 0,
      projetoId: selectedProject
    });
    setIsEditing(false);
    setCurrentId('');
  };

  const columns = [
    { id: 'item', label: 'Item', width: '30%' },
    { id: 'estimativaHoras', label: 'Horas', width: '15%' },
    { id: 'valorHoras', label: 'Valor/Hora', width: '15%' },
    { id: 'custoEstimado', label: 'Custo Estimado', width: '20%' },
    { 
      id: 'acao', 
      label: 'Ação', 
      width: '20%',
      align: 'center' as const
    }
  ];

  const renderCell = (row: EstimativaCusto, columnId: string) => {
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
      case 'custoEstimado':
        const value = row.custoEstimado;
        return typeof value === 'number' ? `R$ ${value.toFixed(2)}` : '-';
      default:
        return row[columnId as keyof EstimativaCusto];
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
              ESTIMATIVAS/CUSTOS
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Estimativa {isEditing ? 'atualizada' : 'cadastrada'} com sucesso!
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

                {/* Item */}
                <Box sx={{ gridColumn: { xs: '1', md: '2' } }}>
                  <TextField
                    label="Item"
                    name="item"
                    value={formData.item}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Box>

                {/* Estimativa Horas */}
                <Box sx={{ gridColumn: { xs: '1', md: '1' } }}>
                  <TextField
                    label="Estimativa (Horas)"
                    name="estimativaHoras"
                    type="number"
                    value={formData.estimativaHoras}
                    onChange={handleChange}
                    fullWidth
                    required
                    inputProps={{ min: 1 }}
                    variant="outlined"
                  />
                </Box>

                {/* Valor por Hora */}
                <Box sx={{ gridColumn: { xs: '1', md: '1' } }}>
                  <TextField
                    label="Valor por Hora (R$)"
                    name="valorHoras"
                    type="number"
                    value={formData.valorHoras}
                    onChange={handleChange}
                    fullWidth
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                    variant="outlined"
                  />
                </Box>

                {/* Custo Estimado */}
                <Box sx={{ gridColumn: { xs: '1', md: '1' } }}>
                  <TextField
                    label="Custo Estimado (R$)"
                    name="custoEstimado"
                    value={formData.custoEstimado.toFixed(2)}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                    variant="outlined"
                  />
                </Box>

                {/* Botões */}
                <Box sx={{ gridColumn: '1 / -1', display: 'flex', gap: 2 }}>
                  {isEditing && (
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={resetForm}
                      sx={{ color: '#3B84C4' }}
                    >
                      Cancelar
                    </Button>
                  )}
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

          {/* Lista de Estimativas */}
          <Typography variant="h6" gutterBottom>
            Estimativas Cadastradas
          </Typography>
          
          {selectedProject ? (
            loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : estimativas.length > 0 ? (
              <DataTable
                columns={columns}
                data={estimativas}
                count={estimativas.length}
                page={0}
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                renderCell={renderCell}
              />
            ) : (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Não existem estimativas/custos cadastrados para o projeto selecionado
                </Typography>
              </Paper>
            )
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Selecione um projeto para visualizar as estimativas
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
};

export default EstimativaCustoPage;