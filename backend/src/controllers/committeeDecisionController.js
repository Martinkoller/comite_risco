import committeeDecisionService from '../services/committeeDecisionService.js';

class CommitteeDecisionController {
  /**
   * GET /api/committee-decisions
   * Get all committee decisions with optional filters
   */
  async getAll(req, res) {
    try {
      const { goesToDirection, committeeStatusId } = req.query;
      const filters = { goesToDirection, committeeStatusId };
      
      const decisions = await committeeDecisionService.getAll(filters);
      
      res.json({
        success: true,
        data: decisions,
      });
    } catch (error) {
      console.error('Error fetching committee decisions:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/committee-decisions/:id
   * Get a single committee decision by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const decision = await committeeDecisionService.getById(parseInt(id));
      
      res.json({
        success: true,
        data: decision,
      });
    } catch (error) {
      console.error('Error fetching committee decision:', error);
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/committee-decisions/risk-item/:riskItemId
   * Get committee decision by risk item ID
   */
  async getByRiskItem(req, res) {
    try {
      const { riskItemId } = req.params;
      const decision = await committeeDecisionService.getByRiskItem(parseInt(riskItemId));
      
      res.json({
        success: true,
        data: decision,
      });
    } catch (error) {
      console.error('Error fetching committee decision by risk item:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/committee-decisions
   * Create a new committee decision
   */
  async create(req, res) {
    try {
      const decision = await committeeDecisionService.create(req.body, req.user?.id);
      
      res.status(201).json({
        success: true,
        data: decision,
      });
    } catch (error) {
      console.error('Error creating committee decision:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/committee-decisions/:id
   * Update a committee decision
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const decision = await committeeDecisionService.update(parseInt(id), req.body, req.user?.id);
      
      res.json({
        success: true,
        data: decision,
      });
    } catch (error) {
      console.error('Error updating committee decision:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/committee-decisions/pending-direction
   * Get decisions pending direction review
   */
  async getPendingDirectionReview(req, res) {
    try {
      const decisions = await committeeDecisionService.getPendingDirectionReview();
      
      res.json({
        success: true,
        data: decisions,
      });
    } catch (error) {
      console.error('Error fetching pending direction reviews:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/committee-decisions/severity/:severityCode
   * Get decisions by severity
   */
  async getBySeverity(req, res) {
    try {
      const { severityCode } = req.params;
      const decisions = await committeeDecisionService.getBySeverity(severityCode);
      
      res.json({
        success: true,
        data: decisions,
      });
    } catch (error) {
      console.error('Error fetching decisions by severity:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new CommitteeDecisionController();
