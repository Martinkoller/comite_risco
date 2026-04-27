import api from './api'

export const poAnalysisService = {
  getAll(filters = {}) {
    return api.get('/po-analyses', { params: filters })
  },

  getById(id) {
    return api.get(`/po-analyses/${id}`)
  },

  create(data) {
    return api.post('/po-analyses', data)
  },

  update(id, data) {
    return api.put(`/po-analyses/${id}`, data)
  },

  delete(id) {
    return api.delete(`/po-analyses/${id}`)
  },

  getByRiskItem(riskItemId) {
    return api.get(`/po-analyses/risk-item/${riskItemId}`)
  },

  getByProduct(productId) {
    return api.get(`/po-analyses/product/${productId}`)
  },
}
