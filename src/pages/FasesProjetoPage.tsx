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
import { FasesProjetoService, ProjectService } from '../services/api';

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

interface FaseProjeto {
  id: string;
  fase: string;
  objetivo: string;
  duracaoEstimada: number;
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

const FasesProjetoPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [fasesProjeto, setFasesProjeto] = useState<FaseProjeto[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');

  const [formData, setFormData] = useState({
    fase: '',
    objetivo: '',
    duracaoEstimada: 1,
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

  // Carregar fases do projeto quando projeto é selecionado
  useEffect(() => {
    const loadFasesProjeto = async () => {
      if (selectedProject) {
        try {
          setLoading(true);
          const response = await FasesProjetoService.list(selectedProject);
          setFasesProjeto(response.data);
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
          
          setError('Erro ao carregar fases do projeto: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadFasesProjeto();
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
      fase: formData.fase,
      objetivo: formData.objetivo,
      duracaoEstimada: Number(formData.duracaoEstimada),
      projetoId: selectedProject
    };
    console.log('Payload sendo enviado:', payload);
    if (isEditing && currentId) {
      await FasesProjetoService.update(selectedProject, currentId, payload);
      setSuccess(true);
    } else {
      await FasesProjetoService.create(selectedProject, payload);
      setSuccess(true);
    }

    // Recarregar fases do projeto
    const response = await FasesProjetoService.list(selectedProject);
    setFasesProjeto(response.data);
    
    // Limpar formulário
    setFormData({
      fase: '',
      objetivo: '',
      duracaoEstimada: 1,
      projetoId: selectedProject
    });
    setIsEditing(false);
    setCurrentId('');
  } catch (err: unknown) {
    const error = err as ApiError;
    console.error('Erro detalhado:', error.response?.data);
    setError('Erro ao salvar fase do projeto: ' + (error.response?.data?.message || error.message));
  } finally {
    setLoading(false);
  }
};

  const handleEdit = async (id: string) => {
    try {
      const response = await FasesProjetoService.get(selectedProject, id);
      setFormData({
        fase: response.data.fase,
        objetivo: response.data.objetivo,
        duracaoEstimada: response.data.duracaoEstimada,
        projetoId: selectedProject
      });
      setIsEditing(true);
      setCurrentId(id);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Erro ao carregar fase do projeto:', err);
      setError('Erro ao carregar fase do projeto para edição: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta fase do projeto?')) {
      try {
        await FasesProjetoService.delete(selectedProject, id);
        // Recarregar fases do projeto
        const response = await FasesProjetoService.list(selectedProject);
        setFasesProjeto(response.data);
      } catch (error: unknown) {
        const err = error as ApiError;
        console.error('Erro ao excluir fase do projeto:', err);
        setError('Erro ao excluir fase do projeto: ' + err.message);
      }
    }
  };

  const columns = [
    { id: 'fase', label: 'Fase', width: '25%' },
    { id: 'objetivo', label: 'Objetivo', width: '40%' },
    { id: 'duracaoEstimada', label: 'Duração (semanas)', width: '15%' },
    { 
      id: 'acao', 
      label: 'Ação', 
      width: '20%',
      align: 'center' as const
    }
  ];

  const renderCell = (row: FaseProjeto, columnId: string) => {
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
        return row[columnId as keyof FaseProjeto];
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
              FASES DO PROJETO
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Fase do projeto {isEditing ? 'atualizada' : 'cadastrada'} com sucesso!
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

                {/* Fase */}
                <Box sx={{ gridColumn: { xs: '1', md: '2' } }}>
                  <TextField
                    label="Fase"
                    name="fase"
                    value={formData.fase}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Box>

                {/* Duração Estimada */}
                <Box sx={{ gridColumn: { xs: '1', md: '2' } }}>
                  <TextField
                    label="Duração Estimada (semanas)"
                    name="duracaoEstimada"
                    type="number"
                    value={formData.duracaoEstimada}
                    onChange={handleChange}
                    fullWidth
                    required
                    inputProps={{ min: 1 }}
                    variant="outlined"
                  />
                </Box>

                {/* Objetivo */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="Objetivo"
                    name="objetivo"
                    value={formData.objetivo}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
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

          {/* Lista de Fases do Projeto */}
          <Typography variant="h6" gutterBottom>
            Fases do Projeto Cadastradas
          </Typography>
          
          {selectedProject ? (
            fasesProjeto.length > 0 ? (
              <DataTable
                columns={columns}
                data={fasesProjeto}
                count={fasesProjeto.length}
                page={0}
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                renderCell={renderCell}
              />
            ) : (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Não existem fases do projeto cadastradas para o projeto selecionado
                </Typography>
              </Paper>
            )
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Selecione um projeto para visualizar as fases
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
};

export default FasesProjetoPage;