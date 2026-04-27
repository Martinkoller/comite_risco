import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // ROLES
  // ============================================
  console.log('Seeding Roles...');
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'Admin' },
      update: {},
      create: { name: 'Admin' },
    }),
    prisma.role.upsert({
      where: { name: 'PO' },
      update: {},
      create: { name: 'PO' },
    }),
    prisma.role.upsert({
      where: { name: 'Participante' },
      update: {},
      create: { name: 'Participante' },
    }),
    prisma.role.upsert({
      where: { name: 'Leitura' },
      update: {},
      create: { name: 'Leitura' },
    }),
  ]);

  // ============================================
  // PARTICIPANTS
  // ============================================
  console.log('Seeding Participants...');
  const participants = await Promise.all([
    prisma.participant.upsert({
      where: { name: 'Mártin Marcelo Koller' },
      update: {},
      create: { name: 'Mártin Marcelo Koller', role: 'Governança' },
    }),
    prisma.participant.upsert({
      where: { name: 'Osva' },
      update: {},
      create: { name: 'Osva', role: 'PO' },
    }),
    prisma.participant.upsert({
      where: { name: 'Vitor' },
      update: {},
      create: { name: 'Vitor', role: 'PO' },
    }),
    prisma.participant.upsert({
      where: { name: 'Gian' },
      update: {},
      create: { name: 'Gian', role: 'PO' },
    }),
    prisma.participant.upsert({
      where: { name: 'Bruno' },
      update: {},
      create: { name: 'Bruno', role: 'PO' },
    }),
    prisma.participant.upsert({
      where: { name: 'Debiasi' },
      update: {},
      create: { name: 'Debiasi', role: 'Suporte' },
    }),
    prisma.participant.upsert({
      where: { name: 'Barbara' },
      update: {},
      create: { name: 'Barbara', role: 'CS' },
    }),
    prisma.participant.upsert({
      where: { name: 'Cassi' },
      update: {},
      create: { name: 'Cassi', role: 'CS' },
    }),
    prisma.participant.upsert({
      where: { name: 'Luana' },
      update: {},
      create: { name: 'Luana', role: 'Marketing' },
    }),
  ]);

  // ============================================
  // PRODUCT OWNERS
  // ============================================
  console.log('Seeding Product Owners...');
  const productOwners = await Promise.all([
    prisma.productOwner.upsert({
      where: { name: 'Bruno Bevilaqua' },
      update: {},
      create: { name: 'Bruno Bevilaqua' },
    }),
    prisma.productOwner.upsert({
      where: { name: 'Gian' },
      update: {},
      create: { name: 'Gian' },
    }),
    prisma.productOwner.upsert({
      where: { name: 'Vitor' },
      update: {},
      create: { name: 'Vitor' },
    }),
    prisma.productOwner.upsert({
      where: { name: 'Osvanir (Osva)' },
      update: {},
      create: { name: 'Osvanir (Osva)' },
    }),
    prisma.productOwner.upsert({
      where: { name: 'Mártin Marcelo Koller' },
      update: {},
      create: { name: 'Mártin Marcelo Koller' },
    }),
  ]);

  // ============================================
  // PRODUCTS
  // ============================================
  console.log('Seeding Products...');
  const products = await Promise.all([
    prisma.product.upsert({
      where: { name: 'ClippPro' },
      update: { platform: 'Desktop', segment: 'Varejo e Serviços' },
      create: { name: 'ClippPro', platform: 'Desktop', segment: 'Varejo e Serviços', ownerId: productOwners[0].id },
    }),
    prisma.product.upsert({
      where: { name: 'SmallCommerce' },
      update: { platform: 'Desktop', segment: 'Pequeno Varejo' },
      create: { name: 'SmallCommerce', platform: 'Desktop', segment: 'Pequeno Varejo', ownerId: productOwners[1].id },
    }),
    prisma.product.upsert({
      where: { name: 'GPro' },
      update: { platform: 'Desktop', segment: 'Varejo e Food' },
      create: { name: 'GPro', platform: 'Desktop', segment: 'Varejo e Food', ownerId: productOwners[2].id },
    }),
    prisma.product.upsert({
      where: { name: 'GWeb' },
      update: { platform: 'Web', segment: 'Nano Varejo' },
      create: { name: 'GWeb', platform: 'Web', segment: 'Nano Varejo', ownerId: productOwners[3].id },
    }),
    prisma.product.upsert({
      where: { name: 'ZWeb' },
      update: { platform: 'Web', segment: 'Nano Varejo' },
      create: { name: 'ZWeb', platform: 'Web', segment: 'Nano Varejo', ownerId: productOwners[4].id },
    }),
    prisma.product.upsert({
      where: { name: 'ClippFácil' },
      update: { platform: 'Web', segment: 'Nano Varejo' },
      create: { name: 'ClippFácil', platform: 'Web', segment: 'Nano Varejo', ownerId: productOwners[4].id },
    }),
    prisma.product.upsert({
      where: { name: 'Clipp360' },
      update: { platform: 'Web', segment: 'Nano Varejo' },
      create: { name: 'Clipp360', platform: 'Web', segment: 'Nano Varejo', ownerId: productOwners[4].id },
    }),
  ]);

  // ============================================
  // EVENT SOURCES
  // ============================================
  console.log('Seeding Event Sources...');
  const eventSources = await Promise.all([
    prisma.eventSource.upsert({
      where: { name: 'Portal NF-e / NFC-e' },
      update: {},
      create: { name: 'Portal NF-e / NFC-e' },
    }),
    prisma.eventSource.upsert({
      where: { name: 'Portal CT-e' },
      update: {},
      create: { name: 'Portal CT-e' },
    }),
    prisma.eventSource.upsert({
      where: { name: 'CONFAZ' },
      update: {},
      create: { name: 'CONFAZ' },
    }),
    prisma.eventSource.upsert({
      where: { name: 'Receita Federal' },
      update: {},
      create: { name: 'Receita Federal' },
    }),
    prisma.eventSource.upsert({
      where: { name: 'SEFAZ' },
      update: {},
      create: { name: 'SEFAZ' },
    }),
    prisma.eventSource.upsert({
      where: { name: 'Grupo Oficial' },
      update: {},
      create: { name: 'Grupo Oficial' },
    }),
    prisma.eventSource.upsert({
      where: { name: 'Comunicado Interno' },
      update: {},
      create: { name: 'Comunicado Interno' },
    }),
    prisma.eventSource.upsert({
      where: { name: 'Outro' },
      update: {},
      create: { name: 'Outro' },
    }),
  ]);

  // ============================================
  // EVENT TYPES
  // ============================================
  console.log('Seeding Event Types...');
  const eventTypes = await Promise.all([
    prisma.eventType.upsert({
      where: { name: 'NT' },
      update: {},
      create: { name: 'NT' },
    }),
    prisma.eventType.upsert({
      where: { name: 'Comunicado' },
      update: {},
      create: { name: 'Comunicado' },
    }),
    prisma.eventType.upsert({
      where: { name: 'Alteração Técnica' },
      update: {},
      create: { name: 'Alteração Técnica' },
    }),
    prisma.eventType.upsert({
      where: { name: 'Alteração Operacional' },
      update: {},
      create: { name: 'Alteração Operacional' },
    }),
    prisma.eventType.upsert({
      where: { name: 'Sinal Externo' },
      update: {},
      create: { name: 'Sinal Externo' },
    }),
    prisma.eventType.upsert({
      where: { name: 'Outro' },
      update: {},
      create: { name: 'Outro' },
    }),
  ]);

  // ============================================
  // SEVERITIES
  // ============================================
  console.log('Seeding Severities...');
  const severities = await Promise.all([
    prisma.severity.upsert({
      where: { code: 'P1' },
      update: {},
      create: { 
        code: 'P1',
        name: 'Crítico',
        description: 'Impacta emissão, operação crítica ou conformidade. Prazo muito curto. Risco imediato.',
        level: 1,
      },
    }),
    prisma.severity.upsert({
      where: { code: 'P2' },
      update: {},
      create: { 
        code: 'P2',
        name: 'Alto',
        description: 'Exige adequação obrigatória. Impacto relevante. Segue rito normal.',
        level: 2,
      },
    }),
    prisma.severity.upsert({
      where: { code: 'P3' },
      update: {},
      create: { 
        code: 'P3',
        name: 'Médio',
        description: 'Impacto limitado. Pode exigir ajustes ou planejamento.',
        level: 3,
      },
    }),
    prisma.severity.upsert({
      where: { code: 'P4' },
      update: {},
      create: { 
        code: 'P4',
        name: 'Informativo',
        description: 'Sem ação imediata. Apenas monitoramento.',
        level: 4,
      },
    }),
  ]);

  // ============================================
  // COMMITTEE STATUSES
  // ============================================
  console.log('Seeding Committee Statuses...');
  const committeeStatuses = await Promise.all([
    prisma.committeeStatus.upsert({
      where: { name: 'Identificado' },
      update: {},
      create: { name: 'Identificado' },
    }),
    prisma.committeeStatus.upsert({
      where: { name: 'Em análise pelos POs' },
      update: {},
      create: { name: 'Em análise pelos POs' },
    }),
    prisma.committeeStatus.upsert({
      where: { name: 'Em consolidação entre POs' },
      update: {},
      create: { name: 'Em consolidação entre POs' },
    }),
    prisma.committeeStatus.upsert({
      where: { name: 'Em validação no Comitê' },
      update: {},
      create: { name: 'Em validação no Comitê' },
    }),
    prisma.committeeStatus.upsert({
      where: { name: 'Aguardando Jurídico' },
      update: {},
      create: { name: 'Aguardando Jurídico' },
    }),
    prisma.committeeStatus.upsert({
      where: { name: 'Aguardando Direção' },
      update: {},
      create: { name: 'Aguardando Direção' },
    }),
    prisma.committeeStatus.upsert({
      where: { name: 'Plano de ação aprovado' },
      update: {},
      create: { name: 'Plano de ação aprovado' },
    }),
    prisma.committeeStatus.upsert({
      where: { name: 'Em execução' },
      update: {},
      create: { name: 'Em execução' },
    }),
    prisma.committeeStatus.upsert({
      where: { name: 'Em monitoramento' },
      update: {},
      create: { name: 'Em monitoramento' },
    }),
    prisma.committeeStatus.upsert({
      where: { name: 'Concluído' },
      update: {},
      create: { name: 'Concluído' },
    }),
    prisma.committeeStatus.upsert({
      where: { name: 'Sem ação' },
      update: {},
      create: { name: 'Sem ação' },
    }),
    prisma.committeeStatus.upsert({
      where: { name: 'Cancelado' },
      update: {},
      create: { name: 'Cancelado' },
    }),
  ]);

  // ============================================
  // ACTION STATUSES
  // ============================================
  console.log('Seeding Action Statuses...');
  const actionStatuses = await Promise.all([
    prisma.actionStatus.upsert({
      where: { name: 'Aguardando Direção' },
      update: {},
      create: { name: 'Aguardando Direção' },
    }),
    prisma.actionStatus.upsert({
      where: { name: 'Aprovado' },
      update: {},
      create: { name: 'Aprovado' },
    }),
    prisma.actionStatus.upsert({
      where: { name: 'Em andamento' },
      update: {},
      create: { name: 'Em andamento' },
    }),
    prisma.actionStatus.upsert({
      where: { name: 'Bloqueado' },
      update: {},
      create: { name: 'Bloqueado' },
    }),
    prisma.actionStatus.upsert({
      where: { name: 'Concluído' },
      update: {},
      create: { name: 'Concluído' },
    }),
    prisma.actionStatus.upsert({
      where: { name: 'Cancelado' },
      update: {},
      create: { name: 'Cancelado' },
    }),
  ]);

  // ============================================
  // AREAS
  // ============================================
  console.log('Seeding Areas...');
  const areas = await Promise.all([
    prisma.area.upsert({ where: { name: 'Produto' },      update: {}, create: { name: 'Produto' } }),
    prisma.area.upsert({ where: { name: 'Desenvolvimento' }, update: {}, create: { name: 'Desenvolvimento' } }),
    prisma.area.upsert({ where: { name: 'Suporte' },      update: {}, create: { name: 'Suporte' } }),
    prisma.area.upsert({ where: { name: 'CS' },           update: {}, create: { name: 'CS' } }),
    prisma.area.upsert({ where: { name: 'Marketing' },    update: {}, create: { name: 'Marketing' } }),
    prisma.area.upsert({ where: { name: 'Jurídico' },     update: {}, create: { name: 'Jurídico' } }),
    prisma.area.upsert({ where: { name: 'Direção' },      update: {}, create: { name: 'Direção' } }),
    prisma.area.upsert({ where: { name: 'Outra' },        update: {}, create: { name: 'Outra' } }),
  ]);

  // ============================================
  // SETTINGS
  // ============================================
  console.log('Seeding Settings...');
  await Promise.all([
    prisma.setting.upsert({
      where: { key: 'committee_name' },
      update: {},
      create: { key: 'committee_name', value: 'Comitê de Risco da Zucchetti – BU POS', label: 'Nome do Comitê' },
    }),
    prisma.setting.upsert({
      where: { key: 'director_name' },
      update: {},
      create: { key: 'director_name', value: 'Marcelo Stivanello', label: 'Nome do Diretor' },
    }),
    prisma.setting.upsert({
      where: { key: 'governance_responsible' },
      update: {},
      create: { key: 'governance_responsible', value: 'Mártin Marcelo Koller', label: 'Responsável pela Governança' },
    }),
    prisma.setting.upsert({
      where: { key: 'alert_action_plan_bloqueado_days' },
      update: {},
      create: { key: 'alert_action_plan_bloqueado_days', value: '3', label: 'Alertar PA Bloqueado após (dias)' },
    }),
    prisma.setting.upsert({
      where: { key: 'alert_action_plan_deadline_days' },
      update: {},
      create: { key: 'alert_action_plan_deadline_days', value: '7', label: 'Alertar prazo de PA (dias antes do vencimento)' },
    }),
    prisma.setting.upsert({
      where: { key: 'alert_awaiting_direction_days' },
      update: {},
      create: { key: 'alert_awaiting_direction_days', value: '5', label: 'Alertar item Aguardando Direção após (dias)' },
    }),
  ]);

  // ============================================
  // DEFAULT USER (for future login)
  // ============================================
  console.log('Seeding default user...');
  const adminRole = roles.find(r => r.name === 'Admin');
  await prisma.user.upsert({
    where: { email: 'admin@comiterisco.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@comiterisco.com',
      roleId: adminRole.id,
      active: true,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('Summary:');
  console.log(`- Roles: ${roles.length}`);
  console.log(`- Participants: ${participants.length}`);
  console.log(`- Product Owners: ${productOwners.length}`);
  console.log(`- Products: ${products.length}`);
  console.log(`- Event Sources: ${eventSources.length}`);
  console.log(`- Event Types: ${eventTypes.length}`);
  console.log(`- Severities: ${severities.length}`);
  console.log(`- Committee Statuses: ${committeeStatuses.length}`);
  console.log(`- Action Statuses: ${actionStatuses.length}`);
  console.log(`- Areas: ${areas.length}`);

  // ============================================
  // PORTAIS DE MONITORAMENTO (CHECKLIST)
  // ============================================
  console.log('Seeding ChecklistPortals...');
  const portalDefs = [
    { name: 'Portal NF-e / NFC-e',   url: 'https://www.nfe.fazenda.gov.br',             category: 'Fiscal',       sortOrder: 10 },
    { name: 'Portal CT-e',            url: 'https://www.cte.fazenda.gov.br',             category: 'Fiscal',       sortOrder: 20 },
    { name: 'Portal MDF-e',           url: 'https://www.mdfe.fazenda.gov.br',            category: 'Fiscal',       sortOrder: 30 },
    { name: 'Portal BP-e',            url: 'https://www.bpe.fazenda.gov.br',             category: 'Fiscal',       sortOrder: 40 },
    { name: 'CONFAZ',                 url: 'https://www.confaz.fazenda.gov.br',          category: 'Regulatório',  sortOrder: 50 },
    { name: 'Receita Federal',        url: 'https://www.gov.br/receitafederal',          category: 'Regulatório',  sortOrder: 60 },
    { name: 'SEFAZ Nacional',         url: 'https://www.fazenda.gov.br',                category: 'Regulatório',  sortOrder: 70 },
    { name: 'Portal SAT / MFE',       url: null,                                         category: 'Fiscal',       sortOrder: 80 },
    { name: 'Nota Técnica (GitHub)',   url: 'https://github.com/nfephp-org/sped-nfe',   category: 'Técnico',      sortOrder: 90 },
    { name: 'Grupo Oficial NF-e',     url: null,                                         category: 'Comunicado',   sortOrder: 100 },
    { name: 'Grupo Oficial CT-e',     url: null,                                         category: 'Comunicado',   sortOrder: 110 },
    { name: 'Comunicado Interno',     url: null,                                         category: 'Comunicado',   sortOrder: 120 },
    { name: 'ABECS / PAF-ECF',        url: null,                                         category: 'Regulatório',  sortOrder: 130 },
    { name: 'Outros portais',         url: null,                                         category: 'Outro',        sortOrder: 999 },
  ];

  const checklistPortals = await Promise.all(
    portalDefs.map((p) =>
      prisma.checklistPortal.upsert({
        where: { name: p.name },
        update: { url: p.url, category: p.category, sortOrder: p.sortOrder },
        create: { name: p.name, url: p.url, category: p.category, sortOrder: p.sortOrder },
      })
    )
  );
  console.log(`- ChecklistPortals: ${checklistPortals.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
