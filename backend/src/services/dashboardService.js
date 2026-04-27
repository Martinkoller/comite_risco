import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function yearRange(year) {
  const y = Number(year);
  return {
    gte: new Date(`${y}-01-01T00:00:00.000Z`),
    lt:  new Date(`${y + 1}-01-01T00:00:00.000Z`),
  };
}

class DashboardService {
  /**
   * Get dashboard summary with all metrics
   */
  async getSummary(year) {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const yr = yearRange(year);
    const yearFilter = { dateIdentified: yr };

    // Total items
    const totalItems = await prisma.riskItem.count({ where: yearFilter });

    // Items by status
    const itemsByStatus = await prisma.riskItem.groupBy({
      by: ['monitoringStatus'],
      where: yearFilter,
      _count: { id: true },
    });

    const statusCounts = itemsByStatus.reduce((acc, item) => {
      acc[item.monitoringStatus] = item._count.id;
      return acc;
    }, {});

    // Items by severity (from committee decisions)
    const itemsBySeverity = await prisma.committeeDecision.groupBy({
      by: ['finalSeverityId'],
      where: { meetingDate: yr },
      _count: { id: true },
    });

    const severityCounts = {};
    for (const item of itemsBySeverity) {
      const severity = await prisma.severity.findUnique({
        where: { id: item.finalSeverityId },
      });
      if (severity) {
        severityCounts[severity.code] = item._count.id;
      }
    }

    // Fast track items
    const fastTrackItems = await prisma.riskItem.count({
      where: {
        ...yearFilter,
        isFastTrack: true,
        monitoringStatus: { notIn: ['Concluído', 'Cancelado', 'Sem ação'] },
      },
    });

    // Items waiting for direction
    const waitingForDirection = await prisma.committeeDecision.count({
      where: {
        meetingDate: yr,
        goesToDirection: true,
        directionApproved: 'Pendente',
      },
    });

    // Action plans in progress
    const actionPlansInProgress = await prisma.actionPlan.count({
      where: {
        riskItem: yearFilter,
        actionStatus: { name: 'Em andamento' },
      },
    });

    // Overdue action plans
    const overdueActionPlans = await prisma.actionPlan.count({
      where: {
        riskItem: yearFilter,
        deadline: { lt: now },
        actionStatus: { name: { notIn: ['Concluído', 'Cancelado'] } },
      },
    });

    // Action plans due in next 7 days
    const actionPlansDueSoon = await prisma.actionPlan.count({
      where: {
        riskItem: yearFilter,
        deadline: { gte: now, lte: sevenDaysFromNow },
        actionStatus: { name: { notIn: ['Concluído', 'Cancelado'] } },
      },
    });

    // Recent risk items (last 7 days, within selected year)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentItems = await prisma.riskItem.count({
      where: {
        dateIdentified: { gte: sevenDaysAgo },
        ...yearFilter,
      },
    });

    // P1 items (critical)
    const p1Severity = await prisma.severity.findUnique({ where: { code: 'P1' } });
    const p1Items = p1Severity
      ? await prisma.committeeDecision.count({
          where: { meetingDate: yr, finalSeverityId: p1Severity.id },
        })
      : 0;

    // Items in analysis
    const inAnalysis = statusCounts['Em análise pelos POs'] || 0;

    // Items in execution
    const inExecution = statusCounts['Em execução'] || 0;

    // Items in monitoring
    const inMonitoring = statusCounts['Em monitoramento'] || 0;

    // Concluded items
    const concluded = statusCounts['Concluído'] || 0;

    // Items without action
    const noAction = statusCounts['Sem ação'] || 0;

    return {
      total: totalItems,
      byStatus: {
        identificado: statusCounts['Identificado'] || 0,
        emAnalise: inAnalysis,
        emConsolidacao: statusCounts['Em consolidação entre POs'] || 0,
        emValidacao: statusCounts['Em validação no Comitê'] || 0,
        aguardandoJuridico: statusCounts['Aguardando Jurídico'] || 0,
        aguardandoDirecao: statusCounts['Aguardando Direção'] || 0,
        planoAcaoAprovado: statusCounts['Plano de ação aprovado'] || 0,
        emExecucao: inExecution,
        emMonitoramento: inMonitoring,
        concluido: concluded,
        semAcao: noAction,
        cancelado: statusCounts['Cancelado'] || 0,
      },
      bySeverity: {
        P1: severityCounts['P1'] || 0,
        P2: severityCounts['P2'] || 0,
        P3: severityCounts['P3'] || 0,
        P4: severityCounts['P4'] || 0,
      },
      fastTrack: fastTrackItems,
      waitingForDirection,
      actionPlans: {
        inProgress: actionPlansInProgress,
        overdue: overdueActionPlans,
        dueSoon: actionPlansDueSoon,
      },
      recentItems,
      criticalItems: p1Items,
    };
  }

  /**
   * Get critical items (P1) for dashboard
   */
  async getCriticalItems(year) {
    const yr = yearRange(year);
    const p1Severity = await prisma.severity.findUnique({ where: { code: 'P1' } });
    if (!p1Severity) return [];

    const items = await prisma.committeeDecision.findMany({
      where: {
        meetingDate: yr,
        finalSeverityId: p1Severity.id,
        committeeStatus: { name: { notIn: ['Concluído', 'Cancelado', 'Sem ação'] } },
      },
      include: {
        riskItem: {
          include: {
            eventSource: true,
            eventType: true,
          },
        },
        finalSeverity: true,
        committeeStatus: true,
      },
      orderBy: {
        meetingDate: 'desc',
      },
      take: 10,
    });

    return items;
  }

  /**
   * Get items with upcoming deadlines
   */
  async getUpcomingDeadlines(year) {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const items = await prisma.actionPlan.findMany({
      where: {
        riskItem: { dateIdentified: yearRange(year) },
        deadline: { gte: now, lte: sevenDaysFromNow },
        actionStatus: { name: { notIn: ['Concluído', 'Cancelado'] } },
      },
      include: {
        riskItem: {
          include: {
            eventSource: true,
            eventType: true,
          },
        },
        actionStatus: true,
      },
      orderBy: {
        deadline: 'asc',
      },
      take: 10,
    });

    return items;
  }

  /**
   * Get recent committee decisions
   */
  async getRecentDecisions(year) {
    const decisions = await prisma.committeeDecision.findMany({
      where: { meetingDate: yearRange(year) },
      include: {
        riskItem: {
          include: {
            eventSource: true,
            eventType: true,
          },
        },
        finalSeverity: true,
        committeeStatus: true,
      },
      orderBy: {
        meetingDate: 'desc',
      },
      take: 10,
    });

    return decisions;
  }

  /**
   * Get items pending direction review
   */
  async getPendingDirectionItems() {
    const reviews = await prisma.directionReview.findMany({
      where: {
        approvalStatus: 'Pendente',
      },
      include: {
        riskItem: {
          include: {
            eventSource: true,
            eventType: true,
            committeeDecision: {
              include: {
                finalSeverity: true,
                committeeStatus: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return reviews;
  }
  async getDelayedActions(year) {
    const now = new Date();
    return prisma.actionPlan.findMany({
      where: {
        riskItem: { dateIdentified: yearRange(year) },
        deadline: { lt: now },
        actionStatus: { name: { notIn: ['Concluído', 'Cancelado'] } },
      },
      include: {
        riskItem: { select: { id: true, code: true, title: true } },
        actionStatus: { select: { name: true } },
        area: { select: { name: true } },
      },
      orderBy: { deadline: 'asc' },
      take: 20,
    });
  }

  async getManagementSummary(year) {
    const meeting = await prisma.managementMeeting.findFirst({
      where: { meetingDate: yearRange(year) },
      orderBy: { meetingDate: 'desc' },
      include: {
        riskItems: {
          include: {
            riskItem: { select: { id: true, code: true, title: true } },
          },
        },
      },
    });
    return meeting ?? null;
  }
}

export default new DashboardService();
