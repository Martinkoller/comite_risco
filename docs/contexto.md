
====================================================
CONTEXTO FUNCIONAL COMPLETO
SISTEMA: COMITÊ DE RISCO DA ZUCCHETTI – BU POS
====================================================

====================================================
1. OBJETIVO DO SISTEMA
====================================================

Este sistema web substituirá uma planilha operacional usada pelo “Comitê de Risco da Zucchetti – BU POS”.

Objetivo do sistema:
- registrar itens identificados em monitoramento regulatório/técnico
- permitir análise individual dos POs por produto
- consolidar decisão do comitê
- controlar planos de ação
- controlar submissão/aprovação pela Direção
- manter histórico e rastreabilidade completa
- fornecer dashboard executivo
- centralizar a governança semanal do comitê

O sistema é um produto interno de governança operacional/regulatória.

====================================================
2. NOMES E SIGNIFICADO DOS IDs
====================================================

2.1 CR
CR = Comitê de Risco (identificador do item principal monitorado)

Formato:
CR-AAAA-NNN

Exemplo:
- CR-2026-001
- CR-2026-002

Significado:
- AAAA = ano
- NNN = número sequencial dentro do ano

2.2 PA
PA = Plano de Ação (identificador de uma ação derivada de um item CR)

Formato:
PA-AAAA-NNN

Exemplo:
- PA-2026-001
- PA-2026-002

Significado:
- AAAA = ano
- NNN = número sequencial dentro do ano

====================================================
3. PROCESSO DE NEGÓCIO / WORKFLOW DO COMITÊ
====================================================

O sistema deve refletir o rito semanal oficial do Comitê.

3.1 Terça-feira – 08:00
Etapa: Monitoramento inicial
Responsável principal: Gian

Atividades:
- monitorar portais e fontes mapeadas
- identificar NTs, comunicados, alterações técnicas, sinais externos
- registrar itens novos no sistema
- gerar resumo semanal
- indicar produtos potencialmente afetados

Saída:
- um ou mais “Risk Items” (itens CR) cadastrados

3.2 Quarta-feira
Etapa: Análise individual dos POs

Atividades:
- cada PO avalia impacto do item em seus produtos
- pode haver múltiplas análises por item
- uma análise por produto / PO afetado
- cada análise registra impacto, risco, necessidade de implementação, dependências, dúvidas e severidade sugerida

Saída:
- registros de “PO Analyses”

3.3 Quinta-feira de manhã
Etapa: Consolidação técnica entre POs

Atividades:
- todos os POs discutem:
  - pendências da semana anterior
  - eventos da semana atual
- alinham entendimento técnico/funcional
- identificam se o item:
  - segue sem ação
  - entra em monitoramento
  - precisa ação
  - precisa plano de ação
  - precisa escalonamento para Direção
  - precisa acionar Jurídico

Saída:
- entendimento consolidado para reunião ampliada

3.4 Quinta-feira à tarde
Etapa: Reunião do Comitê ampliado

Participantes fixos:
- Mártin Marcelo Koller (Responsável pela Governança)
- Osva
- Vitor
- Gian
- Bruno
- Debiasi (Suporte)
- Barbara (CS)
- Cassi (CS)
- Luana (Marketing)

Participante sob demanda:
- Jurídico (quando houver dúvida, ambiguidade ou risco de interpretação)

Atividades:
- revisar itens da semana
- consolidar severidade final
- registrar impactos interáreas
- decidir se há ação
- decidir se precisa plano de ação
- decidir se vai para Direção
- registrar decisão oficial do comitê
- atualizar status do item

Saída:
- 1 decisão oficial por item (Committee Decision)

3.5 Próxima terça-feira – 08:00
Etapa: Reunião de Gestão / Direção

Participante:
- somente Mártin Marcelo Koller

Direção:
- Diretor atual: Marcelo Stivanello

Atividades:
- Mártin leva os itens aprovados pelo comitê
- Direção sempre aprova ou orienta ajustes
- Direção não participa da quinta à tarde

Saída:
- registro de “Direction Review” (aprovação, pendência, ajuste, observações)

====================================================
4. ENTIDADES PRINCIPAIS
====================================================

O sistema deve ter as seguintes entidades principais:

1. Risk Item (item principal do comitê)
2. PO Analysis (análise individual do PO por produto)
3. Committee Decision (decisão oficial consolidada do comitê)
4. Action Plan (ações decorrentes do item)
5. Direction Review (submissão e retorno da Direção)
6. Timeline Event (rastreabilidade do item)

====================================================
5. ENTIDADE PRINCIPAL: RISK ITEM (CR)
====================================================

Representa um item identificado no monitoramento inicial.
É a entidade principal do sistema.

Cada item CR representa:
- uma NT
- um comunicado
- uma alteração técnica
- uma alteração operacional
- um sinal externo relevante
- qualquer evento que possa impactar produtos do BU POS

Campos esperados:

- id (PK interno)
- code (CR-AAAA-NNN)
- weekReference (ex.: 17/2026)
- dateIdentified
- monitoringResponsible (normalmente Gian)
- eventSourceId (fonte/origem)
- eventTypeId (tipo do evento)
- title
- summary
- publishedAt (opcional)
- officialDeadline (opcional)
- preliminarySeverityId (opcional)
- requiresPoAnalysis (boolean)
- monitoringStatus (status inicial do monitoramento)
- initialNotes (opcional)
- isFastTrack (boolean)
- createdAt
- updatedAt

Relacionamentos:
- um Risk Item pode impactar vários produtos
- um Risk Item pode ter várias análises de POs
- um Risk Item tem no máximo uma decisão oficial do comitê
- um Risk Item pode ter vários planos de ação
- um Risk Item pode ter uma ou mais revisões da Direção
- um Risk Item pode ter vários eventos de timeline

====================================================
6. RELAÇÃO ENTRE RISK ITEM E PRODUTOS
====================================================

Um item pode impactar vários produtos.

Exemplo:
- uma NT pode impactar ZWeb + ClippFácil + Clipp360

Portanto:
- relação N:N entre Risk Item e Product

Sugestão:
- tabela intermediária risk_item_products

====================================================
7. ENTIDADE: PO ANALYSIS
====================================================

Representa a análise individual de um PO para um item CR em um produto específico.

Regras:
- um item pode ter várias análises
- normalmente uma análise por produto / PO
- se um item impacta 3 produtos, deve poder ter 3 análises

Campos esperados:
- id
- riskItemId
- analysisDate
- poResponsible
- productId
- impactsProduct (Sim / Não / Em avaliação)
- impactType (Funcional / Técnico / Operacional / Comunicação / Misto)
- impactLevel (Real / Provável / Possível)
- needsImplementation (Sim / Não / Talvez)
- nonComplianceRisk (boolean)
- operationalRisk (boolean)
- customerImpact (boolean)
- dependencies (texto)
- doubtsAmbiguities (texto)
- needsLegalReview (Sim / Não / Talvez)
- suggestedSeverityId
- recommendation
- notes
- createdAt
- updatedAt

====================================================
8. ENTIDADE: COMMITTEE DECISION
====================================================

Representa a decisão oficial do comitê para um item CR.
Cada item deve ter no máximo uma decisão oficial consolidada.

Campos esperados:
- id
- riskItemId (unique)
- meetingDate (quinta à tarde)
- finalSeverityId
- impactedProducts (texto consolidado ou derivado)
- involvedPos (texto consolidado)
- supportImpact (Não / Baixo / Médio / Alto)
- csImpact (Não / Baixo / Médio / Alto)
- marketingImpact (Não / Baixo / Médio / Alto)
- legalTriggered (boolean)
- decisionText (decisão oficial)
- hasAction (boolean)
- hasActionPlan (boolean)
- goesToDirection (boolean)
- mainResponsible
- initialDeadline (opcional)
- committeeStatusId
- submittedToDirectionAt (opcional)
- directionApproved (Sim / Não / Pendente)
- notes
- createdAt
- updatedAt

Regras:
- se hasAction = true, o sistema deve permitir criar Action Plans
- se goesToDirection = true, deve aparecer no módulo de aprovação da Direção
- se finalSeverity = P1, o sistema deve permitir / destacar Fast Track

====================================================
9. ENTIDADE: ACTION PLAN (PA)
====================================================

Representa ações concretas decorrentes de um item CR.
Um item pode ter várias ações.

Cada Action Plan pode ser:
- ação de Produto
- ação de Desenvolvimento
- ação de Suporte
- ação de CS
- ação de Marketing
- ação de Jurídico
- ação da Direção
- outra ação operacional

Campos esperados:
- id
- code (PA-AAAA-NNN)
- riskItemId
- theme
- responsibleArea
- responsibleName
- actionDescription
- dependencies
- openedAt
- deadline
- actionStatusId
- directionApprovedAt
- notes
- createdAt
- updatedAt

Regras:
- um item pode ter N Action Plans
- se o item tiver hasActionPlan = true, espera-se pelo menos 1 Action Plan
- toda ação precisa ter responsável

====================================================
10. ENTIDADE: DIRECTION REVIEW
====================================================

Representa a submissão do item para Direção e o retorno da gestão.

Campos esperados:
- id
- riskItemId
- submittedAt
- reviewedAt (opcional)
- approvalStatus (Aprovado / Pendente / Ajustar e retornar)
- requiresAdjustment (boolean)
- directionNotes (texto)
- directorName (default: Marcelo Stivanello)
- createdAt
- updatedAt

Regras:
- um item pode ter múltiplos registros de direção (ex.: volta para ajuste)
- a versão mais recente é a vigente

====================================================
11. ENTIDADE: TIMELINE EVENT
====================================================

Toda mudança relevante no item deve gerar rastreabilidade.

Exemplos de eventos:
- item criado
- produto vinculado
- análise PO criada
- decisão do comitê criada
- item enviado à Direção
- item aprovado
- plano de ação criado
- status alterado
- Fast Track ativado

Campos:
- id
- riskItemId
- eventType
- description
- eventDate
- createdBy
- createdAt

====================================================
12. CADASTROS AUXILIARES
====================================================

O sistema deve ter cadastros auxiliares (lookups) para alimentar dropdowns e manter padronização.

Cadastros obrigatórios:

1. Roles
- Admin
- PO
- Participante
- Leitura

2. Users (preparado para login futuro)

3. Participants
Participantes fixos:
- Mártin Marcelo Koller
- Osva
- Vitor
- Gian
- Bruno
- Debiasi
- Barbara
- Cassi
- Luana

4. Products
- ClippPro
- SmallCommerce
- GPro
- GWeb
- ZWeb
- ClippFácil
- Clipp360

5. Product Owners
- ClippPro -> Bruno Bevilaqua
- SmallCommerce -> Gian
- GPro -> Vitor
- GWeb -> Osvanir (Osva)
- ZWeb -> Mártin Marcelo Koller / Gian
- ClippFácil -> Mártin Marcelo Koller / Gian
- Clipp360 -> Mártin Marcelo Koller / Gian

6. Event Sources
Exemplos:
- Portal NF-e / NFC-e
- Portal CT-e
- CONFAZ
- Receita Federal
- SEFAZ
- Grupo Oficial
- Comunicado Interno
- Outro

7. Event Types
- NT
- Comunicado
- Alteração Técnica
- Alteração Operacional
- Sinal Externo
- Outro

8. Severities
- P1
- P2
- P3
- P4

9. Committee Statuses
- Identificado
- Em análise pelos POs
- Em consolidação entre POs
- Em validação no Comitê
- Aguardando Jurídico
- Aguardando Direção
- Plano de ação aprovado
- Em execução
- Em monitoramento
- Concluído
- Sem ação
- Cancelado

10. Action Statuses
- Aguardando Direção
- Aprovado
- Em andamento
- Bloqueado
- Concluído
- Cancelado

====================================================
13. REGRAS DE NEGÓCIO IMPORTANTES
====================================================

1. Todo item nasce em Risk Item
Nenhum item deve nascer direto em decisão ou plano de ação.

2. Um item pode ter múltiplas análises PO
Uma por produto / PO afetado.

3. Um item tem no máximo uma decisão oficial do comitê
Usar unique em riskItemId na entidade Committee Decision.

4. Um item pode ter múltiplos planos de ação

5. Se hasAction = true
O sistema deve permitir e incentivar criação de plano de ação.

6. Se goesToDirection = true
O item deve aparecer no módulo de aprovação da Direção.

7. Se finalSeverity = P1
Permitir Fast Track e destacar visualmente.

8. Itens com status:
- Concluído
- Sem ação
- Cancelado
devem poder ir para histórico/encerrados.

9. Todo item precisa de rastreabilidade
Criar Timeline Events automáticos nas principais operações.

10. A Direção sempre aprova ou orienta ajuste
Nunca “ignora” o item.

====================================================
14. CLASSIFICAÇÃO DE SEVERIDADE
====================================================

P1 – Crítico
- impacta emissão, operação crítica ou conformidade
- prazo muito curto
- risco imediato
- pode acionar Fast Track

P2 – Alto
- exige adequação obrigatória
- impacto relevante
- segue rito normal

P3 – Médio
- impacto limitado
- pode exigir ajustes ou planejamento

P4 – Informativo
- sem ação imediata
- apenas monitoramento

====================================================
15. FAST TRACK
====================================================

Fast Track existe para casos P1.

Regras:
- deve existir campo isFastTrack no item CR
- quando ativado:
  - deve gerar Timeline Event
  - deve ficar visualmente destacado
  - deve permitir fluxo antecipado antes do rito semanal
  - deve registrar que o Diretor foi avisado

Opcional:
- pode haver um campo “fastTrackReason”
- pode haver um campo “directorNotifiedAt”

Se você achar melhor, pode adicionar esses campos ao schema.

====================================================
16. DASHBOARD – MÉTRICAS E INDICADORES
====================================================

O dashboard deve mostrar visão executiva.

Cards obrigatórios:
- total de itens identificados
- itens em análise
- itens aguardando direção
- itens em execução
- itens em monitoramento
- itens concluídos

Indicadores por severidade:
- total P1
- total P2
- total P3
- total P4

Blocos recomendados:
- itens críticos da semana (P1)
- próximos prazos
- últimas decisões do comitê
- ações em atraso
- itens enviados para Direção pendentes de retorno

Sugestão de métricas backend:
- contagem por status
- contagem por severidade
- contagem de Action Plans em atraso
- itens com deadline próximo (7 dias)
- itens Fast Track abertos

====================================================
17. TELA DE DETALHE DO ITEM (VISÃO 360)
====================================================

A UI do item deve ter uma visão 360, com abas:

1. Dados gerais
2. Produtos impactados
3. Análises dos POs
4. Decisão do Comitê
5. Planos de Ação
6. Aprovação da Direção
7. Timeline / Histórico

====================================================
18. MÓDULOS DA API (ESPERADOS)
====================================================

Módulos principais da API REST:

1. risk-items
2. po-analyses
3. committee-decisions
4. action-plans
5. direction-reviews
6. dashboard
7. lookups

====================================================
19. ENDPOINTS MÍNIMOS ESPERADOS
====================================================

Risk Items
- GET /api/risk-items
- GET /api/risk-items/:id
- POST /api/risk-items
- PUT /api/risk-items/:id
- DELETE /api/risk-items/:id (opcional, preferir soft delete se desejar)

PO Analyses
- GET /api/po-analyses
- POST /api/po-analyses
- PUT /api/po-analyses/:id
- DELETE /api/po-analyses/:id

Committee Decisions
- GET /api/committee-decisions
- POST /api/committee-decisions
- PUT /api/committee-decisions/:id

Action Plans
- GET /api/action-plans
- POST /api/action-plans
- PUT /api/action-plans/:id
- DELETE /api/action-plans/:id (opcional)

Direction Reviews
- GET /api/direction-reviews
- POST /api/direction-reviews
- PUT /api/direction-reviews/:id

Dashboard
- GET /api/dashboard/summary

Lookups
- GET /api/lookups/products
- GET /api/lookups/severities
- GET /api/lookups/event-sources
- GET /api/lookups/event-types
- GET /api/lookups/committee-statuses
- GET /api/lookups/action-statuses
- GET /api/lookups/participants

====================================================
20. UX / UI (QUANDO FOR PARA O FRONTEND)
====================================================

Layout desejado:
- menu lateral
- topo com título da tela
- dashboard com cards
- tabelas com filtros
- formulários em modal ou páginas dedicadas
- tela de detalhe com abas
- badges coloridas para severidade e status
- timeline visual

Sugestão:
- Vue 3 + Vite
- Vue Router
- Pinia (se necessário)
- TailwindCSS

====================================================
21. SEED INICIAL OBRIGATÓRIO
====================================================

O banco deve ser populado inicialmente com:
- roles
- participantes
- produtos
- donos de produto
- event sources
- event types
- severities
- committee statuses
- action statuses

====================================================
22. PRIORIDADE DE IMPLEMENTAÇÃO (IMPORTANTE)
====================================================

Implemente primeiro em backend:

1. Schema completo Prisma
2. Migrations
3. Seed
4. CRUD real de Risk Items
5. CRUD real de PO Analyses
6. CRUD real de Committee Decisions
7. CRUD real de Action Plans
8. CRUD real de Direction Reviews
9. Timeline automática
10. Dashboard summary
11. Lookups

NÃO gere frontend ainda, a menos que eu peça.

====================================================
23. ENTREGA DESEJADA AGORA
====================================================

Com base neste contexto funcional, quero que você gere a Fase 1 real do backend com:

- Node.js + Express
- SQLite
- Prisma
- estrutura de pastas
- schema Prisma
- migrations
- seed
- controllers
- services
- rotas REST
- geração automática dos IDs:
  - CR-AAAA-NNN
  - PA-AAAA-NNN
- gravação automática de timeline nos principais eventos
- instruções de execução

IMPORTANTE:
- Gere código funcional, não pseudocódigo
- Entregue em etapas se necessário
- Priorize clareza, organização e capacidade de evolução futura