import api from './api'

export const committeeDecisionService = {
  getAll(filters = {}) {
    return api.get('/committee-decisions', { params: filters })
  },

  getById(id) {
    return api.get(`/committee-decisions/${id}`)
  },

  getByRiskItem(riskItemId) {
    return api.get(`/committee-decisions/risk-item/${riskItemId}`)
  },

  create(data) {
    return api.post('/committee-decisions', data)
  },

  update(id, data) {
    return api.put(`/committee-decisions/${id}`, data)
  },

  getPendingDirectionReview() {
    return api.get('/committee-decisions/pending-direction')
  },

  getBySeverity(severityCode) {
    return api.get(`/committee-decisions/severity/${severityCode}`)
  },
}
