import { PrismaClient } from '@prisma/client';
import timelineService from './timelineService.js';

const prisma = new PrismaClient();

class CommitteeDecisionService {
  /**
   * Get all committee decisions with optional filters
   */
  async getAll(filters = {}) {
    const { goesToDirection, committeeStatusId } = filters;
    
    const where = {};
    
    if (goesToDirection !== undefined) {
      where.goesToDirection = goesToDirection === 'true';
    }
    
    if (committeeStatusId) {
      where.committeeStatusId = committeeStatusId;
    }

    const decisions = await prisma.committeeDecision.findMany({
      where,
      include: {
        riskItem: {
          include: {
            eventSource: true,
            eventType: true,
            preliminarySeverity: true,
          },
        },
        finalSeverity: true,
        committeeStatus: true,
      },
      orderBy: {
        meetingDate: 'desc',
      },
    });

    return decisions;
  }

  /**
   * Get a single committee decision by ID
   */
  async getById(id) {
    const decision = await prisma.committeeDecision.findUnique({
      where: { id },
      include: {
        riskItem: {
          include: {
            eventSource: true,
            eventType: true,
            preliminarySeverity: true,
            products: {
              include: {
                product: true,
              },
            },
          },
        },
        finalSeverity: true,
        committeeStatus: true,
      },
    });

    if (!decision) {
      throw new Error('Committee decision not found');
    }

    return decision;
  }

  /**
   * Get committee decision by risk item ID
   */
  async getByRiskItem(riskItemId) {
    const decision = await prisma.committeeDecision.findUnique({
      where: { riskItemId },
      include: {
        riskItem: {
          include: {
            eventSource: true,
            eventType: true,
            preliminarySeverity: true,
          },
        },
        finalSeverity: true,
        committeeStatus: true,
      },
    });

    return decision;
  }

  /**
   * Create a new committee decision
   */
  async create(data, userId = null) {
    const decision = await prisma.committeeDecision.create({
      data,
      include: {
        riskItem: true,
        finalSeverity: true,
        committeeStatus: true,
      },
    });

    // Log timeline event
    await timelineService.logCommitteeDecisionCreated(decision.riskItemId, userId);

    // Update risk item status based on committee decision
    await prisma.riskItem.update({
      where: { id: decision.riskItemId },
      data: {
        monitoringStatus: decision.committeeStatus.name,
      },
    });

    // If goesToDirection is true, set submittedToDirectionAt
    if (decision.goesToDirection && !decision.submittedToDirectionAt) {
      await prisma.committeeDecision.update({
        where: { id: decision.id },
        data: {
          submittedToDirectionAt: new Date(),
        },
      });

      await timelineService.logDirectionReviewSubmitted(decision.riskItemId, userId);
    }

    return decision;
  }

  /**
   * Update a committee decision
   */
  async update(id, data, userId = null) {
    const decision = await prisma.committeeDecision.findUnique({
      where: { id },
    });

    if (!decision) {
      throw new Error('Committee decision not found');
    }

    const updatedDecision = await prisma.committeeDecision.update({
      where: { id },
      data,
      include: {
        riskItem: true,
        finalSeverity: true,
        committeeStatus: true,
      },
    });

    // Log timeline event for update
    await timelineService.createEvent(
      decision.riskItemId,
      timelineService.EVENT_TYPES.COMMITTEE_DECISION_UPDATED,
      'Decisão do Comitê atualizada',
      userId
    );

    // Update risk item status if committee status changed
    if (data.committeeStatusId) {
      const newStatus = await prisma.committeeStatus.findUnique({
        where: { id: data.committeeStatusId },
      });

      if (newStatus) {
        await prisma.riskItem.update({
          where: { id: decision.riskItemId },
          data: {
            monitoringStatus: newStatus.name,
          },
        });

        await timelineService.logStatusChanged(
          decision.riskItemId,
          decision.committeeStatus.name,
          newStatus.name,
          userId
        );
      }
    }

    // Handle goesToDirection change
    if (data.goesToDirection === true && decision.goesToDirection === false) {
      await prisma.committeeDecision.update({
        where: { id },
        data: {
          submittedToDirectionAt: new Date(),
        },
      });

      await timelineService.logDirectionReviewSubmitted(decision.riskItemId, userId);
    }

    return updatedDecision;
  }

  /**
   * Get decisions that need direction review
   */
  async getPendingDirectionReview() {
    return this.getAll({ 
      goesToDirection: 'true',
    });
  }

  /**
   * Get decisions by severity
   */
  async getBySeverity(severityCode) {
    const severity = await prisma.severity.findUnique({
      where: { code: severityCode },
    });

    if (!severity) {
      throw new Error('Severity not found');
    }

    return prisma.committeeDecision.findMany({
      where: {
        finalSeverityId: severity.id,
      },
      include: {
        riskItem: true,
        finalSeverity: true,
        committeeStatus: true,
      },
      orderBy: {
        meetingDate: 'desc',
      },
    });
  }
}

export default new CommitteeDecisionService();
