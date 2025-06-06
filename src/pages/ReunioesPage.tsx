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
  InputAdornment
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as BackIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Link as LinkIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import DataTable from '../components/DataTable';
import { ReunioesService, ProjectService } from '../services/api';
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

interface Reuniao {
  id: string;
  titulo: string;
  dataHora: string;
  link: string;
  observacoes: string;
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

const ReunioesPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    dataHora: new Date(),
    link: '',
    observacoes: '',
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

  // Carregar reuniões quando projeto é selecionado
  useEffect(() => {
    const loadReunioes = async () => {
      if (selectedProject) {
        try {
          setLoading(true);
          const response = await ReunioesService.list(selectedProject);
          setReunioes(response.data);
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
          
          setError('Erro ao carregar reuniões: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadReunioes();
  }, [selectedProject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, dataHora: date }));
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
        dataHora: formData.dataHora.toISOString(),
        link: formData.link,
        observacoes: formData.observacoes,
        projetoId: selectedProject
      };

      if (isEditing && currentId) {
        await ReunioesService.update(selectedProject, currentId, payload);
        setSuccess(true);
      } else {
        await ReunioesService.create(selectedProject, payload);
        setSuccess(true);
      }

      // Recarregar reuniões
      const response = await ReunioesService.list(selectedProject);
      setReunioes(response.data);
      
      // Limpar formulário
      setFormData({
        titulo: '',
        dataHora: new Date(),
        link: '',
        observacoes: '',
        projetoId: selectedProject
      });
      setIsEditing(false);
      setCurrentId('');
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error('Erro ao salvar reunião:', error);
      setError('Erro ao salvar reunião: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await ReunioesService.get(selectedProject, id);
      setFormData({
        titulo: response.data.titulo,
        dataHora: parseISO(response.data.dataHora),
        link: response.data.link,
        observacoes: response.data.observacoes,
        projetoId: selectedProject
      });
      setIsEditing(true);
      setCurrentId(id);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Erro ao carregar reunião:', err);
      setError('Erro ao carregar reunião para edição: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta reunião?')) {
      try {
        await ReunioesService.delete(selectedProject, id);
        // Recarregar reuniões
        const response = await ReunioesService.list(selectedProject);
        setReunioes(response.data);
      } catch (error: unknown) {
        const err = error as ApiError;
        console.error('Erro ao excluir reunião:', err);
        setError('Erro ao excluir reunião: ' + err.message);
      }
    }
  };

  const columns = [
    { id: 'titulo', label: 'Título', width: '25%' },
    { 
      id: 'dataHora', 
      label: 'Data/Hora', 
      width: '20%',
      format: (value: string) => format(parseISO(value), 'dd/MM/yyyy HH:mm')
    },
    { id: 'link', label: 'Link', width: '30%' },
    { 
      id: 'acao', 
      label: 'Ação', 
      width: '10%',
      align: 'center' as const
    }
  ];

  const renderCell = (row: Reuniao, columnId: string) => {
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
      case 'dataHora':
        return format(parseISO(row.dataHora), 'dd/MM/yyyy HH:mm');
      default:
        return row[columnId as keyof Reuniao];
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
              REUNIÕES
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Reunião {isEditing ? 'atualizada' : 'cadastrada'} com sucesso!
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

                {/* Data/Hora */}
                <Box sx={{ gridColumn: { xs: '1', md: '1' } }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                    label="Data e Hora"
                    value={formData.dataHora}
                    onChange={handleDateChange}
                    format="dd/MM/yyyy HH:mm"
                    slotProps={{
                        textField: {
                        fullWidth: true,
                        required: true,
                        },
                    }}
                    />
                </LocalizationProvider>
                </Box>

                {/* Link */}
                <Box sx={{ gridColumn: { xs: '1', md: '2' } }}>
                  <TextField
                    label="Link"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
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

          {/* Lista de Reuniões */}
          <Typography variant="h6" gutterBottom>
            Reuniões Cadastradas
          </Typography>
          
          {selectedProject ? (
            reunioes.length > 0 ? (
              <DataTable
                columns={columns}
                data={reunioes}
                count={reunioes.length}
                page={0}
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                renderCell={renderCell}
              />
            ) : (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Não existem reuniões cadastradas para o projeto selecionado
                </Typography>
              </Paper>
            )
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Selecione um projeto para visualizar as reuniões
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
};

export default ReunioesPage;