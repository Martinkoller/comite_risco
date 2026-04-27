import api from './api'

export const actionService = {
  // Get all actions for a risk item
  getActionsByRiskItem: (riskItemId) => {
    return api.get(`/risk-items/${riskItemId}/actions`)
  },

  // Get single action
  getById: (id) => {
    return api.get(`/actions/${id}`)
  },

  // Create new action
  create: (data) => {
    return api.post('/actions', data)
  },

  // Update action
  update: (id, data) => {
    return api.put(`/actions/${id}`, data)
  },

  // Delete action
  delete: (id) => {
    return api.delete(`/actions/${id}`)
  },
}
