import poAnalysisService from '../services/poAnalysisService.js';

class POAnalysisController {
  /**
   * GET /api/po-analyses
   * Get all PO analyses with optional filters
   */
  async getAll(req, res) {
    try {
      const { riskItemId, productId } = req.query;
      const filters = { riskItemId, productId };
      
      const analyses = await poAnalysisService.getAll(filters);
      
      res.json({
        success: true,
        data: analyses,
      });
    } catch (error) {
      console.error('Error fetching PO analyses:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/po-analyses/:id
   * Get a single PO analysis by ID
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const analysis = await poAnalysisService.getById(parseInt(id));
      
      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error('Error fetching PO analysis:', error);
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/po-analyses
   * Create a new PO analysis
   */
  async create(req, res) {
    try {
      const analysis = await poAnalysisService.create(req.body, req.user?.id);
      
      res.status(201).json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error('Error creating PO analysis:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/po-analyses/:id
   * Update a PO analysis
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const analysis = await poAnalysisService.update(parseInt(id), req.body, req.user?.id);
      
      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error('Error updating PO analysis:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/po-analyses/:id
   * Delete a PO analysis
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await poAnalysisService.delete(parseInt(id), req.user?.id);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error deleting PO analysis:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/po-analyses/risk-item/:riskItemId
   * Get PO analyses by risk item
   */
  async getByRiskItem(req, res) {
    try {
      const { riskItemId } = req.params;
      const analyses = await poAnalysisService.getByRiskItem(parseInt(riskItemId));
      
      res.json({
        success: true,
        data: analyses,
      });
    } catch (error) {
      console.error('Error fetching PO analyses by risk item:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/po-analyses/product/:productId
   * Get PO analyses by product
   */
  async getByProduct(req, res) {
    try {
      const { productId } = req.params;
      const analyses = await poAnalysisService.getByProduct(parseInt(productId));
      
      res.json({
        success: true,
        data: analyses,
      });
    } catch (error) {
      console.error('Error fetching PO analyses by product:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

export default new POAnalysisController();
