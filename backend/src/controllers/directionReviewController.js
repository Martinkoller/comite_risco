import directionReviewService from '../services/directionReviewService.js';

class DirectionReviewController {
  /**
   * GET /api/direction-reviews
   * Get all direction reviews with optional filters
   */
  async getAll(req, res) {
    try {
      const { riskItemId, approvalStatus } = req.query;
      const filters = { riskItemId, approvalStatus };
      
      const reviews = await directionReviewService.getAll(filters);
      
      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      console.error('Error fetching direction reviews:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/direction-reviews/:id
   * Get a single direction review by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const review = await directionReviewService.getById(parseInt(id));
      
      res.json({
        success: true,
        data: review,
      });
    } catch (error) {
      console.error('Error fetching direction review:', error);
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/direction-reviews/risk-item/:riskItemId
   * Get direction reviews by risk item
   */
  async getByRiskItem(req, res) {
    try {
      const { riskItemId } = req.params;
      const reviews = await directionReviewService.getByRiskItem(parseInt(riskItemId));
      
      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      console.error('Error fetching direction reviews by risk item:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/direction-reviews
   * Create a new direction review
   */
  async create(req, res) {
    try {
      const review = await directionReviewService.create(req.body, req.user?.id);
      
      res.status(201).json({
        success: true,
        data: review,
      });
    } catch (error) {
      console.error('Error creating direction review:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/direction-reviews/:id
   * Update a direction review
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const review = await directionReviewService.update(parseInt(id), req.body, req.user?.id);
      
      res.json({
        success: true,
        data: review,
      });
    } catch (error) {
      console.error('Error updating direction review:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/direction-reviews/pending
   * Get pending direction reviews
   */
  async getPending(req, res) {
    try {
      const reviews = await directionReviewService.getPending();
      
      res.json({
        success: true,
        data: reviews,
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
   * GET /api/direction-reviews/requiring-adjustment
   * Get reviews requiring adjustment
   */
  async getRequiringAdjustment(req, res) {
    try {
      const reviews = await directionReviewService.getRequiringAdjustment();
      
      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      console.error('Error fetching reviews requiring adjustment:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new DirectionReviewController();
