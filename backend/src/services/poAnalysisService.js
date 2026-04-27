import { PrismaClient } from '@prisma/client';
import timelineService from './timelineService.js';

const prisma = new PrismaClient();

class POAnalysisService {
  /**
   * Get all PO analyses with optional filters
   */
  async getAll(filters = {}) {
    const { riskItemId, productId } = filters;
    
    const where = {};
    
    if (riskItemId) {
      where.riskItemId = riskItemId;
    }
    
    if (productId) {
      where.productId = productId;
    }

    const analyses = await prisma.pOAnalysis.findMany({
      where,
      include: {
        riskItem: {
          include: {
            eventSource: true,
            eventType: true,
          },
        },
        product: {
          include: {
            owner: true,
          },
        },
        suggestedSeverity: true,
      },
      orderBy: {
        analysisDate: 'desc',
      },
    });

    return analyses;
  }

  /**
   * Get a single PO analysis by ID
   */
  async getById(id) {
    const analysis = await prisma.pOAnalysis.findUnique({
      where: { id },
      include: {
        riskItem: {
          include: {
            eventSource: true,
            eventType: true,
            preliminarySeverity: true,
          },
        },
        product: {
          include: {
            owner: true,
          },
        },
        suggestedSeverity: true,
      },
    });

    if (!analysis) {
      throw new Error('PO analysis not found');
    }

    return analysis;
  }

  /**
   * Create a new PO analysis
   */
  async create(data, userId = null) {
    const analysis = await prisma.pOAnalysis.create({
      data,
      include: {
        riskItem: true,
        product: true,
        suggestedSeverity: true,
      },
    });

    // Log timeline event
    await timelineService.logPOAnalysisCreated(
      analysis.riskItemId,
      analysis.poResponsible,
      userId
    );

    return analysis;
  }

  /**
   * Update a PO analysis
   */
  async update(id, data, userId = null) {
    const analysis = await prisma.pOAnalysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      throw new Error('PO analysis not found');
    }

    const updatedAnalysis = await prisma.pOAnalysis.update({
      where: { id },
      data,
      include: {
        riskItem: true,
        product: true,
        suggestedSeverity: true,
      },
    });

    // Log timeline event for update
    await timelineService.createEvent(
      analysis.riskItemId,
      timelineService.EVENT_TYPES.PO_ANALYSIS_UPDATED,
      `Análise de PO atualizada por: ${data.poResponsible || analysis.poResponsible}`,
      userId
    );

    return updatedAnalysis;
  }

  /**
   * Delete a PO analysis
   */
  async delete(id, userId = null) {
    const analysis = await prisma.pOAnalysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      throw new Error('PO analysis not found');
    }

    await prisma.pOAnalysis.delete({
      where: { id },
    });

    return { message: 'PO analysis deleted successfully' };
  }

  /**
   * Get PO analyses by risk item
   */
  async getByRiskItem(riskItemId) {
    return this.getAll({ riskItemId });
  }

  /**
   * Get PO analyses by product
   */
  async getByProduct(productId) {
    return this.getAll({ productId });
  }
}

export default new POAnalysisService();
