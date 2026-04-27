import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

class LookupController {
  /**
   * GET /api/lookups/products
   * Get all products
   */
  async getProducts(req, res) {
    try {
      const products = await prisma.product.findMany({
        include: { owner: true },
        orderBy: { name: 'asc' },
      })
      
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/lookups/severities
   * Get all severities
   */
  async getSeverities(req, res) {
    try {
      const severities = await prisma.severity.findMany({
        orderBy: { level: 'asc' },
      })
      
      res.json({
        success: true,
        data: severities,
      });
    } catch (error) {
      console.error('Error fetching severities:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/lookups/event-sources
   * Get all event sources
   */
  async getEventSources(req, res) {
    try {
      const eventSources = await prisma.eventSource.findMany({
        orderBy: { name: 'asc' },
      })
      
      res.json({
        success: true,
        data: eventSources,
      });
    } catch (error) {
      console.error('Error fetching event sources:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/lookups/event-types
   * Get all event types
   */
  async getEventTypes(req, res) {
    try {
      const eventTypes = await prisma.eventType.findMany({
        orderBy: { name: 'asc' },
      })
      
      res.json({
        success: true,
        data: eventTypes,
      });
    } catch (error) {
      console.error('Error fetching event types:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/lookups/committee-statuses
   * Get all committee statuses
   */
  async getCommitteeStatuses(req, res) {
    try {
      const committeeStatuses = await prisma.committeeStatus.findMany({
        orderBy: { name: 'asc' },
      })
      
      res.json({
        success: true,
        data: committeeStatuses,
      });
    } catch (error) {
      console.error('Error fetching committee statuses:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/lookups/action-statuses
   * Get all action statuses
   */
  async getActionStatuses(req, res) {
    try {
      const actionStatuses = await prisma.actionStatus.findMany({
        orderBy: { name: 'asc' },
      })
      
      res.json({
        success: true,
        data: actionStatuses,
      });
    } catch (error) {
      console.error('Error fetching action statuses:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/lookups/participants
   * Get all participants
   */
  async getParticipants(req, res) {
    try {
      const participants = await prisma.participant.findMany({
        orderBy: { name: 'asc' },
      })
      
      res.json({
        success: true,
        data: participants,
      });
    } catch (error) {
      console.error('Error fetching participants:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/lookups/product-owners
   * Get all product owners
   */
  async getProductOwners(req, res) {
    try {
      const productOwners = await prisma.productOwner.findMany({
        orderBy: { name: 'asc' },
      })
      
      res.json({
        success: true,
        data: productOwners,
      });
    } catch (error) {
      console.error('Error fetching product owners:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/lookups/roles
   * Get all roles
   */
  async getRoles(req, res) {
    try {
      const roles = await prisma.role.findMany({
        orderBy: { name: 'asc' },
      })
      
      res.json({
        success: true,
        data: roles,
      });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/lookups/areas
   * Get all areas
   */
  async getAreas(req, res) {
    try {
      const areas = await prisma.area.findMany({
        where: { active: true },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: areas });
    } catch (error) {
      console.error('Error fetching areas:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createArea(req, res) {
    try {
      const { name, active } = req.body;
      const area = await prisma.area.create({ data: { name, active: active ?? true } });
      res.json({ success: true, data: area });
    } catch (error) {
      console.error('Error creating area:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateArea(req, res) {
    try {
      const { id } = req.params;
      const { name, active } = req.body;
      const area = await prisma.area.update({ where: { id: parseInt(id) }, data: { name, active } });
      res.json({ success: true, data: area });
    } catch (error) {
      console.error('Error updating area:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteArea(req, res) {
    try {
      const { id } = req.params;
      await prisma.area.delete({ where: { id: parseInt(id) } });
      res.json({ success: true, data: { message: 'Area deleted' } });
    } catch (error) {
      console.error('Error deleting area:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/lookups/settings
   * Get all settings
   */
  async getSettings(req, res) {
    try {
      const settings = await prisma.setting.findMany({ orderBy: { key: 'asc' } });
      res.json({ success: true, data: settings });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateSetting(req, res) {
    try {
      const { key } = req.params;
      const { value, label } = req.body;
      const setting = await prisma.setting.update({
        where: { key },
        data: { value, ...(label !== undefined && { label }) },
      });
      res.json({ success: true, data: setting });
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * GET /api/lookups/all
   * Get all lookups at once
   */
  async getAllLookups(req, res) {
    try {
      const [participants, eventSources, eventTypes, severities, committeeStatuses, actionStatuses, products, productOwners, roles, areas] = await Promise.all([
        prisma.participant.findMany({ orderBy: { name: 'asc' } }),
        prisma.eventSource.findMany({ orderBy: { name: 'asc' } }),
        prisma.eventType.findMany({ orderBy: { name: 'asc' } }),
        prisma.severity.findMany({ orderBy: { level: 'asc' } }),
        prisma.committeeStatus.findMany({ orderBy: { name: 'asc' } }),
        prisma.actionStatus.findMany({ orderBy: { name: 'asc' } }),
        prisma.product.findMany({ include: { owner: true }, orderBy: { name: 'asc' } }),
        prisma.productOwner.findMany({ orderBy: { name: 'asc' } }),
        prisma.role.findMany({ orderBy: { name: 'asc' } }),
        prisma.area.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
      ]);

      res.json({
        success: true,
        data: {
          participants,
          eventSources,
          eventTypes,
          severities,
          committeeStatuses,
          actionStatuses,
          products,
          productOwners,
          roles,
          areas,
        },
      });
    } catch (error) {
      console.error('Error fetching all lookups:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // CRUD for Participants
  async createParticipant(req, res) {
    try {
      const { name, role, active } = req.body
      const participant = await prisma.participant.create({
        data: { name, role, active: active ?? true },
      })
      res.json({ success: true, data: participant })
    } catch (error) {
      console.error('Error creating participant:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async updateParticipant(req, res) {
    try {
      const { id } = req.params
      const { name, role, active } = req.body
      const participant = await prisma.participant.update({
        where: { id: parseInt(id) },
        data: { name, role, active },
      })
      res.json({ success: true, data: participant })
    } catch (error) {
      console.error('Error updating participant:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async deleteParticipant(req, res) {
    try {
      const { id } = req.params
      await prisma.participant.delete({
        where: { id: parseInt(id) },
      })
      res.json({ success: true, data: { message: 'Participant deleted' } })
    } catch (error) {
      console.error('Error deleting participant:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // CRUD for Event Sources
  async createEventSource(req, res) {
    try {
      const { name, active } = req.body
      const eventSource = await prisma.eventSource.create({
        data: { name, active: active ?? true },
      })
      res.json({ success: true, data: eventSource })
    } catch (error) {
      console.error('Error creating event source:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async updateEventSource(req, res) {
    try {
      const { id } = req.params
      const { name, active } = req.body
      const eventSource = await prisma.eventSource.update({
        where: { id: parseInt(id) },
        data: { name, active },
      })
      res.json({ success: true, data: eventSource })
    } catch (error) {
      console.error('Error updating event source:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async deleteEventSource(req, res) {
    try {
      const { id } = req.params
      await prisma.eventSource.delete({
        where: { id: parseInt(id) },
      })
      res.json({ success: true, data: { message: 'Event source deleted' } })
    } catch (error) {
      console.error('Error deleting event source:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // CRUD for Event Types
  async createEventType(req, res) {
    try {
      const { name, active } = req.body
      const eventType = await prisma.eventType.create({
        data: { name, active: active ?? true },
      })
      res.json({ success: true, data: eventType })
    } catch (error) {
      console.error('Error creating event type:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async updateEventType(req, res) {
    try {
      const { id } = req.params
      const { name, active } = req.body
      const eventType = await prisma.eventType.update({
        where: { id: parseInt(id) },
        data: { name, active },
      })
      res.json({ success: true, data: eventType })
    } catch (error) {
      console.error('Error updating event type:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async deleteEventType(req, res) {
    try {
      const { id } = req.params
      await prisma.eventType.delete({
        where: { id: parseInt(id) },
      })
      res.json({ success: true, data: { message: 'Event type deleted' } })
    } catch (error) {
      console.error('Error deleting event type:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // CRUD for Committee Statuses
  async createCommitteeStatus(req, res) {
    try {
      const { name, active } = req.body
      const committeeStatus = await prisma.committeeStatus.create({
        data: { name, active: active ?? true },
      })
      res.json({ success: true, data: committeeStatus })
    } catch (error) {
      console.error('Error creating committee status:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async updateCommitteeStatus(req, res) {
    try {
      const { id } = req.params
      const { name, active } = req.body
      const committeeStatus = await prisma.committeeStatus.update({
        where: { id: parseInt(id) },
        data: { name, active },
      })
      res.json({ success: true, data: committeeStatus })
    } catch (error) {
      console.error('Error updating committee status:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async deleteCommitteeStatus(req, res) {
    try {
      const { id } = req.params
      await prisma.committeeStatus.delete({
        where: { id: parseInt(id) },
      })
      res.json({ success: true, data: { message: 'Committee status deleted' } })
    } catch (error) {
      console.error('Error deleting committee status:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // CRUD for Action Statuses
  async createActionStatus(req, res) {
    try {
      const { name, active } = req.body
      const actionStatus = await prisma.actionStatus.create({
        data: { name, active: active ?? true },
      })
      res.json({ success: true, data: actionStatus })
    } catch (error) {
      console.error('Error creating action status:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async updateActionStatus(req, res) {
    try {
      const { id } = req.params
      const { name, active } = req.body
      const actionStatus = await prisma.actionStatus.update({
        where: { id: parseInt(id) },
        data: { name, active },
      })
      res.json({ success: true, data: actionStatus })
    } catch (error) {
      console.error('Error updating action status:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async deleteActionStatus(req, res) {
    try {
      const { id } = req.params
      await prisma.actionStatus.delete({
        where: { id: parseInt(id) },
      })
      res.json({ success: true, data: { message: 'Action status deleted' } })
    } catch (error) {
      console.error('Error deleting action status:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  // CRUD for Roles
  async createRole(req, res) {
    try {
      const { name } = req.body
      const role = await prisma.role.create({
        data: { name },
      })
      res.json({ success: true, data: role })
    } catch (error) {
      console.error('Error creating role:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async updateRole(req, res) {
    try {
      const { id } = req.params
      const { name } = req.body
      const role = await prisma.role.update({
        where: { id: parseInt(id) },
        data: { name },
      })
      res.json({ success: true, data: role })
    } catch (error) {
      console.error('Error updating role:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  async deleteRole(req, res) {
    try {
      const { id } = req.params
      await prisma.role.delete({
        where: { id: parseInt(id) },
      })
      res.json({ success: true, data: { message: 'Role deleted' } })
    } catch (error) {
      console.error('Error deleting role:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  }
}

export default new LookupController();
