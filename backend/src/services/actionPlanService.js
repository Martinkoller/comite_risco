import { PrismaClient } from '@prisma/client';
import { generatePACode } from '../utils/idGenerator.js';
import timelineService from './timelineService.js';

const prisma = new PrismaClient();

class ActionPlanService {
  /**
   * Get all action plans with optional filters
   */
  async getAll(filters = {}) {
    const { riskItemId, actionStatusId, overdue } = filters;
    
    const where = {};
    
    if (riskItemId) {
      where.riskItemId = riskItemId;
    }
    
    if (actionStatusId) {
      where.actionStatusId = actionStatusId;
    }

    if (overdue === 'true') {
      where.deadline = {
        lt: new Date(),
      };
      where.actionStatus = {
        name: {
          notIn: ['Concluído', 'Cancelado'],
        },
      };
    }

    const plans = await prisma.actionPlan.findMany({
      where,
      include: {
        riskItem: {
          include: {
            eventSource: true,
            eventType: true,
          },
        },
        actionStatus: true,
        area: true,
      },
      orderBy: {
        deadline: 'asc',
      },
    });

    return plans;
  }

  /**
   * Get a single action plan by ID
   */
  async getById(id) {
    const plan = await prisma.actionPlan.findUnique({
      where: { id },
      include: {
        riskItem: {
          include: {
            eventSource: true,
            eventType: true,
            preliminarySeverity: true,
            committeeDecision: {
              include: {
                finalSeverity: true,
                committeeStatus: true,
              },
            },
          },
        },
        actionStatus: true,
        area: true,
      },
    });

    if (!plan) {
      throw new Error('Action plan not found');
    }

    return plan;
  }

  /**
   * Create a new action plan
   */
  async create(data, userId = null) {
    // Generate PA code
    const code = await generatePACode();

    const plan = await prisma.actionPlan.create({
      data: {
        ...data,
        code,
      },
      include: {
        riskItem: true,
        actionStatus: true,
        area: true,
      },
    });

    // Log timeline event
    await timelineService.logActionPlanCreated(plan.riskItemId, plan.code, userId);

    return plan;
  }

  /**
   * Update an action plan
   */
  async update(id, data, userId = null) {
    const plan = await prisma.actionPlan.findUnique({
      where: { id },
      include: {
        actionStatus: true,
        area: true,
      },
    });

    if (!plan) {
      throw new Error('Action plan not found');
    }

    const updatedPlan = await prisma.actionPlan.update({
      where: { id },
      data,
      include: {
        riskItem: true,
        actionStatus: true,
        area: true,
      },
    });

    // Log timeline event for update
    await timelineService.createEvent(
      plan.riskItemId,
      timelineService.EVENT_TYPES.ACTION_PLAN_UPDATED,
      `Plano de ação ${plan.code} atualizado`,
      userId
    );

    // If status changed to Concluído, log completion
    if (data.actionStatusId && data.actionStatusId !== plan.actionStatusId) {
      const newStatus = await prisma.actionStatus.findUnique({
        where: { id: data.actionStatusId },
      });

      if (newStatus && newStatus.name === 'Concluído') {
        await timelineService.createEvent(
          plan.riskItemId,
          timelineService.EVENT_TYPES.ACTION_PLAN_COMPLETED,
          `Plano de ação ${plan.code} concluído`,
          userId
        );
      }
    }

    return updatedPlan;
  }

  /**
   * Delete an action plan
   */
  async delete(id, userId = null) {
    const plan = await prisma.actionPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new Error('Action plan not found');
    }

    await prisma.actionPlan.delete({
      where: { id },
    });

    return { message: 'Action plan deleted successfully' };
  }

  /**
   * Get action plans by risk item
   */
  async getByRiskItem(riskItemId) {
    return this.getAll({ riskItemId });
  }

  /**
   * Get overdue action plans
   */
  async getOverdue() {
    return this.getAll({ overdue: 'true' });
  }

  /**
   * Get action plans by status
   */
  async getByStatus(statusName) {
    const status = await prisma.actionStatus.findUnique({
      where: { name: statusName },
    });

    if (!status) {
      throw new Error('Action status not found');
    }

    return this.getAll({ actionStatusId: status.id });
  }

  /**
   * Mark action plan as approved by direction
   */
  async markDirectionApproved(id, userId = null) {
    const plan = await this.update(id, {
      directionApprovedAt: new Date(),
    }, userId);

    return plan;
  }
}

export default new ActionPlanService();
