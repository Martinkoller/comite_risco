import riskItemService from '../services/riskItemService.js';

class RiskItemController {
  /**
   * GET /api/risk-items
   * Get all risk items with optional filters
   */
  async getAll(req, res) {
    try {
      const { status, isFastTrack, includeDeleted } = req.query;
      const filters = { status, isFastTrack, includeDeleted };
      
      const items = await riskItemService.getAll(filters);
      
      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      console.error('Error fetching risk items:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/risk-items/:id
   * Get a single risk item by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const item = await riskItemService.getById(parseInt(id));
      
      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Error fetching risk item:', error);
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/risk-items
   * Create a new risk item
   */
  async create(req, res) {
    try {
      const item = await riskItemService.create(req.body, req.user?.id);
      
      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Error creating risk item:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/risk-items/:id
   * Update a risk item
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const item = await riskItemService.update(parseInt(id), req.body, req.user?.id);
      
      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Error updating risk item:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/risk-items/:id
   * Delete a risk item (soft delete)
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const item = await riskItemService.delete(parseInt(id), req.user?.id);
      
      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Error deleting risk item:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/risk-items/week/:weekReference
   * Get risk items by week reference
   */
  async getByWeek(req, res) {
    try {
      const { weekReference } = req.params;
      const items = await riskItemService.getByWeek(weekReference);
      
      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      console.error('Error fetching risk items by week:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/risk-items/fast-track
   * Get fast track items
   */
  async getFastTrackItems(req, res) {
    try {
      const items = await riskItemService.getFastTrackItems();
      
      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      console.error('Error fetching fast track items:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new RiskItemController();
