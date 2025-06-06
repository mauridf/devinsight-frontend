import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { 
  ArrowBack as BackIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SideMenu from '../components/SideMenu';
import { TarefasService, ProjectService } from '../services/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
  status: number;
  dataEntrega: string;
  projetoId: string;
}

interface Project {
  id: string;
  nome: string;
}

const statusMap = [
  { id: 0, title: 'Pendente', color: '#FFEE58' },
  { id: 1, title: 'Em Andamento', color: '#4FC3F7' },
  { id: 2, title: 'Em Impedimento', color: '#FF8A65' },
  { id: 3, title: 'Em Pausa', color: '#BA68C8' },
  { id: 4, title: 'Feito', color: '#81C784' }
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

const KanbanPage: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [selectedProject, setSelectedProject] = useState('');

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
          const response = await TarefasService.kanban(selectedProject);
          setTarefas(response.data);
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

  const onDragEnd = async (result: any) => {
  if (!result.destination || !selectedProject) return;

  const sourceStatus = parseInt(result.source.droppableId);
  const destinationStatus = parseInt(result.destination.droppableId);
  const taskId = result.draggableId;

  if (sourceStatus === destinationStatus) return;

  try {
    // Atualização otimista
    const updatedTarefas = tarefas.map(tarefa => 
      tarefa.id === taskId ? { ...tarefa, status: destinationStatus } : tarefa
    );
    setTarefas(updatedTarefas);

    // Chamada API para atualizar status - agora enviando apenas o número
    await TarefasService.status(selectedProject, taskId, destinationStatus);
  } catch (error: unknown) {
    const err = error as ApiError;
    console.error('Erro ao atualizar status:', err);
    
    // Mensagem mais detalhada do erro
    const errorMessage = err.response?.data?.message || err.message;
    setError(`Erro ao mover tarefa: ${errorMessage}`);
    
    // Reverter se houver erro
    setTarefas(tarefas);
  }
};

  const getTarefasByStatus = (status: number) => {
    return tarefas
      .filter(tarefa => tarefa.status === status)
      .sort((a, b) => new Date(a.dataEntrega).getTime() - new Date(b.dataEntrega).getTime());
  };

  return (
    <>
      <Header />
      <Box display="flex" minHeight="calc(100vh - 64px)">
        <SideMenu />
        
        <Box component="main" flex={1} p={3} sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 64px)', width: 'calc(100% - 240px)'}} >
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
              KANBAN
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Seletor de Projeto */}
          <Box sx={{ mb: 3 }}>
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

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : selectedProject ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Box display="flex" gap={2} overflow="auto" py={1} sx={{ minWidth: 'fit-content', width: '100%', height: 'calc(100vh - 200px)' }} >
                {statusMap.map((status) => (
                  <Droppable key={status.id} droppableId={status.id.toString()}>
                    {(provided) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        elevation={3}
                        sx={{
                          minWidth: 300,
                          backgroundColor: '#f5f5f5',
                          p: 2,
                          borderRadius: 2
                        }}
                      >
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mb: 2,
                            color: status.color,
                            fontWeight: 'bold',
                            borderBottom: `2px solid ${status.color}`,
                            pb: 1
                          }}
                        >
                          {status.title}
                        </Typography>
                        
                        {getTarefasByStatus(status.id).map((tarefa, index) => (
                          <Draggable 
                            key={tarefa.id} 
                            draggableId={tarefa.id} 
                            index={index}
                          >
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{ 
                                  mb: 2,
                                  cursor: 'move',
                                  '&:hover': {
                                    boxShadow: 3
                                  }
                                }}
                              >
                                <CardContent>
                                  <Box display="flex" justifyContent="space-between">
                                    <Typography variant="subtitle1" gutterBottom>
                                      {tarefa.titulo}
                                    </Typography>
                                    <IconButton size="small">
                                      <MoreIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {tarefa.descricao}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Entrega: {format(parseISO(tarefa.dataEntrega), 'dd/MM/yyyy')}
                                  </Typography>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Paper>
                    )}
                  </Droppable>
                ))}
              </Box>
            </DragDropContext>
          ) : (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Selecione um projeto para visualizar o Kanban
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </>
  );
};

export default KanbanPage;