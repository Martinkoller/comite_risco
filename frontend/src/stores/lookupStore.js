import { defineStore } from 'pinia'
import { lookupService } from '@/services/lookupService'

export const useLookupStore = defineStore('lookup', {
  state: () => ({
    lookups: null,
    loading: false,
    error: null,
  }),

  getters: {
    products:         (s) => s.lookups?.products || [],
    severities:       (s) => s.lookups?.severities || [],
    eventSources:     (s) => s.lookups?.eventSources || [],
    eventTypes:       (s) => s.lookups?.eventTypes || [],
    committeeStatuses:(s) => s.lookups?.committeeStatuses || [],
    actionStatuses:   (s) => s.lookups?.actionStatuses || [],
    participants:     (s) => s.lookups?.participants || [],
    productOwners:    (s) => s.lookups?.productOwners || [],
    areas:            (s) => s.lookups?.areas || [],
    roles:            (s) => s.lookups?.roles || [],
  },

  actions: {
    async fetchLookups() {
      if (this.lookups) return  // já carregado
      this.loading = true
      this.error = null
      try {
        const response = await lookupService.getAll()
        this.lookups = response.data
      } catch (error) {
        this.error = error
        console.error('Error fetching lookups:', error)
      } finally {
        this.loading = false
      }
    },

    invalidate() {
      this.lookups = null
    },
  },
})
