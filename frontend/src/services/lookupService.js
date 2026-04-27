import api from './api'

export const lookupService = {
  getAll() {
    return api.get('/lookups/all')
  },

  getProducts() {
    return api.get('/lookups/products')
  },

  getSeverities() {
    return api.get('/lookups/severities')
  },

  getEventSources() {
    return api.get('/lookups/event-sources')
  },

  getEventTypes() {
    return api.get('/lookups/event-types')
  },

  getCommitteeStatuses() {
    return api.get('/lookups/committee-statuses')
  },

  getActionStatuses() {
    return api.get('/lookups/action-statuses')
  },

  getParticipants() {
    return api.get('/lookups/participants')
  },

  getProductOwners() {
    return api.get('/lookups/product-owners')
  },

  getRoles() {
    return api.get('/lookups/roles')
  },
}
