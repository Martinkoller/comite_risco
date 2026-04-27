# Comitê de Risco - Backend API

Sistema backend para o Comitê de Risco da Zucchetti – BU POS.

## Stack Tecnológica

- **Node.js** + **Express**
- **SQLite** (banco de dados)
- **Prisma ORM**
- **Joi** (validação)

## Estrutura do Projeto

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   ├── seed.js                # Dados iniciais
│   └── migrations/            # Migrations do Prisma
├── src/
│   ├── controllers/           # Controladores da API
│   ├── services/              # Lógica de negócio
│   ├── routes/                # Rotas da API
│   ├── middleware/            # Middleware (validação)
│   ├── utils/                 # Utilitários (geração de IDs)
│   └── server.js              # Entry point do servidor
├── .env                       # Variáveis de ambiente
├── .env.example               # Exemplo de variáveis de ambiente
├── package.json               # Dependências do projeto
└── README.md                  # Este arquivo
```

## Instalação

1. **Instalar dependências**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**
   - O arquivo `.env` já foi criado com as configurações padrão
   - Se necessário, edite o arquivo `.env`:
     ```
     DATABASE_URL="file:./dev.db"
     PORT=3001
     NODE_ENV=development
     ```

3. **Gerar cliente Prisma**
   ```bash
   npm run prisma:generate
   ```

4. **Executar migrations**
   ```bash
   npm run prisma:migrate
   ```

5. **Popular banco com dados iniciais (seed)**
   ```bash
   npm run prisma:seed
   ```

## Execução

### Modo Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado em `http://localhost:3001` com auto-reload.

### Modo Produção

```bash
npm start
```

## Endpoints da API

### Risk Items (Itens de Risco)

- `GET /api/risk-items` - Listar todos os itens
- `GET /api/risk-items/:id` - Buscar item por ID
- `GET /api/risk-items/fast-track` - Listar itens Fast Track
- `GET /api/risk-items/week/:weekReference` - Listar itens por semana
- `POST /api/risk-items` - Criar novo item
- `PUT /api/risk-items/:id` - Atualizar item
- `DELETE /api/risk-items/:id` - Deletar item (soft delete)

### PO Analyses (Análises dos POs)

- `GET /api/po-analyses` - Listar todas as análises
- `GET /api/po-analyses/:id` - Buscar análise por ID
- `GET /api/po-analyses/risk-item/:riskItemId` - Listar análises por item de risco
- `GET /api/po-analyses/product/:productId` - Listar análises por produto
- `POST /api/po-analyses` - Criar nova análise
- `PUT /api/po-analyses/:id` - Atualizar análise
- `DELETE /api/po-analyses/:id` - Deletar análise

### Committee Decisions (Decisões do Comitê)

- `GET /api/committee-decisions` - Listar todas as decisões
- `GET /api/committee-decisions/:id` - Buscar decisão por ID
- `GET /api/committee-decisions/risk-item/:riskItemId` - Buscar decisão por item de risco
- `GET /api/committee-decisions/pending-direction` - Listar decisões pendentes de direção
- `GET /api/committee-decisions/severity/:severityCode` - Listar decisões por severidade
- `POST /api/committee-decisions` - Criar nova decisão
- `PUT /api/committee-decisions/:id` - Atualizar decisão

### Action Plans (Planos de Ação)

- `GET /api/action-plans` - Listar todos os planos
- `GET /api/action-plans/:id` - Buscar plano por ID
- `GET /api/action-plans/risk-item/:riskItemId` - Listar planos por item de risco
- `GET /api/action-plans/overdue` - Listar planos em atraso
- `GET /api/action-plans/status/:statusName` - Listar planos por status
- `POST /api/action-plans` - Criar novo plano
- `PUT /api/action-plans/:id` - Atualizar plano
- `PUT /api/action-plans/:id/direction-approved` - Marcar como aprovado pela direção
- `DELETE /api/action-plans/:id` - Deletar plano

### Direction Reviews (Revisões da Direção)

- `GET /api/direction-reviews` - Listar todas as revisões
- `GET /api/direction-reviews/:id` - Buscar revisão por ID
- `GET /api/direction-reviews/risk-item/:riskItemId` - Listar revisões por item de risco
- `GET /api/direction-reviews/pending` - Listar revisões pendentes
- `GET /api/direction-reviews/requiring-adjustment` - Listar revisões que precisam de ajuste
- `POST /api/direction-reviews` - Criar nova revisão
- `PUT /api/direction-reviews/:id` - Atualizar revisão

### Dashboard

- `GET /api/dashboard/summary` - Resumo do dashboard com métricas
- `GET /api/dashboard/critical-items` - Itens críticos (P1)
- `GET /api/dashboard/upcoming-deadlines` - Próximos prazos
- `GET /api/dashboard/recent-decisions` - Decisões recentes
- `GET /api/dashboard/pending-direction` - Itens pendentes de direção

### Lookups (Cadastros Auxiliares)

- `GET /api/lookups/all` - Todos os cadastros de uma vez
- `GET /api/lookups/products` - Produtos
- `GET /api/lookups/severities` - Severidades (P1, P2, P3, P4)
- `GET /api/lookups/event-sources` - Fontes de eventos
- `GET /api/lookups/event-types` - Tipos de eventos
- `GET /api/lookups/committee-statuses` - Status do comitê
- `GET /api/lookups/action-statuses` - Status de ações
- `GET /api/lookups/participants` - Participantes
- `GET /api/lookups/product-owners` - Donos de produtos
- `GET /api/lookups/roles` - Roles de usuários

## Geração de IDs

O sistema gera automaticamente os IDs no formato especificado:

- **CR-AAAA-NNN** para Itens de Risco (Comitê de Risco)
  - Exemplo: CR-2026-001, CR-2026-002
- **PA-AAAA-NNN** para Planos de Ação
  - Exemplo: PA-2026-001, PA-2026-002

A numeração é sequencial por ano e reiniciada anualmente.

## Timeline Automática

O sistema cria automaticamente eventos de timeline para rastreabilidade:

- Criação de item
- Vinculação de produtos
- Criação/atualização de análises de PO
- Criação/atualização de decisões do comitê
- Criação/atualização/conclusão de planos de ação
- Submissão/aprovação pela direção
- Mudanças de status
- Ativação de Fast Track
- Mudanças de severidade

## Validação

Todos os endpoints POST e PUT utilizam validação com Joi para garantir a integridade dos dados.

## Scripts Disponíveis

- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento com auto-reload
- `npm run prisma:generate` - Gera o cliente Prisma
- `npm run prisma:migrate` - Executa migrations do Prisma
- `npm run prisma:seed` - Popula o banco com dados iniciais
- `npm run prisma:studio` - Abre o Prisma Studio (interface visual do banco)

## Banco de Dados

O banco de dados SQLite é criado automaticamente na primeira execução das migrations. O arquivo `dev.db` fica no diretório `prisma/`.

Para visualizar e editar o banco de dados graficamente:

```bash
npm run prisma:studio
```

## Dados Iniciais (Seed)

O seed popula o banco com:

- **4 Roles**: Admin, PO, Participante, Leitura
- **9 Participantes**: Mártin, Osva, Vitor, Gian, Bruno, Debiasi, Barbara, Cassi, Luana
- **5 Product Owners**: Bruno Bevilaqua, Gian, Vitor, Osvanir (Osva), Mártin Marcelo Koller
- **7 Produtos**: ClippPro, SmallCommerce, GPro, GWeb, ZWeb, ClippFácil, Clipp360
- **8 Event Sources**: Portal NF-e/NFC-e, Portal CT-e, CONFAZ, Receita Federal, SEFAZ, Grupo Oficial, Comunicado Interno, Outro
- **6 Event Types**: NT, Comunicado, Alteração Técnica, Alteração Operacional, Sinal Externo, Outro
- **4 Severities**: P1 (Crítico), P2 (Alto), P3 (Médio), P4 (Informativo)
- **12 Committee Statuses**: Identificado, Em análise pelos POs, Em consolidação entre POs, Em validação no Comitê, Aguardando Jurídico, Aguardando Direção, Plano de ação aprovado, Em execução, Em monitoramento, Concluído, Sem ação, Cancelado
- **6 Action Statuses**: Aguardando Direção, Aprovado, Em andamento, Bloqueado, Concluído, Cancelado
- **1 Usuário padrão**: admin@comiterisco.com (para futuro sistema de login)

## Exemplo de Uso

### Criar um novo Item de Risco

```bash
curl -X POST http://localhost:3001/api/risk-items \
  -H "Content-Type: application/json" \
  -d '{
    "weekReference": "17/2026",
    "dateIdentified": "2026-04-23T08:00:00Z",
    "monitoringResponsible": "Gian",
    "eventSourceId": 1,
    "eventTypeId": 1,
    "title": "Nova NT sobre NF-e",
    "summary": "Nota técnica publicada com alterações na emissão de NF-e",
    "requiresPoAnalysis": true,
    "monitoringStatus": "Identificado",
    "productIds": [1, 2, 3]
  }'
```

### Buscar resumo do Dashboard

```bash
curl http://localhost:3001/api/dashboard/summary
```

### Buscar todos os cadastros auxiliares

```bash
curl http://localhost:3001/api/lookups/all
```

## Próximos Passos

1. Implementar autenticação e autorização
2. Adicionar testes unitários e de integração
3. Implementar sistema de notificações
4. Adicionar logs mais detalhados
5. Implementar cache para endpoints frequentemente acessados
6. Preparar para deploy em produção

## Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.
