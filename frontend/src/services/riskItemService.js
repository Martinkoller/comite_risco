import api from './api'

export const riskItemService = {
  getAll(filters = {}) {
    return api.get('/risk-items', { params: filters })
  },

  getById(id) {
    return api.get(`/risk-items/${id}`)
  },

  create(data) {
    return api.post('/risk-items', data)
  },

  update(id, data) {
    return api.put(`/risk-items/${id}`, data)
  },

  delete(id) {
    return api.delete(`/risk-items/${id}`)
  },

  getByWeek(weekReference) {
    return api.get(`/risk-items/week/${weekReference}`)
  },

  getFastTrackItems() {
    return api.get('/risk-items/fast-track')
  },
}
