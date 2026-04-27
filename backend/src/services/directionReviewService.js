import { PrismaClient } from '@prisma/client';
import timelineService from './timelineService.js';

const prisma = new PrismaClient();

class DirectionReviewService {
  /**
   * Get all direction reviews with optional filters
   */
  async getAll(filters = {}) {
    const { riskItemId, approvalStatus } = filters;
    
    const where = {};
    
    if (riskItemId) {
      where.riskItemId = riskItemId;
    }
    
    if (approvalStatus) {
      where.approvalStatus = approvalStatus;
    }

    const reviews = await prisma.directionReview.findMany({
      where,
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
        createdAt: 'desc',
      },
    });

    return reviews;
  }

  /**
   * Get a single direction review by ID
   */
  async getById(id) {
    const review = await prisma.directionReview.findUnique({
      where: { id },
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
    });

    if (!review) {
      throw new Error('Direction review not found');
    }

    return review;
  }

  /**
   * Get direction reviews by risk item
   */
  async getByRiskItem(riskItemId) {
    return this.getAll({ riskItemId });
  }

  /**
   * Create a new direction review
   */
  async create(data, userId = null) {
    const review = await prisma.directionReview.create({
      data,
      include: {
        riskItem: true,
      },
    });

    // Log timeline event
    await timelineService.logDirectionReviewSubmitted(review.riskItemId, userId);

    // Update committee decision directionApproved status
    await prisma.committeeDecision.updateMany({
      where: { riskItemId: review.riskItemId },
      data: {
        directionApproved: 'Pendente',
      },
    });

    return review;
  }

  /**
   * Update a direction review (typically when director responds)
   */
  async update(id, data, userId = null) {
    const review = await prisma.directionReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new Error('Direction review not found');
    }

    const updatedReview = await prisma.directionReview.update({
      where: { id },
      data: {
        ...data,
        reviewedAt: data.reviewedAt || new Date(),
      },
      include: {
        riskItem: true,
      },
    });

    // Log timeline event based on approval status
    if (data.approvalStatus) {
      await timelineService.logDirectionReviewApproved(
        review.riskItemId,
        data.approvalStatus,
        userId
      );

      // Update committee decision directionApproved status
      await prisma.committeeDecision.updateMany({
        where: { riskItemId: review.riskItemId },
        data: {
          directionApproved: data.approvalStatus,
        },
      });

      // If approved, update risk item status
      if (data.approvalStatus === 'Aprovado') {
        await prisma.riskItem.update({
          where: { id: review.riskItemId },
          data: {
            monitoringStatus: 'Plano de ação aprovado',
          },
        });
      }
    }

    return updatedReview;
  }

  /**
   * Get pending direction reviews
   */
  async getPending() {
    return this.getAll({ approvalStatus: 'Pendente' });
  }

  /**
   * Get reviews requiring adjustment
   */
  async getRequiringAdjustment() {
    return this.getAll({ approvalStatus: 'Ajustar e retornar' });
  }
}

export default new DirectionReviewService();
