import React, { useState, useEffect } from 'react'; // Adicione useEffect aqui
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
  Alert
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import { ProjectService } from '../services/api';

interface UserData {
  id?: string;
  nome?: string;
  email?: string;
  tipoUsuario?: number;
}

interface ProjectFormPageProps {
  isEdit?: boolean;
  projectId?: string;
} 

const ProjectFormPage: React.FC<ProjectFormPageProps> = ({ isEdit = false }) => {
  const { id } = useParams();
  const projectId = id;
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  // Obter dados do usuário
  const getUserData = (): UserData => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) return JSON.parse(userString) as UserData;
    } catch (error) {
      console.error('Erro ao ler dados do usuário:', error);
    }
    return {};
  };

  const userData = getUserData();
  const userName = userData.nome || '';

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    cliente: '',
    criadoPorId: userData.id || '',
    dataInicio: '',
    dataEntrega: '',
    proposito: '',
    situacaoAtual: '',
    status: 0
  });

  // Status options
  const statusOptions = [
    { value: 0, label: 'Em Andamento' },
    { value: 1, label: 'Pausado' },
    { value: 2, label: 'Cancelado' },
    { value: 3, label: 'Finalizado' }
  ];

  // Manipular mudanças no formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Carregar dados do projeto se for edição
  useEffect(() => {
    console.log('Modo edição:', isEdit, 'ID:', projectId);
    if (isEdit && projectId) {
      const loadProject = async () => {
        try {
          setInitialLoading(true);
          const response = await ProjectService.getById(projectId);
          console.log('Dados do projeto:', response.data);
          setFormData({
            nome: response.data.nome,
            cliente: response.data.cliente,
            criadoPorId: response.data.criadoPorId,
            dataInicio: response.data.dataInicio.split('T')[0],
            dataEntrega: response.data.dataEntrega.split('T')[0],
            proposito: response.data.proposito,
            situacaoAtual: response.data.situacaoAtual,
            status: response.data.status
          });
        } catch (error) {
          console.error('Erro detalhado:', error);
          setError('Erro ao carregar projeto');
        } finally {
          setInitialLoading(false);
        }
      };
      loadProject();
    }
  }, [isEdit, projectId]);

  // Manipular envio do formulário (única declaração)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (isEdit && projectId) {
        await ProjectService.update(projectId, formData);
        setSuccess(true);
        setTimeout(() => navigate('/projetos'), 1500);
      } else {
        await ProjectService.create(formData);
        setSuccess(true);
        setTimeout(() => navigate('/projetos'), 1500);
      }
    } catch (err) {
      setError(`Erro ao ${isEdit ? 'atualizar' : 'cadastrar'} projeto. Por favor, tente novamente.`);
      console.error(`Erro ao ${isEdit ? 'atualizar' : 'cadastrar'} projeto:`, err);
    } finally {
      setLoading(false);
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
              {isEdit ? 'EDITAR PROJETO' : 'CADASTRAR PROJETO'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Projeto {isEdit ? 'atualizado' : 'cadastrado'} com sucesso! Redirecionando...
            </Alert>
          )}

          <Paper elevation={0} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              {/* Container principal substituindo Grid container */}
              <Box 
                display="grid"
                gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }}
                gap={3}
              >
                {/* Nome do Projeto */}
                <Box sx={{ gridColumn: { xs: '1', md: '1' } }}>
                  <TextField
                    label="Nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Box>

                {/* Cliente */}
                <Box sx={{ gridColumn: { xs: '1', md: '2' } }}>
                  <TextField
                    label="Cliente"
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                  />
                </Box>

                {/* Consultor (read-only) */}
                <Box sx={{ gridColumn: { xs: '1', md: '1' } }}>
                  <TextField
                    label="Consultor"
                    value={userName}
                    fullWidth
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Box>

                {/* Data Início */}
                <Box sx={{ gridColumn: { xs: '1', md: '1' } }}>
                  <TextField
                    label="Data Início"
                    name="dataInicio"
                    type="date"
                    value={formData.dataInicio}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                {/* Data Entrega */}
                <Box sx={{ gridColumn: { xs: '1', md: '2' } }}>
                  <TextField
                    label="Data Entrega"
                    name="dataEntrega"
                    type="date"
                    value={formData.dataEntrega}
                    onChange={handleChange}
                    fullWidth
                    required
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>

                {/* Propósito - ocupa toda a largura */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="Propósito"
                    name="proposito"
                    value={formData.proposito}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                </Box>

                {/* Situação Atual - ocupa toda a largura */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    label="Situação Atual"
                    name="situacaoAtual"
                    value={formData.situacaoAtual}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                </Box>

                {/* Status */}
                <Box sx={{ gridColumn: { xs: '1', md: '1' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as number})}
                      label="Status"
                      required
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Botão de Salvar - ocupa toda a largura */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                    sx={{
                      backgroundColor: '#3B84C4',
                      '&:hover': { backgroundColor: '#6CB1E1' }
                    }}
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </Box>
              </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default ProjectFormPage;