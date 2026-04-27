import api from './api'

export const directionReviewService = {
  getAll(filters = {}) {
    return api.get('/direction-reviews', { params: filters })
  },

  getById(id) {
    return api.get(`/direction-reviews/${id}`)
  },

  getByRiskItem(riskItemId) {
    return api.get(`/direction-reviews/risk-item/${riskItemId}`)
  },

  create(data) {
    return api.post('/direction-reviews', data)
  },

  update(id, data) {
    return api.put(`/direction-reviews/${id}`, data)
  },

  getPending() {
    return api.get('/direction-reviews/pending')
  },

  getRequiringAdjustment() {
    return api.get('/direction-reviews/requiring-adjustment')
  },
}
