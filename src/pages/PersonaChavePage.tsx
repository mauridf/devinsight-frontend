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
import { Save as SaveIcon, ArrowBack as BackIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import DataTable from '../components/DataTable';
import { KeyPersonaService, ProjectService } from '../services/api';

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

interface PersonaChave {
  id: string;
  persona: string;
  perfil: string; 
  tipo: string;   
  necessidade: string;
  projetoId: string;
}

interface Project {
  id: string;
  nome: string;
}

// Enum mapeadores para converter entre string e número
const perfilToNumber = (perfil: string): number => {
  switch (perfil) {
    case 'Interno': return 0;
    case 'Visitante': return 1;
    case 'Administrativo': return 2;
    case 'Externo': return 3;
    default: return 0;
  }
};

const tipoToNumber = (tipo: string): number => {
  switch (tipo) {
    case 'Tecnico': return 0;
    case 'NaoTecnico': return 1;
    default: return 0;
  }
};

// Funções para converter de número para string (para exibição)
const numberToPerfil = (num: number): string => {
  switch (num) {
    case 0: return 'Interno';
    case 1: return 'Visitante';
    case 2: return 'Administrativo';
    case 3: return 'Externo';
    default: return 'Interno';
  }
};

const numberToTipo = (num: number): string => {
  switch (num) {
    case 0: return 'Tecnico';
    case 1: return 'NaoTecnico';
    default: return 'Tecnico';
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

const PersonaChavePage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [personas, setPersonas] = useState<PersonaChave[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');

  const [formData, setFormData] = useState({
    persona: '',
    perfil: 'Interno', // Valor inicial definido explicitamente
    tipo: 'Tecnico',   // Valor inicial definido explicitamente
    necessidade: '',
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

  // Carregar personas quando projeto é selecionado
  useEffect(() => {
    const loadPersonas = async () => {
      if (selectedProject) {
        try {
          setLoading(true);
          const response = await KeyPersonaService.list(selectedProject);
          // Converter os valores numéricos de volta para strings para exibição
          const convertedPersonas = response.data.map((persona: any) => ({
            ...persona,
            perfil: numberToPerfil(persona.perfil),
            tipo: numberToTipo(persona.tipo)
          }));
          setPersonas(convertedPersonas);
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
          
          setError('Erro ao carregar personas chave: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPersonas();
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
      // Preparar os dados para enviar, convertendo os enums para números
      const payload = {
        ...formData,
        perfil: perfilToNumber(formData.perfil),
        tipo: tipoToNumber(formData.tipo),
        projetoId: selectedProject
      };

      if (isEditing && currentId) {
        await KeyPersonaService.update(selectedProject, currentId, payload);
        setSuccess(true);
      } else {
        await KeyPersonaService.create(selectedProject, payload);
        setSuccess(true);
      }

      // Recarregar personas
      const response = await KeyPersonaService.list(selectedProject);
      const convertedPersonas = response.data.map((persona: any) => ({
        ...persona,
        perfil: numberToPerfil(persona.perfil),
        tipo: numberToTipo(persona.tipo)
      }));
      setPersonas(convertedPersonas);
      
      // Limpar formulário
      setFormData({
        persona: '',
        perfil: '' as PersonaChave['perfil'],
        tipo: '' as PersonaChave['tipo'],
        necessidade: '',
        projetoId: selectedProject
      });
      setIsEditing(false);
      setCurrentId('');
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error('Erro ao salvar persona:', error);
      setError('Erro ao salvar persona chave: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await KeyPersonaService.get(selectedProject, id);
      // Converter os valores numéricos de volta para strings para o formulário
      setFormData({
        persona: response.data.persona,
        perfil: numberToPerfil(response.data.perfil),
        tipo: numberToTipo(response.data.tipo),
        necessidade: response.data.necessidade,
        projetoId: selectedProject
      });
      setIsEditing(true);
      setCurrentId(id);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Erro ao carregar persona:', err);
      setError('Erro ao carregar persona para edição: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta persona chave?')) {
      try {
        await KeyPersonaService.delete(selectedProject, id);
        // Recarregar personas
        const response = await KeyPersonaService.list(selectedProject);
        const convertedPersonas = response.data.map((persona: any) => ({
          ...persona,
          perfil: numberToPerfil(persona.perfil),
          tipo: numberToTipo(persona.tipo)
        }));
        setPersonas(convertedPersonas);
      } catch (error: unknown) {
        const err = error as ApiError;
        console.error('Erro ao excluir persona:', err);
        setError('Erro ao excluir persona chave: ' + err.message);
      }
    }
  };

  const columns = [
    { id: 'persona', label: 'Persona', width: '25%' },
    { id: 'perfil', label: 'Perfil', width: '20%' },
    { id: 'tipo', label: 'Tipo', width: '20%' },
    { id: 'necessidade', label: 'Necessidade', width: '25%' },
    { 
      id: 'acao', 
      label: 'Ação', 
      width: '10%',
      align: 'center' as const
    }
  ];

  const renderCell = (row: PersonaChave, columnId: string) => {
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
        return row[columnId as keyof PersonaChave];
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
              PERSONAS CHAVE
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Persona chave {isEditing ? 'atualizada' : 'cadastrada'} com sucesso!
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

                {/* Persona */}
                <Box sx={{ gridColumn: { xs: '1', md: '2' } }}>
                  <TextField
                    label="Persona"
                    name="persona"
                    value={formData.persona}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Box>

                {/* Perfil */}
                <Box sx={{ gridColumn: { xs: '1', md: '1' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Perfil</InputLabel>
                    <Select
                      name="perfil"
                      value={formData.perfil}
                      onChange={handleChange}
                      label="Perfil"
                      required
                    >
                      <MenuItem value="Interno">Interno</MenuItem>
                      <MenuItem value="Visitante">Visitante</MenuItem>
                      <MenuItem value="Administrativo">Administrativo</MenuItem>
                      <MenuItem value="Externo">Externo</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Tipo */}
                <Box sx={{ gridColumn: { xs: '1', md: '2' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      label="Tipo"
                      required
                    >
                      <MenuItem value="Tecnico">Técnico</MenuItem>
                      <MenuItem value="NaoTecnico">Não Técnico</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Necessidade */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="Necessidade"
                    name="necessidade"
                    value={formData.necessidade}
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

          {/* Lista de Personas */}
          <Typography variant="h6" gutterBottom>
            Personas Chave Cadastradas
          </Typography>
          
          {selectedProject ? (
            personas.length > 0 ? (
              <DataTable
                columns={columns}
                data={personas}
                count={personas.length}
                page={0}
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                renderCell={renderCell}
              />
            ) : (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Não existe Persona Chave cadastrada para o projeto selecionado
                </Typography>
              </Paper>
            )
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Selecione um projeto para visualizar as personas chave
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
};

export default PersonaChavePage;