# Comitê de Risco - Frontend

Frontend do sistema "Comitê de Risco da Zucchetti – BU POS" desenvolvido com Vue 3, Vite, TailwindCSS, Pinia e Vue Router.

## Stack Tecnológica

- **Vue 3** - Framework JavaScript
- **Vite** - Build tool e dev server
- **TailwindCSS** - Framework CSS utilitário
- **Vue Router** - Roteamento
- **Pinia** - Gerenciamento de estado
- **Axios** - Cliente HTTP

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   └── Layout.vue       # Layout principal com sidebar
│   ├── views/               # Páginas da aplicação
│   │   ├── Dashboard.vue    # Dashboard executivo
│   │   ├── RiskItems.vue    # Listagem de itens de risco
│   │   └── RiskItemDetail.vue # Detalhes do item com tabs
│   ├── router/              # Configuração de rotas
│   │   └── index.js
│   ├── stores/              # Stores Pinia
│   │   ├── lookupStore.js   # Cadastros auxiliares
│   │   └── dashboardStore.js # Dados do dashboard
│   ├── services/            # Serviços de API
│   │   ├── api.js           # Configuração do Axios
│   │   ├── riskItemService.js
│   │   ├── poAnalysisService.js
│   │   ├── committeeDecisionService.js
│   │   ├── actionPlanService.js
│   │   ├── directionReviewService.js
│   │   ├── dashboardService.js
│   │   └── lookupService.js
│   ├── composables/         # Composables (futuros)
│   ├── App.vue             # Componente raiz
│   ├── main.js             # Entry point
│   └── style.css           # Estilos globais + Tailwind
├── public/                 # Arquivos estáticos
├── index.html              # HTML entry point
├── package.json            # Dependências
├── vite.config.js          # Configuração do Vite
├── tailwind.config.js      # Configuração do Tailwind
└── postcss.config.js       # Configuração do PostCSS
```

## Instalação

1. **Instalar dependências**
   ```bash
   npm install
   ```

## Execução

### Modo Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado em `http://localhost:5173` (ou porta disponível).

**Importante:** O backend deve estar rodando em `http://localhost:3001` para que o frontend funcione corretamente. O Vite está configurado com proxy para redirecionar requisições `/api` para o backend.

### Modo Produção

```bash
npm run build
```

Os arquivos de build serão gerados no diretório `dist/`.

Para visualizar o build de produção:

```bash
npm run preview
```

## Rotas

- `/` - Dashboard (resumo executivo)
- `/risk-items` - Listagem de itens de risco
- `/risk-items/:id` - Detalhes do item de risco com tabs

## Funcionalidades

### Dashboard

- Resumo com métricas principais (total, em análise, aguardando direção, concluídos)
- Distribuição por severidade (P1, P2, P3, P4)
- Status dos planos de ação (em andamento, em atraso, próximos 7 dias)
- Lista de itens críticos (P1)

### Itens de Risco

- Listagem com filtros (busca, status, fast track)
- Tabela com informações principais
- Navegação para detalhes

### Detalhes do Item de Risco

- **Dados Gerais**: Informações básicas do item
- **Produtos Impactados**: Lista de produtos vinculados
- **Análises dos POs**: Análises realizadas pelos Product Owners
- **Decisão do Comitê**: Decisão final do comitê de risco
- **Planos de Ação**: Planos de ação vinculados
- **Aprovação da Direção**: Revisões e aprovações da direção
- **Timeline / Histórico**: Rastreabilidade completa de eventos

## Estilos

O projeto utiliza TailwindCSS com customizações:

- **Cores personalizadas**: primary, danger, warning, success
- **Componentes utilitários**: .btn, .card, .input, .badge
- **Badges de severidade**: .badge-p1, .badge-p2, .badge-p3, .badge-p4

## Integração com Backend

O frontend se comunica com o backend através da API REST:

- Base URL: `/api` (proxy para `http://localhost:3001/api`)
- Todos os serviços estão em `src/services/`
- Axios configurado com interceptors para tratamento de erros

## Desenvolvimento

### Adicionar Nova Página

1. Criar componente em `src/views/`
2. Adicionar rota em `src/router/index.js`
3. Adicionar link no menu em `src/components/Layout.vue`

### Adicionar Novo Serviço

1. Criar arquivo em `src/services/`
2. Exportar funções que chamam a API via Axios
3. Importar e usar nos componentes/views

### Adicionar Novo Store

1. Criar arquivo em `src/stores/`
2. Definir state, actions e getters
3. Usar com `const store = useNomeStore()`

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção

## Pré-requisitos

- Node.js 18+ 
- Backend rodando em `http://localhost:3001`

## Observações

- O frontend assume que o backend está rodando na porta 3001
- Em caso de porta diferente, atualizar `vite.config.js`
- As warnings do TailwindCSS no editor são normais (são resolvíveis após o build)
