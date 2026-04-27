import api from './api'

export const dashboardService = {
  getSummary(year)           { return api.get('/dashboard/summary',            { params: { year } }) },
  getCriticalItems(year)     { return api.get('/dashboard/critical-items',     { params: { year } }) },
  getUpcomingDeadlines(year) { return api.get('/dashboard/upcoming-deadlines', { params: { year } }) },
  getRecentDecisions(year)   { return api.get('/dashboard/recent-decisions',   { params: { year } }) },
  getPendingDirection()      { return api.get('/dashboard/pending-direction') },
  getDelayedActions(year)    { return api.get('/dashboard/delayed-actions',    { params: { year } }) },
  getManagementSummary(year) { return api.get('/dashboard/management-summary', { params: { year } }) },
}
