import api from './api'

export const managementMeetingService = {
  // Get all management meetings
  getAll: () => {
    return api.get('/management-meetings')
  },

  // Get all management meetings for a risk item
  getManagementMeetingsByRiskItem: (riskItemId) => {
    return api.get(`/risk-items/${riskItemId}/management-meetings`)
  },

  // Get single management meeting
  getById: (id) => {
    return api.get(`/management-meetings/${id}`)
  },

  // Get risk items available for management meetings (Aguardando Direção)
  getAvailableRiskItems: () => {
    return api.get('/management-meetings/available-risk-items')
  },

  // Create new management meeting
  create: (data) => {
    return api.post('/management-meetings', data)
  },

  // Update management meeting
  update: (id, data) => {
    return api.put(`/management-meetings/${id}`, data)
  },

  // Delete management meeting
  delete: (id) => {
    return api.delete(`/management-meetings/${id}`)
  },
}
