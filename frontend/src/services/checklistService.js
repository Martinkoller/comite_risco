import api from './api'

export const checklistService = {
  // Portais
  getPortals(includeInactive = false) {
    return api.get('/checklists/portals', { params: { includeInactive } })
  },
  createPortal(data) {
    return api.post('/checklists/portals', data)
  },
  updatePortal(id, data) {
    return api.put(`/checklists/portals/${id}`, data)
  },
  deletePortal(id) {
    return api.delete(`/checklists/portals/${id}`)
  },

  // Checklists
  getAll() {
    return api.get('/checklists')
  },
  getById(id) {
    return api.get(`/checklists/${id}`)
  },
  getByWeek(week) {
    return api.get(`/checklists/week/${encodeURIComponent(week)}`)
  },
  create(data) {
    return api.post('/checklists', data)
  },
  update(id, data) {
    return api.put(`/checklists/${id}`, data)
  },

  // Portal entries
  checkEntry(entryId, data) {
    return api.patch(`/checklists/entries/${entryId}/check`, data)
  },

  // Findings
  createFinding(data) {
    return api.post('/checklists/findings', data)
  },
  updateFinding(id, data) {
    return api.put(`/checklists/findings/${id}`, data)
  },
  deleteFinding(id) {
    return api.delete(`/checklists/findings/${id}`)
  },
  linkRiskItem(findingId, riskItemId) {
    return api.patch(`/checklists/findings/${findingId}/link-cr`, { riskItemId })
  },
}
