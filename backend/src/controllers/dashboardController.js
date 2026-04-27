import dashboardService from '../services/dashboardService.js';

const currentYear = () => new Date().getFullYear();

function resolveYear(req) {
  const y = Number(req.query.year);
  return (y >= 2020 && y <= 2100) ? y : currentYear();
}

class DashboardController {
  async getSummary(req, res) {
    try {
      const data = await dashboardService.getSummary(resolveYear(req));
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getCriticalItems(req, res) {
    try {
      const data = await dashboardService.getCriticalItems(resolveYear(req));
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching critical items:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getUpcomingDeadlines(req, res) {
    try {
      const data = await dashboardService.getUpcomingDeadlines(resolveYear(req));
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching upcoming deadlines:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getRecentDecisions(req, res) {
    try {
      const data = await dashboardService.getRecentDecisions(resolveYear(req));
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching recent decisions:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getPendingDirectionItems(req, res) {
    try {
      const data = await dashboardService.getPendingDirectionItems();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching pending direction items:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getDelayedActions(req, res) {
    try {
      const data = await dashboardService.getDelayedActions(resolveYear(req));
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching delayed actions:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getManagementSummary(req, res) {
    try {
      const data = await dashboardService.getManagementSummary(resolveYear(req));
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error fetching management summary:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default new DashboardController();
