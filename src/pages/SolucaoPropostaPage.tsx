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
import { SolucaoPropostaService, ProjectService } from '../services/api';

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

interface SolucaoProposta {
  id: string;
  resumo: string;
  arquitetura: string;
  componentesSistema: string;
  pontosIntegracao: string;
  riscos: string;
  recomendacoesTecnicas: string;
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

const SolucaoPropostaPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [solucoes, setSolucoes] = useState<SolucaoProposta[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState('');

  const [formData, setFormData] = useState({
    resumo: '',
    arquitetura: '',
    componentesSistema: '',
    pontosIntegracao: '',
    riscos: '',
    recomendacoesTecnicas: '',
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

  // Carregar soluções quando projeto é selecionado
  useEffect(() => {
    const loadSolucoes = async () => {
      if (selectedProject) {
        try {
          setLoading(true);
          const response = await SolucaoPropostaService.list(selectedProject);
          setSolucoes(response.data);
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
          
          setError('Erro ao carregar soluções propostas: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    loadSolucoes();
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
        resumo: formData.resumo,
        arquitetura: formData.arquitetura,
        componentesSistema: formData.componentesSistema,
        pontosIntegracao: formData.pontosIntegracao,
        riscos: formData.riscos,
        recomendacoesTecnicas: formData.recomendacoesTecnicas,
        projetoId: selectedProject
      };

      if (isEditing && currentId) {
        await SolucaoPropostaService.update(selectedProject, currentId, payload);
        setSuccess(true);
      } else {
        await SolucaoPropostaService.create(selectedProject, payload);
        setSuccess(true);
      }

      // Recarregar soluções
      const response = await SolucaoPropostaService.list(selectedProject);
      setSolucoes(response.data);
      
      // Limpar formulário
      setFormData({
        resumo: '',
        arquitetura: '',
        componentesSistema: '',
        pontosIntegracao: '',
        riscos: '',
        recomendacoesTecnicas: '',
        projetoId: selectedProject
      });
      setIsEditing(false);
      setCurrentId('');
    } catch (err: unknown) {
      const error = err as ApiError;
      console.error('Erro ao salvar solução proposta:', error);
      setError('Erro ao salvar solução proposta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await SolucaoPropostaService.get(selectedProject, id);
      setFormData({
        resumo: response.data.resumo,
        arquitetura: response.data.arquitetura,
        componentesSistema: response.data.componentesSistema,
        pontosIntegracao: response.data.pontosIntegracao,
        riscos: response.data.riscos,
        recomendacoesTecnicas: response.data.recomendacoesTecnicas,
        projetoId: selectedProject
      });
      setIsEditing(true);
      setCurrentId(id);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error('Erro ao carregar solução proposta:', err);
      setError('Erro ao carregar solução proposta para edição: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta solução proposta?')) {
      try {
        await SolucaoPropostaService.delete(selectedProject, id);
        // Recarregar soluções
        const response = await SolucaoPropostaService.list(selectedProject);
        setSolucoes(response.data);
      } catch (error: unknown) {
        const err = error as ApiError;
        console.error('Erro ao excluir solução proposta:', err);
        setError('Erro ao excluir solução proposta: ' + err.message);
      }
    }
  };

  const columns = [
    { id: 'resumo', label: 'Resumo', width: '20%' },
    { id: 'arquitetura', label: 'Arquitetura', width: '15%' },
    { id: 'componentesSistema', label: 'Componentes', width: '15%' },
    { id: 'pontosIntegracao', label: 'Pontos Integração', width: '15%' },
    { id: 'riscos', label: 'Riscos', width: '15%' },
    { id: 'recomendacoesTecnicas', label: 'Recomendações', width: '10%' },
    { 
      id: 'acao', 
      label: 'Ação', 
      width: '10%',
      align: 'center' as const
    }
  ];

  const renderCell = (row: SolucaoProposta, columnId: string) => {
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
        return row[columnId as keyof SolucaoProposta];
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
              SOLUÇÃO PROPOSTA
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Solução proposta {isEditing ? 'atualizada' : 'cadastrada'} com sucesso!
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

                {/* Resumo */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="Resumo"
                    name="resumo"
                    value={formData.resumo}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    required
                    variant="outlined"
                  />
                </Box>

                {/* Arquitetura */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="Arquitetura"
                    name="arquitetura"
                    value={formData.arquitetura}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                    required
                    variant="outlined"
                  />
                </Box>

                {/* Componentes do Sistema */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="Componentes do Sistema"
                    name="componentesSistema"
                    value={formData.componentesSistema}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                    required
                    variant="outlined"
                  />
                </Box>

                {/* Pontos de Integração */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="Pontos de Integração"
                    name="pontosIntegracao"
                    value={formData.pontosIntegracao}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                    required
                    variant="outlined"
                  />
                </Box>

                {/* Riscos */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="Riscos"
                    name="riscos"
                    value={formData.riscos}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
                    required
                    variant="outlined"
                  />
                </Box>

                {/* Recomendações Técnicas */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="Recomendações Técnicas"
                    name="recomendacoesTecnicas"
                    value={formData.recomendacoesTecnicas}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={4}
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

          {/* Lista de Soluções Propostas */}
          <Typography variant="h6" gutterBottom>
            Soluções Propostas Cadastradas
          </Typography>
          
          {selectedProject ? (
            solucoes.length > 0 ? (
              <DataTable
                columns={columns}
                data={solucoes}
                count={solucoes.length}
                page={0}
                onPageChange={() => {}}
                onRowsPerPageChange={() => {}}
                renderCell={renderCell}
              />
            ) : (
              <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Não existem soluções propostas cadastradas para o projeto selecionado
                </Typography>
              </Paper>
            )
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Selecione um projeto para visualizar as soluções propostas
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
};

export default SolucaoPropostaPage;