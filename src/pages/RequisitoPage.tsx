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
import { RequisitosService, ProjectService } from '../services/api';

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

interface Requisito {
  id: string;
  tipoRequisito: number; // 0 para Funcional, 1 para Não Funcional
  descricao: string;
  projetoId: string;
}

interface Project {
  id: string;
  nome: string;
}

// Funções para conversão entre número e string
const tipoToString = (tipo: number): string => {
//   return tipo === 0 ? 'Funcional' : 'Não Funcional';
  switch (tipo) {
    case 0: return 'Funcional';
    case 1: return 'Não Funcional';
    default: return 'Funcional';
  }
};

const stringToTipo = (tipo: string): number => {
  switch (tipo) {
    case 'Funcional': return 0;
    case 'Não Funcional': return 1;
    default: return 0;
  }
};

const getUserData = (): UserData => {
  try {
    const userString = localStorage.getItem('user');
    if (userString) return JSON.parse(userString) as UserData;
  } catch (error) {
    console.error('Erro ao ler dados do usuário:', error);
  }
  return {};
};

const RequisitosPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [requisitos, setRequisitos] = useState<Requisito[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');

  const [formData, setFormData] = useState({
    tipo: 'Funcional',
    descricao: '',
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

  // Carregar requisitos quando projeto é selecionado
  useEffect(() => {
    const loadRequisitos = async () => {
      if (selectedProject) {
        try {
          setLoading(true);
          const response = await RequisitosService.list(selectedProject);
          const requisitosFormatados = response.data.map((req: any) => ({
            id: req.id,
            tipoRequisito: req.tipoRequisito, // Mapeando corretamente
            descricao: req.descricao,
            projetoId: selectedProject,
            criadoEm: req.criadoEm // Opcional
          }));
          setRequisitos(response.data);
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
          
          setError('Erro ao carregar requisitos: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadRequisitos();
  }, [selectedProject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
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
        tipoRequisito: stringToTipo(formData.tipo),
        descricao: formData.descricao,
        projetoId: selectedProject
      };

      if (isEditing && currentId) {
        await RequisitosService.update(selectedProject, currentId, payload);
        setSuccess(true);
      } else {
        await RequisitosService.create(selectedProject, payload);
        setSuccess(true);
      }

      // Recarregar requisitos
      const response = await RequisitosService.list(selectedProject);
      setRequisitos(response.data);
      
      // Limpar formulário
      setFormData({
        tipo: 'Funcional',
        descricao: '',
        projetoId: selectedProject
      });
      setIsEditing(false);
      setCurrentId('');
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error('Erro ao salvar requisito:', error);
      setError('Erro ao salvar requisito: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await RequisitosService.get(selectedProject, id);
      setFormData({
        tipo: tipoToString(response.data.tipoRequisito),
        descricao: response.data.descricao,
        projetoId: selectedProject
      });
      setIsEditing(true);
      setCurrentId(id);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Erro ao carregar requisito:', err);
      setError('Erro ao carregar requisito para edição: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este requisito?')) {
      try {
        await RequisitosService.delete(selectedProject, id);
        // Recarregar requisitos
        const response = await RequisitosService.list(selectedProject);
        setRequisitos(response.data);
      } catch (error: unknown) {
        const err = error as ApiError;
        console.error('Erro ao excluir requisito:', err);
        setError('Erro ao excluir requisito: ' + err.message);
      }
    }
  };

  const columns = [
    { id: 'tipo', label: 'Tipo', width: '20%', format: (value: number) => tipoToString(value) },
    { id: 'descricao', label: 'Descrição', width: '70%' },
    { 
      id: 'acao', 
      label: 'Ação', 
      width: '10%',
      align: 'center' as const
    }
  ];

  const renderCell = (row: Requisito, columnId: string) => {
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
        return tipoToString(row.tipoRequisito);
      default:
        return row[columnId as keyof Requisito];
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
              REQUISITOS DO PROJETO
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Requisito {isEditing ? 'atualizado' : 'cadastrado'} com sucesso!
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

                {/* Tipo */}
                <Box sx={{ gridColumn: { xs: '1', md: '2' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Requisito</InputLabel>
                    <Select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      label="Tipo de Requisito"
                      required
                    >
                      <MenuItem value="Funcional">Funcional</MenuItem>
                      <MenuItem value="Não Funcional">Não Funcional</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Descrição */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="Descrição"
                    name="descricao"
                    value={formData.descricao}
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

          {/* Lista de Requisitos */}
          <Typography variant="h6" gutterBottom>
            Requisitos Cadastrados
          </Typography>
          
          {selectedProject ? (
            requisitos.length > 0 ? (
              <DataTable
                columns={columns}
                data={requisitos}
                count={requisitos.length}
                page={0}
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                renderCell={renderCell}
              />
            ) : (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Não existem requisitos cadastrados para o projeto selecionado
                </Typography>
              </Paper>
            )
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Selecione um projeto para visualizar os requisitos
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
};

export default RequisitosPage;