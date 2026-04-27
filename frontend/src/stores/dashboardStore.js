import { defineStore } from 'pinia'
import { dashboardService } from '@/services/dashboardService'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    summary: null,
    criticalItems: [],
    upcomingDeadlines: [],
    recentDecisions: [],
    pendingDirectionItems: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchSummary() {
      this.loading = true
      this.error = null
      try {
        const response = await dashboardService.getSummary()
        this.summary = response.data
      } catch (error) {
        this.error = error
        console.error('Error fetching dashboard summary:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCriticalItems() {
      try {
        const response = await dashboardService.getCriticalItems()
        this.criticalItems = response.data
      } catch (error) {
        console.error('Error fetching critical items:', error)
      }
    },

    async fetchUpcomingDeadlines() {
      try {
        const response = await dashboardService.getUpcomingDeadlines()
        this.upcomingDeadlines = response.data
      } catch (error) {
        console.error('Error fetching upcoming deadlines:', error)
      }
    },

    async fetchRecentDecisions() {
      try {
        const response = await dashboardService.getRecentDecisions()
        this.recentDecisions = response.data
      } catch (error) {
        console.error('Error fetching recent decisions:', error)
      }
    },

    async fetchPendingDirectionItems() {
      try {
        const response = await dashboardService.getPendingDirectionItems()
        this.pendingDirectionItems = response.data
      } catch (error) {
        console.error('Error fetching pending direction items:', error)
      }
    },

    async fetchAll() {
      await Promise.all([
        this.fetchSummary(),
        this.fetchCriticalItems(),
        this.fetchUpcomingDeadlines(),
        this.fetchRecentDecisions(),
        this.fetchPendingDirectionItems(),
      ])
    },
  },
})
