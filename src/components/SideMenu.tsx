import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Folder as ProjectsIcon,
  People as PersonasIcon,
  Groups as StakeholdersIcon,
  Checklist as RequirementsIcon,
  Timeline as PhasesIcon,
  Functions as FeaturesIcon,
  Description as DocumentsIcon,
  MeetingRoom as MeetingsIcon,
  Lightbulb as SolutionIcon,
  Calculate as EstimateIcon,
  Task as TasksIcon,
  ViewKanban as KanbanIcon,
  Verified as ValidationIcon,
  DeliveryDining as DeliveryIcon,
  Assessment as ReportsIcon,
  Architecture as ArchitectureIcon,
  Schema as TopicIcon,
  Route as RouteIcon,
  Storage as DatabaseIcon,
  Code as CodeIcon
} from '@mui/icons-material';

const menuItems = [
  {
    title: 'VISÃO GERAL',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' }
    ]
  },
  {
    title: 'LEVANTAMENTO',
    items: [
      { text: 'Projetos', icon: <ProjectsIcon />, path: '/projetos' },
      { text: 'Personas Chave', icon: <PersonasIcon />, path: '/personaschave' },
      { text: 'Stakeholders', icon: <StakeholdersIcon />, path: '/stakeholder' },
      { text: 'Requisitos', icon: <RequirementsIcon /> },
      { text: 'Fases do Projeto', icon: <PhasesIcon /> },
      { text: 'Funcionalidades', icon: <FeaturesIcon /> },
      { text: 'Documentos', icon: <DocumentsIcon /> },
      { text: 'Reuniões', icon: <MeetingsIcon /> },
      { text: 'Solução Proposta', icon: <SolutionIcon /> }
    ]
  },
  {
    title: 'GESTÃO',
    items: [
      { text: 'Estimativa/Custos', icon: <EstimateIcon /> },
      { text: 'Tarefas', icon: <TasksIcon /> },
      { text: 'Kanban', icon: <KanbanIcon /> },
      { text: 'Validação Técnica', icon: <ValidationIcon /> }
    ]
  },
  {
    title: 'ENTREGAS',
    items: [
      { text: 'Entregas finais', icon: <DeliveryIcon /> },
      { text: 'Relatórios e Documentos', icon: <ReportsIcon /> },
      { text: 'Relatório de Consultoria', icon: <DocumentsIcon /> },
      { text: 'Diagrama de Arquitetura', icon: <ArchitectureIcon /> },
      { text: 'Estatologia de Pópico', icon: <TopicIcon /> },
      { text: 'Rua de Atletização e Leitura', icon: <RouteIcon /> },
      { text: 'Banco de Dados (NER)', icon: <DatabaseIcon /> },
      { text: 'Padrões de Código e Arquitetura', icon: <CodeIcon /> }
    ]
  }
];

const SideMenu: React.FC = () => {
  return (
    <Box width={250} bgcolor="#f5f5f5" p={2} borderRight="1px solid #ddd">
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
        Menu
      </Typography>
      
      {menuItems.map((section) => (
        <Box key={section.title} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#3B84C4' }}>
            {section.title}
          </Typography>
          <List>
            {section.items.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  component={item.path ? Link : 'div'} 
                  to={item.path || ''}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: '#6CB1E1' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
};
export default SideMenu;