import dashboardService from '../services/dashboardService.js';

class DashboardController {
  /**
   * GET /api/dashboard/summary
   * Get dashboard summary with all metrics
   */
  async getSummary(req, res) {
    try {
      const summary = await dashboardService.getSummary();
      
      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/dashboard/critical-items
   * Get critical items (P1) for dashboard
   */
  async getCriticalItems(req, res) {
    try {
      const items = await dashboardService.getCriticalItems();
      
      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      console.error('Error fetching critical items:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/dashboard/upcoming-deadlines
   * Get items with upcoming deadlines
   */
  async getUpcomingDeadlines(req, res) {
    try {
      const items = await dashboardService.getUpcomingDeadlines();
      
      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      console.error('Error fetching upcoming deadlines:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/dashboard/recent-decisions
   * Get recent committee decisions
   */
  async getRecentDecisions(req, res) {
    try {
      const decisions = await dashboardService.getRecentDecisions();
      
      res.json({
        success: true,
        data: decisions,
      });
    } catch (error) {
      console.error('Error fetching recent decisions:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/dashboard/pending-direction
   * Get items pending direction review
   */
  async getPendingDirectionItems(req, res) {
    try {
      const items = await dashboardService.getPendingDirectionItems();
      
      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      console.error('Error fetching pending direction items:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  async getDelayedActions(req, res) {
    try {
      const items = await dashboardService.getDelayedActions();
      res.json({ success: true, data: items });
    } catch (error) {
      console.error('Error fetching delayed actions:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getManagementSummary(req, res) {
    try {
      const data = await dashboardService.getManagementSummary();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching management summary:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new DashboardController();
