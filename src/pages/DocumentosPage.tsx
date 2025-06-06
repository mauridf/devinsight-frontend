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
import { DocumentosService, ProjectService } from '../services/api';

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

interface Documentos {
  id: string;
  tipoDocumento: number; // Miro = 0, Lucidchart = 1, Drawio = 2,Whimsical = 3,Loom = 4,Figma =5,Api = 6,Github = 7,Outro = 8
  descricao: string;
  url: string;
  projetoId: string;
}

interface Project {
  id: string;
  nome: string;
}

// Funções para conversão entre número e string
const tipoToString = (tipo: number): string => {
  switch (tipo) {
    case 0: return 'Miro';
    case 1: return 'Lucidchart';
    case 2: return 'Drawio';
    case 3: return 'Whimsical';
    case 4: return 'Loom';
    case 5: return 'Figma';
    case 6: return 'Api';
    case 7: return 'Github';
    case 8: return 'Outro';
    default: return 'Outro';
  }
};

const stringToTipo = (tipo: string): number => {
  switch (tipo) {
    case 'Miro': return 0;
    case 'Lucidchart': return 1;
    case 'Drawio': return 2;
    case 'Whimsical': return 3;
    case 'Loom': return 4;
    case 'Figma': return 5;
    case 'Api': return 6;  
    case 'Github': return 7; 
    case 'Outro': return 8;
    default: return 8;
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

const DocumentosPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [documentos, setDocumentos] = useState<Documentos[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');

  const [formData, setFormData] = useState({
    tipo: 'Outro',
    descricao: '',
    url: '',
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

  // Carregar documentos quando projeto é selecionado
  useEffect(() => {
    const loadDocumentos = async () => {
      if (selectedProject) {
        try {
          setLoading(true);
          const response = await DocumentosService.list(selectedProject);
          const documentosFormatados = response.data.map((doc: any) => ({
            id: doc.id,
            tipoDocumento: doc.tipoDocumento, // Mapeando corretamente
            descricao: doc.descricao,
            url: doc.url,
            projetoId: selectedProject,
            criadoEm: doc.criadoEm // Opcional
          }));
          setDocumentos(response.data);
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

    loadDocumentos();
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
        tipoDocumento: stringToTipo(formData.tipo),
        descricao: formData.descricao,
        url: formData.url,
        projetoId: selectedProject
      };

      if (isEditing && currentId) {
        await DocumentosService.update(selectedProject, currentId, payload);
        setSuccess(true);
      } else {
        await DocumentosService.create(selectedProject, payload);
        setSuccess(true);
      }

      // Recarregar documentos
      const response = await DocumentosService.list(selectedProject);
      setDocumentos(response.data);
      
      // Limpar formulário
      setFormData({
        tipo: 'Outro',
        descricao: '',
        url: '',
        projetoId: selectedProject
      });
      setIsEditing(false);
      setCurrentId('');
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error('Erro ao salvar link documento:', error);
      setError('Erro ao salvar link documento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await DocumentosService.get(selectedProject, id);
      setFormData({
        tipo: tipoToString(response.data.tipoDocumento),
        descricao: response.data.descricao,
        url: response.data.url,
        projetoId: selectedProject
      });
      setIsEditing(true);
      setCurrentId(id);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Erro ao carregar link documento:', err);
      setError('Erro ao carregar link documento para edição: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este link documento?')) {
      try {
        await DocumentosService.delete(selectedProject, id);
        // Recarregar link documento
        const response = await DocumentosService.list(selectedProject);
        setDocumentos(response.data);
      } catch (error: unknown) {
        const err = error as ApiError;
        console.error('Erro ao excluir link documento:', err);
        setError('Erro ao excluir link documento: ' + err.message);
      }
    }
  };

  const columns = [
    { id: 'tipo', label: 'Tipo de Documento', width: '20%', format: (value: number) => tipoToString(value) },
    { id: 'descricao', label: 'Descrição', width: '35%' },
    { id: 'url', label: 'URL', width: '35%' },
    { 
      id: 'acao', 
      label: 'Ação', 
      width: '10%',
      align: 'center' as const
    }
  ];

  const renderCell = (row: Documentos, columnId: string) => {
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
        return tipoToString(row.tipoDocumento);
      default:
        return row[columnId as keyof Documentos];
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
              LINKS DOS DOCUMENTOS
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Link do Documento {isEditing ? 'atualizado' : 'cadastrado'} com sucesso!
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

                {/* Tipo de Documento */}
                <Box sx={{ gridColumn: { xs: '1', md: '2' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Documento</InputLabel>
                    <Select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      label="Tipo de Documento"
                      required
                    >
                      <MenuItem value="Miro">Miro</MenuItem>
                      <MenuItem value="Lucidchart">Lucidchart</MenuItem>
                      <MenuItem value="Drawio">Drawio</MenuItem>
                      <MenuItem value="Whimsical">Whimsical</MenuItem>
                      <MenuItem value="Loom">Loom</MenuItem>
                      <MenuItem value="Figma">Figma</MenuItem>
                      <MenuItem value="Api">Api</MenuItem>
                      <MenuItem value="Github">Github</MenuItem>
                      <MenuItem value="Outro">Outro</MenuItem>
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

                {/* URL */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="URL"
                    name="url"
                    value={formData.url}
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

          {/* Lista de Links de Documentos */}
          <Typography variant="h6" gutterBottom>
            Links de Documentos Cadastrados
          </Typography>
          
          {selectedProject ? (
            documentos.length > 0 ? (
              <DataTable
                columns={columns}
                data={documentos}
                count={documentos.length}
                page={0}
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                renderCell={renderCell}
              />
            ) : (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Não existem links de documentos cadastrados para o projeto selecionado
                </Typography>
              </Paper>
            )
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Selecione um projeto para visualizar os links de documentos
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
};

export default DocumentosPage;