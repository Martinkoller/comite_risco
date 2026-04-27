import { PrismaClient } from '@prisma/client';
import { generateCRCode } from '../utils/idGenerator.js';
import timelineService from './timelineService.js';

const prisma = new PrismaClient();

class RiskItemService {
  /**
   * Get all risk items with optional filters
   */
  async getAll(filters = {}) {
    const { status, isFastTrack, severity, includeDeleted } = filters;

    // Exclude soft-deleted items by default
    const where = includeDeleted === 'true' ? {} : { deletedAt: null };

    if (status) {
      where.monitoringStatus = status;
    }

    if (isFastTrack !== undefined) {
      where.isFastTrack = isFastTrack === 'true';
    }

    const items = await prisma.riskItem.findMany({
      where,
      include: {
        eventSource: true,
        eventType: true,
        preliminarySeverity: true,
        products: {
          include: {
            product: true,
          },
        },
        committeeDecision: {
          include: {
            finalSeverity: true,
            committeeStatus: true,
          },
        },
        actionPlans: {
          include: {
            actionStatus: true,
          },
        },
        _count: {
          select: {
            poAnalyses: true,
            timelineEvents: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return items;
  }

  /**
   * Get a single risk item by ID
   */
  async getById(id) {
    const item = await prisma.riskItem.findUnique({
      where: { id },
      include: {
        eventSource: true,
        eventType: true,
        preliminarySeverity: true,
        products: {
          include: {
            product: {
              include: {
                owner: true,
              },
            },
          },
        },
        poAnalyses: {
          include: {
            product: true,
            suggestedSeverity: true,
          },
          orderBy: {
            analysisDate: 'desc',
          },
        },
        committeeDecision: {
          include: {
            finalSeverity: true,
            committeeStatus: true,
          },
        },
        actionPlans: {
          include: {
            actionStatus: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        directionReviews: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        timelineEvents: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            eventDate: 'desc',
          },
        },
      },
    });

    if (!item) {
      throw new Error('Risk item not found');
    }

    return item;
  }

  /**
   * Create a new risk item
   */
  async create(data, userId = null) {
    const { productIds, ...itemData } = data;

    // Generate CR code
    const code = await generateCRCode();

    // Create the risk item
    const item = await prisma.riskItem.create({
      data: {
        ...itemData,
        code,
        products: {
          create: productIds.map(productId => ({
            productId,
          })),
        },
      },
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
    });

    // Log timeline event
    await timelineService.logItemCreated(item.id, userId);

    return item;
  }

  /**
   * Update a risk item
   */
  async update(id, data, userId = null) {
    const { productIds, ...itemData } = data;
    const oldItem = await prisma.riskItem.findUnique({ where: { id } });

    if (!oldItem) {
      throw new Error('Risk item not found');
    }

    // Handle product updates
    if (productIds) {
      // Delete existing product relationships
      await prisma.riskItemProduct.deleteMany({
        where: { riskItemId: id },
      });

      // Create new product relationships
      await prisma.riskItemProduct.createMany({
        data: productIds.map(productId => ({
          riskItemId: id,
          productId,
        })),
      });
    }

    // Log status change if status is being updated
    if (itemData.monitoringStatus && itemData.monitoringStatus !== oldItem.monitoringStatus) {
      await timelineService.logStatusChanged(
        id,
        oldItem.monitoringStatus,
        itemData.monitoringStatus,
        userId
      );
    }

    // Log Fast Track activation
    if (itemData.isFastTrack === true && oldItem.isFastTrack === false) {
      await timelineService.logFastTrackActivated(id, itemData.fastTrackReason, userId);
      
      // Set director notified timestamp if Fast Track is activated
      itemData.directorNotifiedAt = new Date();
    }

    // Update the item
    const updatedItem = await prisma.riskItem.update({
      where: { id },
      data: itemData,
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
    });

    return updatedItem;
  }

  /**
   * Soft delete a risk item (sets deletedAt timestamp)
   */
  async delete(id, userId = null) {
    const item = await prisma.riskItem.findUnique({ where: { id } });

    if (!item) {
      throw new Error('Risk item not found');
    }

    const updatedItem = await prisma.riskItem.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await timelineService.createEvent(
      id,
      'ITEM_DELETED',
      'Item removido (soft delete)',
      userId
    );

    return updatedItem;
  }

  /**
   * Get fast track items
   */
  async getFastTrackItems() {
    return this.getAll({ isFastTrack: 'true' });
  }

  /**
   * Get items by status
   */
  async getByStatus(status) {
    return this.getAll({ status });
  }
}

export default new RiskItemService();
