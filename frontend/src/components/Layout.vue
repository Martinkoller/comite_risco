<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 text-white flex flex-col">
      <div class="p-6 border-b border-gray-800">
        <h1 class="text-xl font-bold">Comitê de Risco</h1>
        <p class="text-gray-400 text-sm">Zucchetti BU POS</p>
      </div>
      
      <nav class="flex-1 p-4">
        <ul class="space-y-2">
          <li>
            <router-link
              to="/"
              class="flex items-center px-4 py-3 rounded-lg transition-colors"
              :class="isActive('/') ? 'bg-primary-600' : 'hover:bg-gray-800'"
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </router-link>
          </li>
          <li>
            <router-link
              to="/risk-items"
              class="flex items-center px-4 py-3 rounded-lg transition-colors"
              :class="isActive('/risk-items') ? 'bg-primary-600' : 'hover:bg-gray-800'"
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Itens de Risco
            </router-link>
          </li>
          <li>
            <router-link
              to="/management-meetings"
              class="flex items-center px-4 py-3 rounded-lg transition-colors"
              :class="isActive('/management-meetings') ? 'bg-primary-600' : 'hover:bg-gray-800'"
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Reunião Gestão
            </router-link>
          </li>
          <li>
            <router-link
              to="/cadastros"
              class="flex items-center px-4 py-3 rounded-lg transition-colors"
              :class="isActive('/cadastros') ? 'bg-primary-600' : 'hover:bg-gray-800'"
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Cadastros
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t border-gray-800">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span class="text-sm font-medium">AD</span>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium">Admin</p>
            <p class="text-xs text-gray-400">Administrador</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold text-gray-900">{{ pageTitle }}</h2>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">{{ currentDate }}</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 p-6 overflow-auto">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => {
  const titles = {
    '/': 'Dashboard',
    '/risk-items': 'Itens de Risco',
    '/management-meetings': 'Reunião de Gestão',
    '/cadastros': 'Cadastros',
  }
  return titles[route.path] || 'Comitê de Risco'
})

const currentDate = computed(() => {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const isActive = (path) => {
  return route.path === path
}
</script>
