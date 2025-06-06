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
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { 
  Save as SaveIcon, 
  ArrowBack as BackIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import DataTable from '../components/DataTable';
import { ValidacaoTecnicaService, ProjectService } from '../services/api';
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

interface ValidacaoTecnica {
  id: string;
  tipo: number;
  descricao: string;
  url: string;
  validado: boolean;
  observacao: string;
  criadoEm: string;
  projetoId: string;
}

interface Project {
  id: string;
  nome: string;
}

const tipoValidacaoMap = [
  { id: 0, label: 'POC' },
  { id: 1, label: 'Protótipo' },
  { id: 2, label: 'Arquitetura' }
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

const ValidacaoTecnicaPage: React.FC = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [validacoes, setValidacoes] = useState<ValidacaoTecnica[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');

  const [formData, setFormData] = useState({
    tipo: 0,
    descricao: '',
    url: '',
    validado: false,
    observacao: '',
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

  // Carregar validações quando projeto é selecionado
  useEffect(() => {
    const loadValidacoes = async () => {
      if (selectedProject) {
        try {
          setLoading(true);
          const response = await ValidacaoTecnicaService.list(selectedProject);
          setValidacoes(response.data);
          setFormData(prev => ({ ...prev, projetoId: selectedProject }));
        } catch (error: unknown) {
          const err = error as ApiError;
          console.error('Erro detalhado:', err);
          setError('Erro ao carregar validações técnicas: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadValidacoes();
  }, [selectedProject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTipoChange = (e: any) => {
    const value = Number(e.target.value);
    setFormData(prev => ({ ...prev, tipo: value }));
  };

  const handleValidadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, validado: e.target.value === 'true' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        tipo: formData.tipo,
        descricao: formData.descricao,
        url: formData.url,
        validado: formData.validado,
        observacao: formData.observacao,
        projetoId: selectedProject
      };

      if (isEditing && currentId) {
        await ValidacaoTecnicaService.update(selectedProject, currentId, payload);
        setSuccess(true);
      } else {
        await ValidacaoTecnicaService.create(selectedProject, payload);
        setSuccess(true);
      }

      // Recarregar validações
      const response = await ValidacaoTecnicaService.list(selectedProject);
      setValidacoes(response.data);
      
      // Limpar formulário
      resetForm();
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error('Erro detalhado:', error.response?.data);
      setError('Erro ao salvar validação técnica: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await ValidacaoTecnicaService.get(selectedProject, id);
      setFormData({
        tipo: response.data.tipo,
        descricao: response.data.descricao,
        url: response.data.url,
        validado: response.data.validado,
        observacao: response.data.observacao || '',
        projetoId: selectedProject
      });
      setIsEditing(true);
      setCurrentId(id);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Erro ao carregar validação técnica:', err);
      setError('Erro ao carregar validação para edição: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta validação técnica?')) {
      try {
        await ValidacaoTecnicaService.delete(selectedProject, id);
        // Recarregar validações
        const response = await ValidacaoTecnicaService.list(selectedProject);
        setValidacoes(response.data);
      } catch (error: unknown) {
        const err = error as ApiError;
        console.error('Erro ao excluir validação técnica:', err);
        setError('Erro ao excluir validação técnica: ' + err.message);
      }
    }
  };

  const handleValidar = async (id: string) => {
    const observacao = prompt('Digite uma observação (opcional):');
    try {
      await ValidacaoTecnicaService.validar(selectedProject, id, observacao || '');
      // Recarregar validações
      const response = await ValidacaoTecnicaService.list(selectedProject);
      setValidacoes(response.data);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Erro ao validar:', err);
      setError('Erro ao marcar como validado: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 0,
      descricao: '',
      url: '',
      validado: false,
      observacao: '',
      projetoId: selectedProject
    });
    setIsEditing(false);
    setCurrentId('');
  };

  const columns = [
    { id: 'tipo', label: 'Tipo', width: '15%' },
    { id: 'descricao', label: 'Descrição', width: '25%' },
    { id: 'url', label: 'URL', width: '20%' },
    { 
      id: 'validado', 
      label: 'Validado', 
      width: '10%',
      format: (value: boolean) => value ? 'Sim' : 'Não'
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

  const renderCell = (row: ValidacaoTecnica, columnId: string) => {
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
            {!row.validado && (
              <IconButton 
                size="small" 
                sx={{ color: '#81C784' }}
                onClick={() => handleValidar(row.id)}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            )}
          </>
        );
      case 'tipo':
        return tipoValidacaoMap.find(t => t.id === row.tipo)?.label || 'Desconhecido';
      case 'validado':
        return row.validado ? (
          <CheckIcon color="success" fontSize="small" />
        ) : (
          <CloseIcon color="error" fontSize="small" />
        );
      case 'criadoEm':
        return format(parseISO(row.criadoEm), 'dd/MM/yyyy');
      default:
        return row[columnId as keyof ValidacaoTecnica];
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
              to="/gestao"
              startIcon={<BackIcon />}
              sx={{ mr: 2, color: '#3B84C4' }}
            >
              Voltar
            </Button>
            <Typography variant="h4">
              VALIDAÇÃO TÉCNICA
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Validação técnica {isEditing ? 'atualizada' : 'cadastrada'} com sucesso!
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

                {/* Tipo */}
                <Box sx={{ gridColumn: { xs: '1', md: '2' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      value={formData.tipo}
                      onChange={handleTipoChange}
                      label="Tipo"
                      required
                    >
                      {tipoValidacaoMap.map((tipo) => (
                        <MenuItem key={tipo.id} value={tipo.id}>
                          {tipo.label}
                        </MenuItem>
                      ))}
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
                    required
                    multiline
                    rows={2}
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

                {/* Validado */}
                <Box sx={{ gridColumn: { xs: '1', md: '1' } }}>
                  <FormControl component="fieldset">
                    <Typography variant="subtitle1" gutterBottom>
                      Validado
                    </Typography>
                    <RadioGroup
                      row
                      name="validado"
                      value={formData.validado.toString()}
                      onChange={handleValidadoChange}
                    >
                      <FormControlLabel
                        value="true"
                        control={<Radio color="primary" />}
                        label="Sim"
                      />
                      <FormControlLabel
                        value="false"
                        control={<Radio color="primary" />}
                        label="Não"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>

                {/* Observações */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="Observações"
                    name="observacao"
                    value={formData.observacao}
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

          {/* Lista de Validações Técnicas */}
          <Typography variant="h6" gutterBottom>
            Validações Técnicas Cadastradas
          </Typography>
          
          {selectedProject ? (
            loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : validacoes.length > 0 ? (
              <DataTable
                columns={columns}
                data={validacoes}
                count={validacoes.length}
                page={0}
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                renderCell={renderCell}
              />
            ) : (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Não existem validações técnicas cadastradas para o projeto selecionado
                </Typography>
              </Paper>
            )
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Selecione um projeto para visualizar as validações técnicas
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
};

export default ValidacaoTecnicaPage;