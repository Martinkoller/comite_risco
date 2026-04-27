Crie um sistema web completo, moderno e funcional para gestão do “Comitê de Risco da Zucchetti – BU POS”, utilizando:

- Frontend: Vue 3 com Vite
- Backend: Node.js com Express
- Banco de dados: SQLite
- ORM: Prisma (preferencialmente)
- Arquitetura separada entre frontend e backend
- Interface responsiva, limpa, corporativa e intuitiva
- Código organizado, pronto para evolução futura
- Projeto completo, com estrutura de pastas, rotas, componentes, páginas, APIs e banco

====================================================
OBJETIVO DO SISTEMA
====================================================

O sistema substituirá uma planilha operacional e será usado para controlar o processo semanal do Comitê de Risco da Zucchetti – BU POS, responsável por:

- monitorar NTs e eventos relevantes
- registrar itens identificados
- permitir análise individual dos POs por produto
- consolidar decisão do comitê
- controlar planos de ação
- acompanhar aprovação da Direção
- manter histórico e rastreabilidade
- exibir um painel executivo

O sistema deve funcionar como um “mini ERP interno” do comitê.

====================================================
CONTEXTO DE NEGÓCIO
====================================================

Nome oficial:
Comitê de Risco da Zucchetti – BU POS

Responsável pela Governança:
Mártin Marcelo Koller

Objetivo:
Monitorar mudanças regulatórias, técnicas e operacionais com impacto nos produtos do BU POS, identificar riscos, avaliar impactos, definir ações e submeter decisões à Direção.

Direção:
- Diretor responsável atual: Marcelo Stivanello
- A Direção sempre aprova as definições e planos de ação
- A Direção não participa da reunião de quinta à tarde
- Mártin é o responsável por levar os temas para a reunião de gestão na terça-feira às 08:00

====================================================
RITO OPERACIONAL DO COMITÊ
====================================================

1. Terça-feira às 08:00
- Gian monitora portais/fontes mapeadas
- cria resumo semanal
- registra itens identificados

2. Quarta-feira
- cada PO faz análise individual dos itens em seus produtos
- levanta impacto, dúvidas, necessidade de implementação, risco e dependências

3. Quinta-feira de manhã
- todos os POs discutem pendências da semana anterior e eventos da semana atual
- consolidam entendimento técnico/funcional

4. Quinta-feira à tarde
- comitê ampliado revisa os itens
- define severidade
- decide se há ação
- define se precisa plano de ação
- atualiza status
- prepara submissão para Direção

5. Próxima terça às 08:00
- Mártin leva os temas para a Direção
- Direção aprova ou orienta ajustes

====================================================
PRODUTOS NO ESCOPO
====================================================

1. ClippPro
- Plataforma: Desktop
- Segmento: Varejo e Serviços
- Responsável: Bruno Bevilaqua

2. SmallCommerce
- Plataforma: Desktop
- Segmento: Pequeno Varejo
- Responsável: Gian

3. GPro
- Plataforma: Desktop
- Segmento: Varejo e Food
- Responsável: Vitor

4. GWeb
- Plataforma: Web
- Segmento: Nano Varejo
- Responsável: Osvanir (Osva)

5. ZWeb
- Plataforma: Web
- Segmento: Nano Varejo
- Responsáveis: Mártin Marcelo Koller / Gian

6. ClippFácil
- Plataforma: Web
- Segmento: Nano Varejo
- Responsáveis: Mártin Marcelo Koller / Gian

7. Clipp360
- Plataforma: Web
- Segmento: Nano Varejo
- Responsáveis: Mártin Marcelo Koller / Gian

====================================================
PARTICIPANTES FIXOS DO COMITÊ
====================================================

- Mártin Marcelo Koller (Responsável pela Governança)
- Osva (PO)
- Vitor (PO)
- Gian (PO)
- Bruno (PO)
- Debiasi (Suporte)
- Barbara (CS)
- Cassi (CS)
- Luana (Marketing)

Participante sob demanda:
- Jurídico (quando houver dúvidas, ambiguidades ou risco de interpretação)

====================================================
CLASSIFICAÇÃO DE SEVERIDADE
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
FAST TRACK
====================================================

Deve existir suporte a Fast Track:
- usado em casos P1
- permite ação antes do rito semanal normal
- exige aviso ao Diretor Marcelo Stivanello
- mesmo em Fast Track, deve haver registro e rastreabilidade

====================================================
MÓDULOS DO SISTEMA (OBRIGATÓRIOS)
====================================================

1. Dashboard / Painel
2. Monitoramento de Itens
3. Análise dos POs
4. Decisão do Comitê
5. Planos de Ação
6. Reunião de Gestão / Aprovação da Direção
7. Histórico / Encerrados
8. Cadastros auxiliares
9. Timeline / rastreabilidade por item

====================================================
TELAS OBRIGATÓRIAS
====================================================

1. LOGIN SIMPLES (opcional, mas já deixar preparado)
- pode ser local
- perfis básicos:
  - Admin
  - PO
  - Participante
  - Leitura

2. DASHBOARD
Exibir cards com:
- total de itens identificados
- em análise
- aguardando direção
- em execução
- em monitoramento
- concluídos
- total P1
- total P2
- total P3
- total P4

Exibir também:
- itens críticos da semana
- próximos prazos
- últimas decisões do comitê
- ações em atraso

3. LISTAGEM DE ITENS (Monitoramento)
CRUD completo:
- criar item
- editar item
- visualizar item
- filtrar
- pesquisar
- ordenar

Campos:
- ID do item (gerado automaticamente, ex: CR-2026-001)
- semana referência
- data da identificação
- responsável monitoramento
- origem
- tipo de evento
- título
- resumo
- data publicação
- prazo oficial
- produtos potenciais
- severidade preliminar
- necessita análise dos POs
- status de monitoramento
- observações iniciais

4. DETALHE DO ITEM (VISÃO 360)
Página completa com abas:
- Dados gerais
- Análises dos POs
- Decisão do comitê
- Plano de ação
- Aprovação da direção
- Histórico / Timeline

5. ANÁLISE DOS POs
Permitir múltiplas análises por item (uma por produto / PO)
Campos:
- item
- data da análise
- PO responsável
- produto
- impacta produto
- tipo de impacto
- nível de impacto
- precisa implementação
- risco não conformidade
- risco operacional
- impacto cliente
- dependências
- dúvidas / ambiguidades
- precisa jurídico
- severidade sugerida
- recomendação do PO
- observações

6. DECISÃO DO COMITÊ
Tela para registrar decisão consolidada do item
Campos:
- item
- data da reunião do comitê
- severidade final
- produtos impactados
- POs envolvidos
- impacto suporte
- impacto CS
- impacto marketing
- jurídico acionado
- decisão do comitê
- há ação
- há plano de ação
- vai para direção
- responsável principal
- prazo inicial
- status oficial
- data submissão direção
- aprovado direção
- observações

7. PLANO DE AÇÃO
Permitir múltiplas ações por item
Campos:
- ID da ação (gerado automaticamente, ex: PA-2026-001)
- item
- tema da ação
- área responsável
- responsável
- descrição da ação
- dependências
- data abertura
- prazo
- status da ação
- data aprovação direção
- observações

8. REUNIÃO DE GESTÃO / APROVAÇÃO
Tela para listar itens que vão para a Direção
Permitir:
- visualizar resumo executivo
- marcar como aprovado
- marcar como pendente
- registrar observações da Direção
- registrar data de submissão
- registrar data de retorno
- indicar se houve ajuste solicitado

9. HISTÓRICO / ENCERRADOS
Tela para listar itens:
- concluídos
- sem ação
- cancelados
Com filtros por:
- período
- produto
- severidade
- tipo de evento

10. CADASTROS AUXILIARES
Criar telas simples de cadastro para:
- produtos
- participantes
- áreas
- tipos de evento
- status oficiais
- status de ação
- severidades
- origens/fontes

====================================================
REGRAS DE NEGÓCIO OBRIGATÓRIAS
====================================================

1. Todo item nasce no módulo de Monitoramento
2. Um item pode ter várias análises de PO
3. Um item deve ter no máximo 1 decisão oficial do comitê
4. Um item pode ter vários planos de ação
5. Se “há ação = sim”, o sistema deve permitir e incentivar criação de plano de ação
6. Se “vai para direção = sim”, deve aparecer na tela de aprovação da direção
7. Se item for P1, permitir marcar Fast Track
8. Itens com status:
   - Concluído
   - Sem ação
   - Cancelado
   devem poder ser arquivados no histórico
9. Manter rastreabilidade completa por item
10. Mostrar timeline do item com:
   - criação
   - análises dos POs
   - decisão do comitê
   - envio à direção
   - aprovação
   - ações criadas
   - alterações importantes

====================================================
BANCO DE DADOS – MODELO ESPERADO
====================================================

Criar schema completo em SQLite com tabelas bem normalizadas, incluindo pelo menos:

- users
- roles
- products
- participants
- areas
- event_sources
- event_types
- severities
- committee_statuses
- action_statuses
- risk_items
- risk_item_products (N:N se necessário)
- po_analyses
- committee_decisions
- action_plans
- direction_reviews
- timeline_events
- attachments (opcional)
- settings (opcional)

Criar migrations e seed inicial.

====================================================
SEED INICIAL OBRIGATÓRIO
====================================================

Popular o banco com:
- participantes do comitê
- produtos do BU POS
- áreas padrão
- severidades P1-P4
- status oficiais
- status de ação
- tipos de evento
- algumas origens padrão

====================================================
UX / UI
====================================================

Interface com visual corporativo, limpo e moderno.

Desejo:
- layout com menu lateral
- topo com título da tela
- dashboard com cards
- tabelas com filtros
- formulários em modal ou páginas dedicadas
- tela de detalhe com abas
- badges coloridas para severidade e status
- timeline visual do item
- design agradável e funcional

Pode usar:
- TailwindCSS
- componentes reutilizáveis
- composição limpa
- Vue Router
- Pinia (se fizer sentido)

====================================================
REQUISITOS TÉCNICOS
====================================================

1. Entregar estrutura completa de pastas frontend e backend
2. Criar rotas da API REST
3. Criar controllers / services organizados
4. Criar schema Prisma
5. Criar migrations
6. Criar seed
7. Criar componentes Vue reutilizáveis
8. Criar páginas principais
9. Criar navegação
10. Criar exemplos reais de CRUD funcionando
11. Criar tratamento básico de erros
12. Criar validações mínimas
13. Criar IDs automáticos no padrão:
   - CR-AAAA-NNN
   - PA-AAAA-NNN

====================================================
ENTREGA ESPERADA
====================================================

Quero que você entregue:

1. Estrutura completa do projeto
2. Código do backend
3. Código do frontend
4. Banco de dados SQLite com Prisma
5. Rotas da API
6. Modelos e relacionamentos
7. Telas Vue completas
8. Seeds iniciais
9. Instruções passo a passo para rodar localmente
10. Sugestões de melhorias futuras

IMPORTANTE:
- Gere um sistema funcional, não apenas um mockup
- Priorize organização e clareza
- Escreva código limpo e pronto para evolução
- Se necessário, entregue em etapas começando pela estrutura base + banco + APIs + telas principais
- O sistema deve ser preparado para crescimento futuro, podendo virar um produto interno real