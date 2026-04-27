import api from './api'

export const actionPlanService = {
  getAll(filters = {}) {
    return api.get('/action-plans', { params: filters })
  },

  getById(id) {
    return api.get(`/action-plans/${id}`)
  },

  create(data) {
    return api.post('/action-plans', data)
  },

  update(id, data) {
    return api.put(`/action-plans/${id}`, data)
  },

  delete(id) {
    return api.delete(`/action-plans/${id}`)
  },

  getByRiskItem(riskItemId) {
    return api.get(`/action-plans/risk-item/${riskItemId}`)
  },

  getOverdue() {
    return api.get('/action-plans/overdue')
  },

  getByStatus(statusName) {
    return api.get(`/action-plans/status/${statusName}`)
  },

  markDirectionApproved(id) {
    return api.put(`/action-plans/${id}/direction-approved`)
  },
}
