import actionPlanService from '../services/actionPlanService.js';

class ActionPlanController {
  /**
   * GET /api/action-plans
   * Get all action plans with optional filters
   */
  async getAll(req, res) {
    try {
      const { riskItemId, actionStatusId, overdue } = req.query;
      const filters = { riskItemId, actionStatusId, overdue };
      
      const plans = await actionPlanService.getAll(filters);
      
      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      console.error('Error fetching action plans:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/action-plans/:id
   * Get a single action plan by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const plan = await actionPlanService.getById(parseInt(id));
      
      res.json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('Error fetching action plan:', error);
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/action-plans
   * Create a new action plan
   */
  async create(req, res) {
    try {
      const plan = await actionPlanService.create(req.body, req.user?.id);
      
      res.status(201).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('Error creating action plan:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/action-plans/:id
   * Update an action plan
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const plan = await actionPlanService.update(parseInt(id), req.body, req.user?.id);
      
      res.json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('Error updating action plan:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/action-plans/:id
   * Delete an action plan
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await actionPlanService.delete(parseInt(id), req.user?.id);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error deleting action plan:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/action-plans/risk-item/:riskItemId
   * Get action plans by risk item
   */
  async getByRiskItem(req, res) {
    try {
      const { riskItemId } = req.params;
      const plans = await actionPlanService.getByRiskItem(parseInt(riskItemId));
      
      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      console.error('Error fetching action plans by risk item:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/action-plans/overdue
   * Get overdue action plans
   */
  async getOverdue(req, res) {
    try {
      const plans = await actionPlanService.getOverdue();
      
      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      console.error('Error fetching overdue action plans:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/action-plans/status/:statusName
   * Get action plans by status
   */
  async getByStatus(req, res) {
    try {
      const { statusName } = req.params;
      const plans = await actionPlanService.getByStatus(statusName);
      
      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      console.error('Error fetching action plans by status:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/action-plans/:id/direction-approved
   * Mark action plan as approved by direction
   */
  async markDirectionApproved(req, res) {
    try {
      const { id } = req.params;
      const plan = await actionPlanService.markDirectionApproved(parseInt(id), req.user?.id);
      
      res.json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('Error marking action plan as direction approved:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new ActionPlanController();
