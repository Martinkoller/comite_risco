import api from './api'

export const dashboardService = {
  getSummary() {
    return api.get('/dashboard/summary')
  },

  getCriticalItems() {
    return api.get('/dashboard/critical-items')
  },

  getUpcomingDeadlines() {
    return api.get('/dashboard/upcoming-deadlines')
  },

  getRecentDecisions() {
    return api.get('/dashboard/recent-decisions')
  },

  getPendingDirection() {
    return api.get('/dashboard/pending-direction')
  },

  getDelayedActions() {
    return api.get('/dashboard/delayed-actions')
  },

  getManagementSummary() {
    return api.get('/dashboard/management-summary')
  },
}
