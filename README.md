
# DevInsight - Frontend

## Visão Geral
O DevInsight é uma plataforma web para consultoria em desenvolvimento de sistemas, cobrindo todas as etapas do processo: diagnóstico, proposta, roadmap, validação e entrega. Este repositório contém o frontend da aplicação, construído com React, TypeScript e Material-UI.

## Funcionalidades Principais
- Autenticação de usuários (Admin, Consultor, Cliente)
- Dashboard com visão geral de projetos
- Gestão de projetos com acompanhamento de status
- Menu navegável com todas as seções do sistema
- Tabelas paginadas para listagem de dados
- UI responsiva e acessível

## Tecnologias Utilizadas
- React
- TypeScript
- Material-UI
- React Router
- Axios
- Styled Components

## Estrutura do Projeto
```
src/
├── assets/               # Assets estáticos (imagens, fonts)
├── components/           # Componentes reutilizáveis
│   ├── Header.tsx        # Cabeçalho da aplicação
│   ├── SideMenu.tsx      # Menu lateral navegável
│   ├── SummaryCard.tsx   # Cards de resumo
│   ├── DataTable.tsx     # Tabela paginada
│   └── ...               # Outros componentes
├── pages/                # Páginas da aplicação
│   ├── Dashboard.tsx     # Página inicial
│   ├── Login.tsx         # Página de login
│   ├── Register.tsx      # Página de cadastro
│   └── ...               # Outras páginas
├── services/             # Serviços e APIs
│   ├── api.ts            # Configuração do Axios
│   └── auth.ts           # Serviço de autenticação
├── styles/               # Estilos globais e temas
│   ├── theme.ts          # Tema Material-UI
│   └── globalStyles.ts   # Estilos globais
├── App.tsx               # Componente principal
└── index.tsx             # Ponto de entrada
```

## Configuração do Ambiente

### Pré-requisitos
- Node.js (v16 ou superior)
- npm (v8 ou superior)
- Conexão com a API backend (`https://localhost:7168`)

### Instalação

Clone o repositório:

```bash
git clone https://github.com/seu-usuario/devinsight-frontend.git
cd devinsight-frontend
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto com:

```
REACT_APP_API_URL=https://localhost:7168
```

Inicie o servidor de desenvolvimento:

```bash
npm start
```

## Scripts Disponíveis
- `npm start`: Inicia o servidor de desenvolvimento
- `npm build`: Cria a versão de produção
- `npm test`: Executa os testes
- `npm lint`: Executa o linter
- `npm format`: Formata o código com Prettier

## Paleta de Cores

| Cor                 | Hexadecimal |
|---------------------|-------------|
| Azul Claro          | `#A4D2F4`   |
| Azul Médio          | `#6CB1E1`   |
| Cinza Azulado       | `#D3E3EC`   |
| Cinza Claro         | `#E9EDF0`   |
| Azul Escuro Suave   | `#3B84C4`   |

## Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/awesome-feature`)
3. Commit suas mudanças (`git commit -m 'Add some awesome feature'`)
4. Push para a branch (`git push origin feature/awesome-feature`)
5. Abra um Pull Request

## Licença
Distribuído sob a licença MIT. Veja LICENSE para mais informações.

## Contato
Equipe DevInsight - contato@devinsight.com

> Nota: Este projeto foi inicializado com Create React App usando o template TypeScript.
