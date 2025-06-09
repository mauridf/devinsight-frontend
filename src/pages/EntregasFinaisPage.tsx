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
import { 
  Save as SaveIcon, 
  ArrowBack as BackIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import DataTable from '../components/DataTable';
import { EntregasFinaisService, ProjectService } from '../services/api';
import { format, parseISO } from 'date-fns';

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

interface EntregaFinal {
  id: string;
  titulo: string;
  descricao: string;
  urlEntrega: string;
  tipo: number;
  criadoEm: string;
  projetoId: string;
}

interface Project {
  id: string;
  nome: string;
}

const tipoEntregaMap = [
  { id: 0, label: 'Markdown' },
  { id: 1, label: 'PDF' },
  { id: 2, label: 'DOC' },
  { id: 3, label: 'Link' },
  { id: 4, label: 'ZIP' },
  { id: 5, label: 'Outro' }
];

const getUserData = (): UserData => {
  try {
    const userString = localStorage.getItem('user');
    if (userString) return JSON.parse(userString) as UserData;
  } catch (error) {
    console.error('Erro ao ler dados do usuário:', error);
  }
  return {};
};

const EntregasFinaisPage: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [entregas, setEntregas] = useState<EntregaFinal[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    urlEntrega: '',
    tipo: 0,
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

  // Carregar entregas quando projeto é selecionado
  useEffect(() => {
    const loadEntregas = async () => {
      if (selectedProject) {
        try {
          setLoading(true);
          const response = await EntregasFinaisService.list(selectedProject);
          setEntregas(response.data);
          setFormData(prev => ({ ...prev, projetoId: selectedProject }));
        } catch (error: unknown) {
          const err = error as ApiError;
          console.error('Erro detalhado:', err);
          setError('Erro ao carregar entregas finais: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadEntregas();
  }, [selectedProject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTipoChange = (e: any) => {
    const value = Number(e.target.value);
    setFormData(prev => ({ ...prev, tipo: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        urlEntrega: formData.urlEntrega,
        tipo: formData.tipo,
        projetoId: selectedProject
      };

      if (isEditing && currentId) {
        await EntregasFinaisService.update(selectedProject, currentId, payload);
        setSuccess(true);
      } else {
        await EntregasFinaisService.create(selectedProject, payload);
        setSuccess(true);
      }

      // Recarregar entregas
      const response = await EntregasFinaisService.list(selectedProject);
      setEntregas(response.data);
      
      // Limpar formulário
      resetForm();
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error('Erro detalhado:', error.response?.data);
      setError('Erro ao salvar entrega final: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await EntregasFinaisService.get(selectedProject, id);
      setFormData({
        titulo: response.data.titulo,
        descricao: response.data.descricao,
        urlEntrega: response.data.urlEntrega,
        tipo: response.data.tipo,
        projetoId: selectedProject
      });
      setIsEditing(true);
      setCurrentId(id);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Erro ao carregar entrega final:', err);
      setError('Erro ao carregar entrega para edição: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta entrega final?')) {
      try {
        await EntregasFinaisService.delete(selectedProject, id);
        // Recarregar entregas
        const response = await EntregasFinaisService.list(selectedProject);
        setEntregas(response.data);
      } catch (error: unknown) {
        const err = error as ApiError;
        console.error('Erro ao excluir entrega final:', err);
        setError('Erro ao excluir entrega final: ' + err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      urlEntrega: '',
      tipo: 0,
      projetoId: selectedProject
    });
    setIsEditing(false);
    setCurrentId('');
  };

  const columns = [
    { id: 'titulo', label: 'Título', width: '25%' },
    { id: 'descricao', label: 'Descrição', width: '30%' },
    { id: 'urlEntrega', label: 'URL', width: '20%' },
    { 
      id: 'tipo', 
      label: 'Tipo', 
      width: '15%',
      format: (value: number) => tipoEntregaMap.find(t => t.id === value)?.label || 'Desconhecido'
    },
    { 
      id: 'criadoEm', 
      label: 'Criado em', 
      width: '15%',
      format: (value: string) => format(parseISO(value), 'dd/MM/yyyy')
    },
    { 
      id: 'acao', 
      label: 'Ação', 
      width: '15%',
      align: 'center' as const
    }
  ];

  const renderCell = (row: EntregaFinal, columnId: string) => {
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
      case 'tipo':
        return tipoEntregaMap.find(t => t.id === row.tipo)?.label || 'Desconhecido';
      case 'criadoEm':
        return format(parseISO(row.criadoEm), 'dd/MM/yyyy');
      default:
        return row[columnId as keyof EntregaFinal];
    }
  };

  return (
    <>
      <Header />
      <Box display="flex" minHeight="calc(100vh - 64px)">
        <SideMenu />
        
        <Box component="main" flex={1} p={3} sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 64px)', width: 'calc(100% - 240px)' }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Button
              component={Link}
              to="/entregas"
              startIcon={<BackIcon />}
              sx={{ mr: 2, color: '#3B84C4' }}
            >
              Voltar
            </Button>
            <Typography variant="h4">
              ENTREGAS FINAIS
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Entrega final {isEditing ? 'atualizada' : 'cadastrada'} com sucesso!
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

                {/* Título */}
                <Box sx={{ gridColumn: { xs: '1', md: '2' } }}>
                  <TextField
                    label="Título"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Box>

                {/* Descrição */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="Descrição"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    fullWidth
                    required
                    multiline
                    rows={2}
                    variant="outlined"
                  />
                </Box>

                {/* URL */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="URL do Documento"
                    name="urlEntrega"
                    value={formData.urlEntrega}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Box>

                {/* Tipo */}
                <Box sx={{ gridColumn: { xs: '1', md: '1' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={formData.tipo}
                      onChange={handleTipoChange}
                      label="Tipo"
                      required
                    >
                      {tipoEntregaMap.map((tipo) => (
                        <MenuItem key={tipo.id} value={tipo.id}>
                          {tipo.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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

          {/* Lista de Entregas Finais */}
          <Typography variant="h6" gutterBottom>
            Entregas Finais Cadastradas
          </Typography>
          
          {selectedProject ? (
            loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : entregas.length > 0 ? (
              <DataTable
                columns={columns}
                data={entregas}
                count={entregas.length}
                page={0}
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                renderCell={renderCell}
              />
            ) : (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Não existem entregas finais cadastradas para o projeto selecionado
                </Typography>
              </Paper>
            )
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Selecione um projeto para visualizar as entregas finais
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
};

export default EntregasFinaisPage;