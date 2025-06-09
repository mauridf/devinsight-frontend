import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Collapse,
  IconButton 
} from '@mui/material';
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
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Visibility as OverviewIcon,
  Assessment as LevantamentoIcon,
  Business as GestaoIcon,
  LocalShipping as EntregasIcon
} from '@mui/icons-material';

type MenuItem = {
  text: string;
  icon: React.ReactNode;
  path?: string;
};

type MenuSection = {
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
};

const menuItems: MenuSection[] = [
  {
    title: 'VISÃO GERAL',
    icon: <OverviewIcon fontSize="small" />,
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' }
    ]
  },
  {
    title: 'LEVANTAMENTO',
    icon: <LevantamentoIcon fontSize="small" />,
    items: [
      { text: 'Projetos', icon: <ProjectsIcon />, path: '/projetos' },
      { text: 'Personas Chave', icon: <PersonasIcon />, path: '/personaschave' },
      { text: 'Stakeholders', icon: <StakeholdersIcon />, path: '/stakeholder' },
      { text: 'Requisitos', icon: <RequirementsIcon />, path: '/requisito' },
      { text: 'Fases do Projeto', icon: <PhasesIcon />, path: '/fasesprojeto' },
      { text: 'Funcionalidades', icon: <FeaturesIcon />, path: '/funcionalidade' },
      { text: 'Documentos', icon: <DocumentsIcon />, path: '/documentos' },
      { text: 'Reuniões', icon: <MeetingsIcon />, path: '/reunioes' },
      { text: 'Solução Proposta', icon: <SolutionIcon />, path: '/solucoespropostas' }
    ]
  },
  {
    title: 'GESTÃO',
    icon: <GestaoIcon fontSize="small" />,
    items: [
      { text: 'Estimativa/Custos', icon: <EstimateIcon />, path: '/estimativacusto' },
      { text: 'Tarefas', icon: <TasksIcon />, path: '/tarefas' },
      { text: 'Kanban', icon: <KanbanIcon />, path: '/kanban' },
      { text: 'Validação Técnica', icon: <ValidationIcon />, path: '/validacao' }
    ]
  },
  {
    title: 'ENTREGAS',
    icon: <EntregasIcon fontSize="small" />,
    items: [
      { text: 'Entregas finais', icon: <DeliveryIcon />, path: '/entregas' },
      { text: 'Relatório de Consultoria', icon: <DocumentsIcon />, path: '/consultoria' },
      { text: 'Diagrama de Arquitetura', icon: <ArchitectureIcon />, path: '/arquitetura' },
      { text: 'Estatologia de Pópico', icon: <TopicIcon />, path: '/topico' },
      { text: 'Rua de Atletização e Leitura', icon: <RouteIcon />, path: '/rota' },
      { text: 'Banco de Dados (NER)', icon: <DatabaseIcon />, path: '/banco-de-dados' },
      { text: 'Padrões de Código e Arquitetura', icon: <CodeIcon />, path: '/codigo' }
    ]
  }
];

const SideMenu: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'VISÃO GERAL': true,
    'LEVANTAMENTO': true,
    'GESTÃO': true,
    'ENTREGAS': true
  });

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <Box 
      width={250} 
      bgcolor="#f5f5f5" 
      p={2} 
      borderRight="1px solid #ddd"
      sx={{ 
        overflowY: 'auto',
        height: '100vh',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#6CB1E1',
          borderRadius: '3px',
        }
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 2, display: 'flex', alignItems: 'center' }}>
        <Box component="span" sx={{ mr: 1, color: '#3B84C4' }}>
          <OverviewIcon />
        </Box>
        Menu
      </Typography>
      
      {menuItems.map((section) => (
        <Box key={section.title} sx={{ mb: 1 }}>
          <ListItemButton 
            onClick={() => toggleSection(section.title)}
            sx={{ 
              borderRadius: 1,
              '&:hover': { backgroundColor: '#e0e0e0' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: '#3B84C4' }}>
              {section.icon}
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#3B84C4' }}>
                  {section.title}
                </Typography>
              } 
            />
            {expandedSections[section.title] ? (
              <ExpandMoreIcon fontSize="small" sx={{ color: '#6CB1E1' }} />
            ) : (
              <ChevronRightIcon fontSize="small" sx={{ color: '#6CB1E1' }} />
            )}
          </ListItemButton>
          
          <Collapse in={expandedSections[section.title]} timeout="auto" unmountOnExit>
            <List disablePadding>
              {section.items.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton 
                    component={item.path ? Link : 'div'} 
                    to={item.path || ''}
                    sx={{ 
                      pl: 4,
                      borderRadius: 1,
                      '&:hover': { backgroundColor: '#e0e0e0' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: '#6CB1E1' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      ))}
    </Box>
  );
};

export default SideMenu;