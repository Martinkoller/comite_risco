import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class LookupService {
  /**
   * Get all products
   */
  async getProducts() {
    return prisma.product.findMany({
      include: {
        owner: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get all severities
   */
  async getSeverities() {
    return prisma.severity.findMany({
      where: {
        active: true,
      },
      orderBy: {
        level: 'asc',
      },
    });
  }

  /**
   * Get all event sources
   */
  async getEventSources() {
    return prisma.eventSource.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get all event types
   */
  async getEventTypes() {
    return prisma.eventType.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get all committee statuses
   */
  async getCommitteeStatuses() {
    return prisma.committeeStatus.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get all action statuses
   */
  async getActionStatuses() {
    return prisma.actionStatus.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get all participants
   */
  async getParticipants() {
    return prisma.participant.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Get all product owners
   */
  async getProductOwners() {
    return prisma.productOwner.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get all roles
   */
  async getRoles() {
    return prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get all areas
   */
  async getAreas() {
    return prisma.area.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get all settings
   */
  async getSettings() {
    const rows = await prisma.setting.findMany({ orderBy: { key: 'asc' } });
    // Return as key→value map for convenience
    return rows.reduce((acc, s) => {
      acc[s.key] = { value: s.value, label: s.label };
      return acc;
    }, {});
  }

  /**
   * Get all lookups at once (for initial load)
   */
  async getAllLookups() {
    const [
      products,
      severities,
      eventSources,
      eventTypes,
      committeeStatuses,
      actionStatuses,
      participants,
      productOwners,
      roles,
      areas,
    ] = await Promise.all([
      this.getProducts(),
      this.getSeverities(),
      this.getEventSources(),
      this.getEventTypes(),
      this.getCommitteeStatuses(),
      this.getActionStatuses(),
      this.getParticipants(),
      this.getProductOwners(),
      this.getRoles(),
      this.getAreas(),
    ]);

    return {
      products,
      severities,
      eventSources,
      eventTypes,
      committeeStatuses,
      actionStatuses,
      participants,
      productOwners,
      roles,
      areas,
    };
  }
}

export default new LookupService();
