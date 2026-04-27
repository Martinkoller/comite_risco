import checklistService from '../services/checklistService.js';

class ChecklistController {
  // ── Portais ──────────────────────────────────────────────

  async getPortals(req, res) {
    try {
      const { includeInactive } = req.query;
      const data = await checklistService.getAllPortals({ includeInactive: includeInactive === 'true' });
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createPortal(req, res) {
    try {
      const data = await checklistService.createPortal(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ success: false, error: 'Já existe um portal com esse nome' });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updatePortal(req, res) {
    try {
      const data = await checklistService.updatePortal(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deletePortal(req, res) {
    try {
      await checklistService.deletePortal(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ── Checklists ────────────────────────────────────────────

  async getAll(req, res) {
    try {
      const data = await checklistService.getAll();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const data = await checklistService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      if (error.message === 'Checklist não encontrado') {
        return res.status(404).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getByWeek(req, res) {
    try {
      const data = await checklistService.getByWeek(req.params.week);
      res.json({ success: true, data: data || null });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req, res) {
    try {
      const data = await checklistService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({ success: false, error: 'Já existe um checklist para essa semana' });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async update(req, res) {
    try {
      const data = await checklistService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ── Entrada de portal ─────────────────────────────────────

  async checkPortalEntry(req, res) {
    try {
      const data = await checklistService.checkPortalEntry(req.params.entryId, req.body);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ── Achados ───────────────────────────────────────────────

  async createFinding(req, res) {
    try {
      const data = await checklistService.createFinding(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async updateFinding(req, res) {
    try {
      const data = await checklistService.updateFinding(req.params.findingId, req.body);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteFinding(req, res) {
    try {
      await checklistService.deleteFinding(req.params.findingId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async linkRiskItem(req, res) {
    try {
      const { riskItemId } = req.body;
      const data = await checklistService.linkRiskItem(req.params.findingId, riskItemId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new ChecklistController();
