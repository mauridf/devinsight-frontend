import axios from 'axios';

const API_BASE_URL = 'https://localhost:7168/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token às requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//Auth
export const AuthService = {
  login: async (email: string, senha: string) => {
    return api.post('/Auth/login', { email, senha });
  },
  register: async (nome: string, email: string, senha: string, tipoUsuario: number) => {
    return api.post('/Auth/registrar', { nome, email, senha, tipoUsuario });
  },
};

// Dashboard
export const DashboardService = {
  dashboard: async (userId: string) => {
    return api.get(`/projetos/dashboard/${userId}`);
  }
};

// Project Service
export const ProjectService = {
  create: async (projectData: any) => {
    return api.post('/projetos', projectData);
  },
  getAll: async () => {
    return api.get('/projetos');
  },
  getById: async (id: string) => {
    console.log('Chamando API para projeto com ID:', id);
    const response = await api.get(`/projetos/${id}`);
    console.log('Resposta da API:', response);
    return response;
  },
  update: async (id: string, projectData: any) => {
    return api.put(`/projetos/${id}`, projectData);
  },
  delete: async (id: string) => {
    return api.delete(`/projetos/${id}`);
  },
  getByUser: async (userId: string) => {
    return api.get(`/projetos/usuario/${userId}`);
  },
  getMyProjects: async () => {
    return api.get('/projetos/meus-projetos');
  },
};

// Key Persona
export const KeyPersonaService = {
  create: async (projetoId: string, personaData: any) => {
    return api.post(`/projetos/${projetoId}/personaschaves`, personaData);
  },
  list: async (projetoId: string) => {
    return api.get(`/projetos/${projetoId}/personaschaves`);
  },
  get: async (projetoId: string, id: string) => {
    return api.get(`/projetos/${projetoId}/personaschaves/${id}`);
  },
  update: async (projetoId: string, id: string, personaData: any) => {
    return api.put(`/projetos/${projetoId}/personaschaves/${id}`, personaData);
  },
  delete: async (projetoId: string, id: string) => {
    return api.delete(`/projetos/${projetoId}/personaschaves/${id}`);
  }
};

// Stakeholders
export const StakeholdersService = {
  create: async (projetoId: string, personaData: any) => {
    return api.post(`/projetos/${projetoId}/stakeholders`, personaData);
  },
  list: async (projetoId: string) => {
    return api.get(`/projetos/${projetoId}/stakeholders`);
  },
  get: async (projetoId: string, id: string) => {
    return api.get(`/projetos/${projetoId}/stakeholders/${id}`);
  },
  update: async (projetoId: string, id: string, personaData: any) => {
    return api.put(`/projetos/${projetoId}/stakeholders/${id}`, personaData);
  },
  delete: async (projetoId: string, id: string) => {
    return api.delete(`/projetos/${projetoId}/stakeholders/${id}`);
  }
};

// Requisitos
export const RequisitosService = {
  create: async (projetoId: string, personaData: any) => {
    return api.post(`/projetos/${projetoId}/requisitos`, personaData);
  },
  list: async (projetoId: string) => {
    return api.get(`/projetos/${projetoId}/requisitos`);
  },
  get: async (projetoId: string, id: string) => {
    return api.get(`/projetos/${projetoId}/requisitos/${id}`);
  },
  update: async (projetoId: string, id: string, personaData: any) => {
    return api.put(`/projetos/${projetoId}/requisitos/${id}`, personaData);
  },
  delete: async (projetoId: string, id: string) => {
    return api.delete(`/projetos/${projetoId}/requisitos/${id}`);
  }
};

// Fases do Projeto
export const FasesProjetoService = {
  create: async (projetoId: string, personaData: any) => {
    return api.post(`/projetos/${projetoId}/fasesprojeto`, personaData);
  },
  list: async (projetoId: string) => {
    return api.get(`/projetos/${projetoId}/fasesprojeto`);
  },
  get: async (projetoId: string, id: string) => {
    return api.get(`/projetos/${projetoId}/fasesprojeto/${id}`);
  },
  update: async (projetoId: string, id: string, personaData: any) => {
    return api.put(`/projetos/${projetoId}/fasesprojeto/${id}`, personaData);
  },
  delete: async (projetoId: string, id: string) => {
    return api.delete(`/projetos/${projetoId}/fasesprojeto/${id}`);
  }
};

// Funcionalidades Desejadas
export const FuncionalidadeService = {
  create: async (projetoId: string, personaData: any) => {
    return api.post(`/projetos/${projetoId}/funcionalidades`, personaData);
  },
  list: async (projetoId: string) => {
    return api.get(`/projetos/${projetoId}/funcionalidades`);
  },
  get: async (projetoId: string, id: string) => {
    return api.get(`/projetos/${projetoId}/funcionalidades/${id}`);
  },
  update: async (projetoId: string, id: string, personaData: any) => {
    return api.put(`/projetos/${projetoId}/funcionalidades/${id}`, personaData);
  },
  delete: async (projetoId: string, id: string) => {
    return api.delete(`/projetos/${projetoId}/funcionalidades/${id}`);
  }
};

// Documentos
export const DocumentosService = {
  create: async (projetoId: string, personaData: any) => {
    return api.post(`/projetos/${projetoId}/documentos-links`, personaData);
  },
  list: async (projetoId: string) => {
    return api.get(`/projetos/${projetoId}/documentos-links`);
  },
  get: async (projetoId: string, id: string) => {
    return api.get(`/projetos/${projetoId}/documentos-links/${id}`);
  },
  update: async (projetoId: string, id: string, personaData: any) => {
    return api.put(`/projetos/${projetoId}/documentos-links/${id}`, personaData);
  },
  delete: async (projetoId: string, id: string) => {
    return api.delete(`/projetos/${projetoId}/documentos-links/${id}`);
  }
};

// Reuniões
export const ReunioesService = {
  create: async (projetoId: string, personaData: any) => {
    return api.post(`/projetos/${projetoId}/reunioes`, personaData);
  },
  list: async (projetoId: string) => {
    return api.get(`/projetos/${projetoId}/reunioes`);
  },
  get: async (projetoId: string, id: string) => {
    return api.get(`/projetos/${projetoId}/reunioes/${id}`);
  },
  update: async (projetoId: string, id: string, personaData: any) => {
    return api.put(`/projetos/${projetoId}/reunioes/${id}`, personaData);
  },
  delete: async (projetoId: string, id: string) => {
    return api.delete(`/projetos/${projetoId}/reunioes/${id}`);
  },
  proximas: async (projetoId: string) => {
    return api.get(`/projetos/${projetoId}/reunioes/proximas`);
  }
};

export default api;