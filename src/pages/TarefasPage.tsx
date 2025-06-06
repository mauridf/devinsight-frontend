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
import { TarefasService, ProjectService } from '../services/api';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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

interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  observacoes: string;
  status: number;
  dataEntrega: string;
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

const TarefasPage: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    observacoes: '',
    status: 0,
    dataEntrega: new Date(),
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

  // Carregar tarefas quando projeto é selecionado
  useEffect(() => {
    const loadTarefas = async () => {
      if (selectedProject) {
        try {
          setLoading(true);
          const response = await TarefasService.list(selectedProject);
          setTarefas(response.data);
          setFormData(prev => ({ ...prev, projetoId: selectedProject }));
        } catch (error: unknown) {
          const err = error as ApiError;
          console.error('Erro detalhado:', err);
          setError('Erro ao carregar tarefas: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadTarefas();
  }, [selectedProject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (e: any) => {
    const value = Number(e.target.value);
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, dataEntrega: date }));
    }
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
        observacoes: formData.observacoes,
        status: formData.status,
        // dataEntrega: format(formData.dataEntrega, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
        dataEntrega: formData.dataEntrega.toISOString(),
        projetoId: selectedProject
      };
      console.log('Payload sendo enviado:', payload);
      if (isEditing && currentId) {
        await TarefasService.update(selectedProject, currentId, payload);
        setSuccess(true);
      } else {
        await TarefasService.create(selectedProject, payload);
        setSuccess(true);
      }

      // Recarregar tarefas
      const response = await TarefasService.list(selectedProject);
      setTarefas(response.data);
      
      // Limpar formulário
      resetForm();
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error('Erro detalhado:', error.response?.data);
      setError('Erro ao salvar tarefa: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await TarefasService.get(selectedProject, id);
      setFormData({
        titulo: response.data.titulo,
        descricao: response.data.descricao,
        observacoes: response.data.observacoes || '',
        status: response.data.status,
        dataEntrega: parseISO(response.data.dataEntrega),
        projetoId: selectedProject
      });
      setIsEditing(true);
      setCurrentId(id);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Erro ao carregar tarefa:', err);
      setError('Erro ao carregar tarefa para edição: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await TarefasService.delete(selectedProject, id);
        // Recarregar tarefas
        const response = await TarefasService.list(selectedProject);
        setTarefas(response.data);
      } catch (error: unknown) {
        const err = error as ApiError;
        console.error('Erro ao excluir tarefa:', err);
        setError('Erro ao excluir tarefa: ' + err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      observacoes: '',
      status: 0,
      dataEntrega: new Date(),
      projetoId: selectedProject
    });
    setIsEditing(false);
    setCurrentId('');
  };

  const columns = [
    { id: 'titulo', label: 'Título', width: '25%' },
    { id: 'descricao', label: 'Descrição', width: '30%' },
    { 
      id: 'status', 
      label: 'Status', 
      width: '15%',
      format: (value: number) => {
        switch(value) {
          case 0: return 'Pendente';
          case 1: return 'Em Andamento';
          case 2: return 'Em Impedimento';
          case 3: return 'Em Pausa';
          case 4: return 'Feito';
          default: return 'Desconhecido';
        }
      }
    },
    { 
      id: 'dataEntrega', 
      label: 'Data Entrega', 
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

  const renderCell = (row: Tarefa, columnId: string) => {
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
      case 'status':
        switch(row.status) {
          case 0: return 'Pendente';
          case 1: return 'Em Andamento';
          case 2: return 'Em Impedimento';
          case 3: return 'Em Pausa';
          case 4: return 'Feito';
          default: return 'Desconhecido';
        }
      case 'dataEntrega':
        return format(parseISO(row.dataEntrega), 'dd/MM/yyyy');
      default:
        return row[columnId as keyof Tarefa];
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
              TAREFAS
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Tarefa {isEditing ? 'atualizada' : 'cadastrada'} com sucesso!
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

                {/* Status */}
                <Box sx={{ gridColumn: { xs: '1', md: '1' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={handleStatusChange}
                      label="Status"
                      required
                    >
                      <MenuItem value={0}>Pendente</MenuItem>
                      <MenuItem value={1}>Em Andamento</MenuItem>
                      <MenuItem value={2}>Em Impedimento</MenuItem>
                      <MenuItem value={3}>Em Pausa</MenuItem>
                      <MenuItem value={4}>Feito</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Data Entrega */}
                <Box sx={{ gridColumn: { xs: '1', md: '2' } }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="Data de Entrega"
                      value={formData.dataEntrega}
                      onChange={handleDateChange}
                      format="dd/MM/yyyy"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>

                {/* Observações */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="Observações"
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
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

          {/* Lista de Tarefas */}
          <Typography variant="h6" gutterBottom>
            Tarefas Cadastradas
          </Typography>
          
          {selectedProject ? (
            loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : tarefas.length > 0 ? (
              <DataTable
                columns={columns}
                data={tarefas}
                count={tarefas.length}
                page={0}
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                renderCell={renderCell}
              />
            ) : (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Não existem tarefas cadastradas para o projeto selecionado
                </Typography>
              </Paper>
            )
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Selecione um projeto para visualizar as tarefas
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
};

export default TarefasPage;