<script setup>
import { ref, onMounted } from 'vue'
import { useLookupStore } from '@/stores/lookupStore'
import { useToast } from '@/composables/useToast'
import EmptyState from '@/components/EmptyState.vue'
import api from '@/services/api'

const lookup = useLookupStore()
const toast = useToast()
const activeTab = ref('participants')

onMounted(() => lookup.fetchLookups())

// Tabs
const tabs = [
  { key: 'participants', label: 'Participantes' },
  { key: 'products', label: 'Produtos' },
  { key: 'areas', label: 'Áreas' },
  { key: 'eventSources', label: 'Fontes' },
  { key: 'eventTypes', label: 'Tipos de Evento' },
  { key: 'committeeStatuses', label: 'Status Comitê' },
  { key: 'actionStatuses', label: 'Status Ação' },
  { key: 'settings', label: 'Configurações' },
]

// Generic CRUD state
const showForm = ref(false)
const editingItem = ref(null)
const formData = ref({})
const settings = ref([])

async function loadSettings() {
  const res = await api.get('/lookups/settings')
  settings.value = res.data.data || []
}

onMounted(loadSettings)

const endpointMap = {
  participants: '/lookups/participants',
  areas: '/lookups/areas',
  eventSources: '/lookups/event-sources',
  eventTypes: '/lookups/event-types',
  committeeStatuses: '/lookups/committee-statuses',
  actionStatuses: '/lookups/action-statuses',
}

function openNew(tab) {
  editingItem.value = null
  formData.value = { name: '', active: true }
  if (tab === 'participants') formData.value.role = ''
  showForm.value = true
}
function openEdit(item) {
  editingItem.value = item
  formData.value = { ...item }
  showForm.value = true
}
function closeForm() { showForm.value = false; editingItem.value = null }

async function save() {
  const endpoint = endpointMap[activeTab.value]
  if (!endpoint) return
  try {
    if (editingItem.value) {
      await api.put(`${endpoint}/${editingItem.value.id}`, formData.value)
      toast.success('Atualizado com sucesso!')
    } else {
      await api.post(endpoint, formData.value)
      toast.success('Criado com sucesso!')
    }
    closeForm()
    lookup.invalidate()
    await lookup.fetchLookups()
  } catch {
    toast.error('Erro ao salvar.')
  }
}

async function deleteItem(item) {
  const endpoint = endpointMap[activeTab.value]
  if (!endpoint) return
  if (!confirm(`Remover "${item.name}"?`)) return
  try {
    await api.delete(`${endpoint}/${item.id}`)
    toast.success('Removido.')
    lookup.invalidate()
    await lookup.fetchLookups()
  } catch {
    toast.error('Erro ao remover. Verifique se o item não está em uso.')
  }
}

async function saveSetting(s) {
  try {
    await api.put(`/lookups/settings/${s.key}`, { value: s.value })
    toast.success('Configuração salva!')
  } catch {
    toast.error('Erro ao salvar configuração.')
  }
}

function listForTab(tab) {
  const map = {
    participants: lookup.participants,
    products: lookup.products,
    areas: lookup.areas,
    eventSources: lookup.eventSources,
    eventTypes: lookup.eventTypes,
    committeeStatuses: lookup.committeeStatuses,
    actionStatuses: lookup.actionStatuses,
  }
  return map[tab] || []
}

const hasCrud = (tab) => tab !== 'products' && tab !== 'settings'
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Cadastros Auxiliares</h1>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >{{ tab.label }}</button>
    </div>

    <!-- Settings tab -->
    <template v-if="activeTab === 'settings'">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Configurações do Comitê</h2>
        </div>
        <div class="stack">
          <div v-for="s in settings" :key="s.key" class="field">
            <label>{{ s.label || s.key }}</label>
            <div class="row center" style="gap:.5rem">
              <input v-model="s.value" type="text" />
              <button class="btn small primary" @click="saveSetting(s)">Salvar</button>
            </div>
          </div>
          <EmptyState v-if="!settings.length" title="Nenhuma configuração encontrada" />
        </div>
      </div>
    </template>

    <!-- Products tab (read only) -->
    <template v-else-if="activeTab === 'products'">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Nome</th><th>Plataforma</th><th>Segmento</th><th>PO</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in lookup.products" :key="p.id">
              <td style="font-weight:600">{{ p.name }}</td>
              <td><span class="badge badge-info">{{ p.platform || '—' }}</span></td>
              <td class="small">{{ p.segment || '—' }}</td>
              <td class="small">{{ p.owner?.name || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Generic CRUD tabs -->
    <template v-else>
      <div class="page-header" style="margin-top:0; margin-bottom:.75rem">
        <span class="small text-muted">{{ listForTab(activeTab).length }} registro(s)</span>
        <button v-if="hasCrud(activeTab)" class="btn primary small" @click="openNew(activeTab)">+ Novo</button>
      </div>

      <EmptyState v-if="!listForTab(activeTab).length" title="Nenhum registro encontrado" />

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th v-if="activeTab === 'participants'">Função</th>
              <th>Ativo</th>
              <th v-if="hasCrud(activeTab)"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in listForTab(activeTab)" :key="item.id">
              <td style="font-weight:500">{{ item.name }}</td>
              <td v-if="activeTab === 'participants'" class="small">{{ item.role }}</td>
              <td>
                <span class="badge" :class="item.active !== false ? 'badge-success' : 'badge-neutral'">
                  {{ item.active !== false ? 'Sim' : 'Não' }}
                </span>
              </td>
              <td v-if="hasCrud(activeTab)">
                <div class="row" style="gap:.25rem">
                  <button class="btn small ghost" @click="openEdit(item)">Editar</button>
                  <button class="btn small ghost" style="color:var(--danger)" @click="deleteItem(item)">✕</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Modal -->
    <div v-if="showForm" class="modal-backdrop" @click.self="closeForm">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingItem ? 'Editar' : 'Novo' }} registro</h2>
          <button class="modal-close" @click="closeForm">✕</button>
        </div>
        <div class="modal-body stack">
          <div class="field">
            <label>Nome</label>
            <input v-model="formData.name" type="text" placeholder="Nome" />
          </div>
          <div v-if="activeTab === 'participants'" class="field">
            <label>Função</label>
            <input v-model="formData.role" type="text" placeholder="Ex: PO, Suporte, CS..." />
          </div>
          <label style="display:flex; align-items:center; gap:.5rem; text-transform:none; font-size:.875rem; font-weight:500">
            <input type="checkbox" v-model="formData.active" style="width:auto" />
            Ativo
          </label>
        </div>
        <div class="modal-footer">
          <button class="btn ghost" @click="closeForm">Cancelar</button>
          <button class="btn primary" @click="save">Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>
