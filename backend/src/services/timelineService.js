import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Timeline Event Service
 * Automatically creates timeline events for risk items
 */
class TimelineService {
  /**
   * Creates a timeline event for a risk item
   * @param {number} riskItemId - The ID of the risk item
   * @param {string} eventType - The type of event
   * @param {string} description - Description of the event
   * @param {number} userId - Optional user ID who created the event
   */
  async createEvent(riskItemId, eventType, description, userId = null) {
    try {
      const event = await prisma.timelineEvent.create({
        data: {
          riskItemId,
          eventType,
          description,
          createdById: userId,
        },
      });
      return event;
    } catch (error) {
      console.error('Error creating timeline event:', error);
      throw error;
    }
  }

  /**
   * Get all timeline events for a risk item
   * @param {number} riskItemId - The ID of the risk item
   */
  async getEventsByRiskItem(riskItemId) {
    try {
      const events = await prisma.timelineEvent.findMany({
        where: { riskItemId },
        orderBy: { eventDate: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return events;
    } catch (error) {
      console.error('Error fetching timeline events:', error);
      throw error;
    }
  }

  // Predefined event types
  static EVENT_TYPES = {
    ITEM_CREATED: 'ITEM_CREATED',
    PRODUCT_LINKED: 'PRODUCT_LINKED',
    PRODUCT_UNLINKED: 'PRODUCT_UNLINKED',
    PO_ANALYSIS_CREATED: 'PO_ANALYSIS_CREATED',
    PO_ANALYSIS_UPDATED: 'PO_ANALYSIS_UPDATED',
    COMMITTEE_DECISION_CREATED: 'COMMITTEE_DECISION_CREATED',
    COMMITTEE_DECISION_UPDATED: 'COMMITTEE_DECISION_UPDATED',
    ACTION_PLAN_CREATED: 'ACTION_PLAN_CREATED',
    ACTION_PLAN_UPDATED: 'ACTION_PLAN_UPDATED',
    ACTION_PLAN_COMPLETED: 'ACTION_PLAN_COMPLETED',
    DIRECTION_REVIEW_SUBMITTED: 'DIRECTION_REVIEW_SUBMITTED',
    DIRECTION_REVIEW_APPROVED: 'DIRECTION_REVIEW_APPROVED',
    DIRECTION_REVIEW_RETURNED: 'DIRECTION_REVIEW_RETURNED',
    STATUS_CHANGED: 'STATUS_CHANGED',
    FAST_TRACK_ACTIVATED: 'FAST_TRACK_ACTIVATED',
    FAST_TRACK_DEACTIVATED: 'FAST_TRACK_DEACTIVATED',
    SEVERITY_CHANGED: 'SEVERITY_CHANGED',
    DEADLINE_UPDATED: 'DEADLINE_UPDATED',
  };

  /**
   * Helper methods for common events
   */
  async logItemCreated(riskItemId, userId = null) {
    return this.createEvent(
      riskItemId,
      TimelineService.EVENT_TYPES.ITEM_CREATED,
      'Item criado no sistema',
      userId
    );
  }

  async logProductLinked(riskItemId, productName, userId = null) {
    return this.createEvent(
      riskItemId,
      TimelineService.EVENT_TYPES.PRODUCT_LINKED,
      `Produto vinculado: ${productName}`,
      userId
    );
  }

  async logPOAnalysisCreated(riskItemId, poName, userId = null) {
    return this.createEvent(
      riskItemId,
      TimelineService.EVENT_TYPES.PO_ANALYSIS_CREATED,
      `Análise de PO criada por: ${poName}`,
      userId
    );
  }

  async logCommitteeDecisionCreated(riskItemId, userId = null) {
    return this.createEvent(
      riskItemId,
      TimelineService.EVENT_TYPES.COMMITTEE_DECISION_CREATED,
      'Decisão do Comitê registrada',
      userId
    );
  }

  async logActionPlanCreated(riskItemId, actionPlanCode, userId = null) {
    return this.createEvent(
      riskItemId,
      TimelineService.EVENT_TYPES.ACTION_PLAN_CREATED,
      `Plano de ação criado: ${actionPlanCode}`,
      userId
    );
  }

  async logDirectionReviewSubmitted(riskItemId, userId = null) {
    return this.createEvent(
      riskItemId,
      TimelineService.EVENT_TYPES.DIRECTION_REVIEW_SUBMITTED,
      'Item submetido à Direção',
      userId
    );
  }

  async logDirectionReviewApproved(riskItemId, status, userId = null) {
    return this.createEvent(
      riskItemId,
      TimelineService.EVENT_TYPES.DIRECTION_REVIEW_APPROVED,
      `Direção retornou: ${status}`,
      userId
    );
  }

  async logStatusChanged(riskItemId, oldStatus, newStatus, userId = null) {
    return this.createEvent(
      riskItemId,
      TimelineService.EVENT_TYPES.STATUS_CHANGED,
      `Status alterado: ${oldStatus} → ${newStatus}`,
      userId
    );
  }

  async logFastTrackActivated(riskItemId, reason = null, userId = null) {
    const description = reason 
      ? `Fast Track ativado: ${reason}`
      : 'Fast Track ativado';
    return this.createEvent(
      riskItemId,
      TimelineService.EVENT_TYPES.FAST_TRACK_ACTIVATED,
      description,
      userId
    );
  }

  async logSeverityChanged(riskItemId, oldSeverity, newSeverity, userId = null) {
    return this.createEvent(
      riskItemId,
      TimelineService.EVENT_TYPES.SEVERITY_CHANGED,
      `Severidade alterada: ${oldSeverity} → ${newSeverity}`,
      userId
    );
  }
}

export default new TimelineService();
