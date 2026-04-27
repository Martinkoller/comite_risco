import api from './api'

export const attachmentService = {
  // Get all attachments for a risk item
  getByRiskItem: (riskItemId) => {
    return api.get(`/attachments/risk-item/${riskItemId}`)
  },

  // Create a new attachment
  create: (data) => {
    return api.post('/attachments', data)
  },

  // Delete an attachment
  delete: (id) => {
    return api.delete(`/attachments/${id}`)
  },
}
