import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting test data seed...')

  // Clean existing test data
  console.log('🧹 Cleaning existing test data...')
  await prisma.timelineEvent.deleteMany()
  await prisma.actionPlan.deleteMany()
  await prisma.directionReview.deleteMany()
  await prisma.committeeDecision.deleteMany()
  await prisma.pOAnalysis.deleteMany()
  await prisma.riskItemProduct.deleteMany()
  await prisma.riskItem.deleteMany()
  console.log('✅ Test data cleaned')

  // Get existing lookup data
  const eventSource = await prisma.eventSource.findFirst()
  const eventType = await prisma.eventType.findFirst()
  const severity = await prisma.severity.findFirst()
  const committeeStatus = await prisma.committeeStatus.findFirst()
  const actionStatus = await prisma.actionStatus.findFirst()
  const products = await prisma.product.findMany({ take: 3 })
  const participant = await prisma.participant.findFirst()

  if (!eventSource || !eventType || !severity || !committeeStatus || !actionStatus || products.length === 0) {
    console.error('❌ Missing required lookup data. Run seed.js first.')
    console.log('Available data:', {
      eventSources: await prisma.eventSource.count(),
      eventTypes: await prisma.eventType.count(),
      severities: await prisma.severity.count(),
      committeeStatuses: await prisma.committeeStatus.count(),
      actionStatuses: await prisma.actionStatus.count(),
      products: await prisma.product.count(),
    })
    return
  }

  // Create Risk Item
  console.log('📝 Creating Risk Item...')
  const riskItem = await prisma.riskItem.create({
    data: {
      code: 'CR-2026-001',
      weekReference: '17/2026',
      dateIdentified: new Date('2026-04-23'),
      monitoringResponsible: 'Gian',
      eventSourceId: eventSource.id,
      eventTypeId: eventType.id,
      preliminarySeverityId: severity.id,
      title: 'NT 2026.001 - Alterações na emissão de NF-e',
      summary: 'Nova nota técnica publicada com alterações no layout da NF-e versão 4.0, impactando a validação de XML.',
      initialNotes: 'NT publicada em 20/04/2026, entra em vigor em 01/06/2026.',
      requiresPoAnalysis: true,
      monitoringStatus: 'Em execução',
      isFastTrack: false,
      products: {
        create: products.map(p => ({
          productId: p.id,
        })),
      },
    },
    include: {
      products: true,
    },
  })
  console.log(`✅ Risk Item created: ${riskItem.code}`)

  // Create PO Analyses
  console.log('📝 Creating PO Analyses...')
  for (const product of products) {
    const poAnalysis = await prisma.pOAnalysis.create({
      data: {
        riskItemId: riskItem.id,
        productId: product.id,
        poResponsible: product.owner?.name || 'PO',
        analysisDate: new Date('2026-04-23'),
        impactsProduct: 'Sim',
        impactType: 'Funcional',
        impactLevel: 'Real',
        needsImplementation: 'Sim',
        needsLegalReview: 'Não',
        suggestedSeverityId: severity.id,
        recommendation: `Necessário ajustar validação de XML para o produto ${product.name}. Alteração no campo X99 do layout.`,
      },
    })
    console.log(`✅ PO Analysis created for ${product.name}`)
  }

  // Create Committee Decision
  console.log('📝 Creating Committee Decision...')
  const committeeDecision = await prisma.committeeDecision.create({
    data: {
      riskItemId: riskItem.id,
      meetingDate: new Date('2026-04-23'),
      finalSeverityId: severity.id,
      committeeStatusId: committeeStatus.id,
      mainResponsible: 'Gian',
      impactedProducts: products.map(p => p.name).join(', '),
      involvedPos: products.map(p => p.owner?.name || 'PO').join(', '),
      decisionText: 'Aprovar plano de ação para ajuste de validação de XML. Prioridade alta devido ao prazo curto.',
      supportImpact: 'Baixo',
      csImpact: 'Médio',
      marketingImpact: 'Nenhum',
      hasAction: true,
      hasActionPlan: true,
      goesToDirection: false,
      directionApproved: 'N/A',
    },
  })
  console.log('✅ Committee Decision created')

  // Create Action Plan
  console.log('📝 Creating Action Plan...')
  const actionPlan = await prisma.actionPlan.create({
    data: {
      riskItemId: riskItem.id,
      code: 'PA-2026-001',
      theme: 'Ajuste de validação XML NF-e v4.0',
      responsibleArea: 'Desenvolvimento',
      responsibleName: 'Mártin',
      openedAt: new Date('2026-04-23'),
      deadline: new Date('2026-05-30'),
      actionStatusId: actionStatus.id,
      actionDescription: 'Atualizar módulo de validação de XML para atender nova NT. Alterar validação do campo X99 conforme especificação.',
      directionApprovedAt: null,
    },
  })
  console.log(`✅ Action Plan created: ${actionPlan.code}`)

  // Create Timeline Events
  console.log('📝 Creating Timeline Events...')
  const timelineEvents = [
    {
      riskItemId: riskItem.id,
      eventDate: new Date('2026-04-23T08:00:00'),
      eventType: 'Item Criado',
      description: 'Item de risco CR-2026-001 criado por Gian',
    },
    {
      riskItemId: riskItem.id,
      eventDate: new Date('2026-04-23T09:00:00'),
      eventType: 'Produtos Vinculados',
      description: 'Produtos vinculados: ClippPro, SmallCommerce, GPro',
    },
    {
      riskItemId: riskItem.id,
      eventDate: new Date('2026-04-23T10:00:00'),
      eventType: 'Análise de PO Criada',
      description: 'Análise de PO criada para ClippPro',
    },
    {
      riskItemId: riskItem.id,
      eventDate: new Date('2026-04-23T11:00:00'),
      eventType: 'Decisão do Comitê Criada',
      description: 'Decisão do comitê registrada - Prioridade Alta',
    },
    {
      riskItemId: riskItem.id,
      eventDate: new Date('2026-04-23T12:00:00'),
      eventType: 'Plano de Ação Criado',
      description: 'Plano de ação PA-2026-001 criado',
    },
  ]

  for (const event of timelineEvents) {
    await prisma.timelineEvent.create({ data: event })
  }
  console.log('✅ Timeline Events created')

  console.log('✨ Test data seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`  - Risk Item: ${riskItem.code}`)
  console.log(`  - PO Analyses: ${products.length}`)
  console.log(`  - Committee Decision: 1`)
  console.log(`  - Action Plan: ${actionPlan.code}`)
  console.log(`  - Timeline Events: ${timelineEvents.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
