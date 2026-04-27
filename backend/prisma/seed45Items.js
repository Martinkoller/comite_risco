import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper functions
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

// Data generators
const eventSources = ['Portal NF-e/NFC-e', 'Portal Fiscal', 'Reunião PO', 'Cliente', 'Jurídico', 'Suporte', 'CS', 'Marketing']
const eventTypes = ['NT', 'Alteração Legislativa', 'Requisito Cliente', 'Bug Crítico', 'Melhoria', 'Incidente']
const titles = [
  'NT 2026.001 - Alterações na emissão de NF-e',
  'NT 2026.002 - Novo layout do DANFE',
  'Requisito cliente 12345 - Integração ERP',
  'Bug crítico #789 - Erro no cálculo de impostos',
  'Alteração legislativa - ICMS interestadual',
  'Melhoria #456 - Performance de consulta',
  'Incidente #789 - Falha no serviço de emissão',
  'NT 2026.003 - Mudanças no SAT',
  'Requisito cliente 67890 - Relatório fiscal',
  'Bug crítico #234 - Timeout na comunicação',
  'Alteração legislativa - ISS municipal',
  'Melhoria #890 - Interface de cadastro',
  'Incidente #567 - Perda de dados',
  'NT 2026.004 - Atualização do QR Code',
  'Requisito cliente 11111 - Exportação XML',
  'Bug crítico #345 - Duplicação de notas',
  'Alteração legislativa - IPI',
  'Melhoria #678 - Automação de processos',
  'Incidente #901 - Erro na validação',
  'NT 2026.005 - Novas regras de contingência',
  'Requisito cliente 22222 - Dashboard executivo',
  'Bug crítico #012 - Falha no login',
  'Alteração legislativa - PIS/COFINS',
  'Melhoria #234 - Mobile responsive',
  'Incidente #345 - Falha no backup',
  'NT 2026.006 - Alterações no CTe',
  'Requisito cliente 33333 - API REST',
  'Bug crítico #456 - Corrupção de banco',
  'Alteração legislativa - NFS-e',
  'Melhoria #567 - Chat interno',
  'Incidente #678 - Erro no pagamento',
  'NT 2026.007 - Novas regras de cancelamento',
  'Requisito cliente 44444 - Notificações',
  'Bug crítico #789 - Falha no sync',
  'Alteração legislativa - Simples Nacional',
  'Melhoria #890 - Gamificação',
  'Incidente #901 - Erro na impressão',
  'NT 2026.008 - Atualização do MDF-e',
  'Requisito cliente 55555 - Workflow',
  'Bug crítico #012 - Falha no upload',
  'Alteração legislativa - CFOP',
  'Melhoria #123 - Analytics',
  'Incidente #234 - Erro no download',
  'NT 2026.009 - Novas regras de devolução',
  'Requisito cliente 66666 - Segurança',
  'Bug crítico #345 - Falha no cache',
  'Alteração legislativa - ICMS-ST',
  'Melhoria #456 - Integração bancária',
]

const summaries = [
  'Nova nota técnica publicada com alterações que impactam a validação de XML.',
  'Alteração legislativa que exige ajustes no cálculo de impostos.',
  'Requisito de cliente para nova funcionalidade de integração.',
  'Bug crítico identificado em produção que precisa correção urgente.',
  'Melhoria solicitada para otimizar performance do sistema.',
  'Incidente reportado que afeta a disponibilidade do serviço.',
]

const statuses = [
  'Identificado',
  'Em análise pelos POs',
  'Em consolidação entre POs',
  'Em validação no Comitê',
  'Aguardando Jurídico',
  'Aguardando Direção',
  'Plano de ação aprovado',
  'Em execução',
  'Em monitoramento',
  'Concluído',
  'Sem ação',
  'Cancelado',
]

const impactTypes = ['Funcional', 'Técnico', 'Operacional', 'Comunicação', 'Misto']
const impactLevels = ['Real', 'Provável', 'Possível']

async function main() {
  console.log('🌱 Starting seed for 45 risk items...')

  // Clean existing test data
  console.log('🧹 Cleaning existing test data...')
  await prisma.timelineEvent.deleteMany()
  await prisma.action.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.managementMeetingRiskItem.deleteMany()
  await prisma.managementMeeting.deleteMany()
  await prisma.actionPlan.deleteMany()
  await prisma.directionReview.deleteMany()
  await prisma.committeeDecision.deleteMany()
  await prisma.pOAnalysis.deleteMany()
  await prisma.riskItemProduct.deleteMany()
  await prisma.riskItem.deleteMany()
  console.log('✅ Test data cleaned')

  // Get lookup data
  const eventSourcesDb = await prisma.eventSource.findMany()
  const eventTypesDb = await prisma.eventType.findMany()
  const severities = await prisma.severity.findMany()
  const committeeStatuses = await prisma.committeeStatus.findMany()
  const actionStatuses = await prisma.actionStatus.findMany()
  const products = await prisma.product.findMany()
  const participants = await prisma.participant.findMany()

  if (eventSourcesDb.length === 0 || eventTypesDb.length === 0 || severities.length === 0) {
    console.error('❌ Missing lookup data. Run seed.js first.')
    return
  }

  console.log(`📝 Creating 45 risk items...`)

  const riskItems = []

  for (let i = 1; i <= 45; i++) {
    const week = randomInt(1, 20)
    const year = 2026
    const weekRef = `${week}/${year}`
    const status = randomItem(statuses)
    const severity = randomItem(severities)
    const eventSource = randomItem(eventSourcesDb)
    const eventType = randomItem(eventTypesDb)
    const participant = randomItem(participants)
    const selectedProducts = products.slice(0, randomInt(1, 4))

    const riskItem = await prisma.riskItem.create({
      data: {
        code: `CR-2026-${String(i).padStart(3, '0')}`,
        weekReference: weekRef,
        dateIdentified: randomDate(new Date('2026-01-01'), new Date('2026-04-23')),
        monitoringResponsible: participant.name,
        eventSourceId: eventSource.id,
        eventTypeId: eventType.id,
        preliminarySeverityId: severity.id,
        title: titles[i - 1],
        summary: randomItem(summaries),
        initialNotes: `Nota inicial para item ${i}.`,
        requiresPoAnalysis: Math.random() > 0.3,
        monitoringStatus: status,
        isFastTrack: severity.code === 'P1' && Math.random() > 0.5,
        fastTrackReason: severity.code === 'P1' ? 'Prioridade crítica - impacto em produção' : null,
        products: {
          create: selectedProducts.map(p => ({ productId: p.id })),
        },
      },
      include: {
        products: true,
      },
    })
    riskItems.push(riskItem)
    console.log(`  ✅ ${i}/45: ${riskItem.code} - ${status} - ${severity.code}`)
  }

  // Create PO Analyses for items that require it
  console.log('📝 Creating PO Analyses...')
  let poAnalysisCount = 0
  for (const riskItem of riskItems) {
    if (riskItem.requiresPoAnalysis && Math.random() > 0.3) {
      for (const product of riskItem.products) {
        const poAnalysis = await prisma.pOAnalysis.create({
          data: {
            riskItemId: riskItem.id,
            productId: product.productId,
            poResponsible: randomItem(participants).name,
            analysisDate: randomDate(new Date('2026-01-01'), new Date('2026-04-23')),
            impactsProduct: randomItem(['Sim', 'Não', 'Em avaliação']),
            impactType: randomItem(impactTypes),
            impactLevel: randomItem(impactLevels),
            needsImplementation: randomItem(['Sim', 'Não', 'Talvez']),
            needsLegalReview: randomItem(['Sim', 'Não', 'Talvez']),
            suggestedSeverityId: randomItem(severities).id,
            recommendation: `Análise para ${riskItem.code} no produto ${product.productId}.`,
          },
        })
        poAnalysisCount++
      }
    }
  }
  console.log(`  ✅ Created ${poAnalysisCount} PO Analyses`)

  // Create Committee Decisions for items in advanced stages
  console.log('📝 Creating Committee Decisions...')
  let committeeDecisionCount = 0
  for (const riskItem of riskItems) {
    if (['Em validação no Comitê', 'Aguardando Jurídico', 'Aguardando Direção', 'Plano de ação aprovado', 'Em execução', 'Em monitoramento', 'Concluído'].includes(riskItem.monitoringStatus)) {
      const decision = await prisma.committeeDecision.create({
        data: {
          riskItemId: riskItem.id,
          meetingDate: randomDate(new Date('2026-01-01'), new Date('2026-04-23')),
          finalSeverityId: randomItem(severities).id,
          committeeStatusId: randomItem(committeeStatuses).id,
          mainResponsible: randomItem(participants).name,
          impactedProducts: riskItem.products.map(p => p.productId).join(', '),
          involvedPos: participants.slice(0, 3).map(p => p.name).join(', '),
          decisionText: `Decisão do comitê para ${riskItem.code}.`,
          supportImpact: randomItem(['Não', 'Baixo', 'Médio', 'Alto']),
          csImpact: randomItem(['Não', 'Baixo', 'Médio', 'Alto']),
          marketingImpact: randomItem(['Não', 'Baixo', 'Médio', 'Alto']),
          hasAction: Math.random() > 0.3,
          hasActionPlan: Math.random() > 0.5,
          goesToDirection: riskItem.monitoringStatus === 'Aguardando Direção',
          directionApproved: riskItem.monitoringStatus === 'Aguardando Direção' ? 'Pendente' : 'N/A',
        },
      })
      committeeDecisionCount++
    }
  }
  console.log(`  ✅ Created ${committeeDecisionCount} Committee Decisions`)

  // Create Action Plans
  console.log('📝 Creating Action Plans...')
  let actionPlanCount = 0
  let paCounter = 1
  for (const riskItem of riskItems) {
    if (['Plano de ação aprovado', 'Em execução', 'Em monitoramento'].includes(riskItem.monitoringStatus) && Math.random() > 0.4) {
      const actionPlan = await prisma.actionPlan.create({
        data: {
          riskItemId: riskItem.id,
          code: `PA-2026-${String(paCounter++).padStart(3, '0')}`,
          theme: `Plano de ação para ${riskItem.code}`,
          responsibleArea: randomItem(['Desenvolvimento', 'Infraestrutura', 'CS', 'Suporte', 'Jurídico']),
          responsibleName: randomItem(participants).name,
          openedAt: randomDate(new Date('2026-01-01'), new Date('2026-04-23')),
          deadline: randomDate(new Date('2026-05-01'), new Date('2026-12-31')),
          actionStatusId: randomItem(actionStatuses).id,
          actionDescription: `Ações necessárias para resolver ${riskItem.code}.`,
        },
      })
      actionPlanCount++
    }
  }
  console.log(`  ✅ Created ${actionPlanCount} Action Plans`)

  // Create Direction Reviews
  console.log('📝 Creating Direction Reviews...')
  let directionReviewCount = 0
  for (const riskItem of riskItems) {
    if (riskItem.monitoringStatus === 'Aguardando Direção' || riskItem.monitoringStatus === 'Plano de ação aprovado') {
      const review = await prisma.directionReview.create({
        data: {
          riskItemId: riskItem.id,
          submittedAt: randomDate(new Date('2026-01-01'), new Date('2026-04-23')),
          directorName: randomItem(participants).name,
          approvalStatus: randomItem(['Aprovado', 'Pendente', 'Ajustar e retornar']),
          directionNotes: 'Revisão da direção.',
        },
      })
      directionReviewCount++
    }
  }
  console.log(`  ✅ Created ${directionReviewCount} Direction Reviews`)

  // Create Timeline Events
  console.log('📝 Creating Timeline Events...')
  let timelineEventCount = 0
  const eventTypesTimeline = ['Item Criado', 'Produtos Vinculados', 'Status Alterado', 'Análise de PO Criada', 'Decisão do Comitê Criada', 'Plano de Ação Criado', 'Revisão da Direção Criada']
  
  for (const riskItem of riskItems) {
    const numEvents = randomInt(2, 6)
    for (let i = 0; i < numEvents; i++) {
      const eventDate = randomDate(new Date('2026-01-01'), new Date('2026-04-23'))
      await prisma.timelineEvent.create({
        data: {
          riskItemId: riskItem.id,
          eventDate: eventDate,
          eventType: eventTypesTimeline[i % eventTypesTimeline.length],
          description: `${eventTypesTimeline[i % eventTypesTimeline.length]} para ${riskItem.code}.`,
        },
      })
      timelineEventCount++
    }
  }
  console.log(`  ✅ Created ${timelineEventCount} Timeline Events`)

  console.log('✨ Seed completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`  - Risk Items: ${riskItems.length}`)
  console.log(`  - PO Analyses: ${poAnalysisCount}`)
  console.log(`  - Committee Decisions: ${committeeDecisionCount}`)
  console.log(`  - Action Plans: ${actionPlanCount}`)
  console.log(`  - Direction Reviews: ${directionReviewCount}`)
  console.log(`  - Timeline Events: ${timelineEventCount}`)
  console.log('\n📈 Status Distribution:')
  const statusDistribution = {}
  riskItems.forEach(item => {
    statusDistribution[item.monitoringStatus] = (statusDistribution[item.monitoringStatus] || 0) + 1
  })
  Object.entries(statusDistribution).forEach(([status, count]) => {
    console.log(`  - ${status}: ${count}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
