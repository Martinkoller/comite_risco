<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { riskItemService } from '@/services/riskItemService'
import { useLookupStore } from '@/stores/lookupStore'
import { usePagination } from '@/composables/usePagination'
import { useToast } from '@/composables/useToast'
import EmptyState from '@/components/EmptyState.vue'
import RiskItemForm from '@/components/RiskItemForm.vue'

const router = useRouter()
const lookup = useLookupStore()
const toast = useToast()

const items = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingItem = ref(null)

const searchTerm = ref('')
const filterStatus = ref('')
const filterFastTrack = ref('')

onMounted(async () => {
  await lookup.fetchLookups()
  await loadItems()
})

async function loadItems() {
  loading.value = true
  try {
    const res = await riskItemService.getAll()
    items.value = res.data || []
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  let list = items.value
  if (filterStatus.value) list = list.filter((i) => i.monitoringStatus === filterStatus.value)
  if (filterFastTrack.value === 'true') list = list.filter((i) => i.isFastTrack)
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase()
    list = list.filter(
      (i) =>
        i.code?.toLowerCase().includes(term) ||
        i.title?.toLowerCase().includes(term) ||
        i.summary?.toLowerCase().includes(term),
    )
  }
  return list
})

const { currentPage, totalPages, paginatedItems, nextPage, previousPage, goToPage } =
  usePagination(filtered, 15)

function openNew() { editingItem.value = null; showForm.value = true }
function openEdit(item) { editingItem.value = item; showForm.value = true }
function closeForm() { showForm.value = false; editingItem.value = null }

async function onSaved() {
  const wasEdit = !!editingItem.value
  closeForm()
  await loadItems()
  toast.success(wasEdit ? 'Item atualizado!' : 'Item criado com sucesso!')
}

async function deleteItem(item) {
  if (!confirm(`Remover o item ${item.code}? Esta ação não pode ser desfeita.`)) return
  try {
    await riskItemService.delete(item.id)
    await loadItems()
    toast.success('Item removido.')
  } catch {
    toast.error('Erro ao remover o item.')
  }
}

function sevBadge(item) {
  const c = item.committeeDecision?.finalSeverity?.code || item.preliminarySeverity?.code
  return c ? `badge-${c.toLowerCase()}` : 'badge-neutral'
}
function sevLabel(item) {
  return item.committeeDecision?.finalSeverity?.code || item.preliminarySeverity?.code || '—'
}
function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Monitoramento de Itens</h1>
        <p class="page-subtitle">{{ filtered.length }} item(ns) encontrado(s)</p>
      </div>
      <button class="btn primary" @click="openNew">+ Novo Item (CR)</button>
    </div>

    <!-- Filtros -->
    <div class="filters-bar">
      <input v-model="searchTerm" type="search" placeholder="Pesquisar por código, título, resumo..." style="flex:1; min-width:220px" />
      <select v-model="filterStatus">
        <option value="">Todos os status</option>
        <option v-for="s in lookup.committeeStatuses" :key="s.id" :value="s.name">{{ s.name }}</option>
      </select>
      <select v-model="filterFastTrack">
        <option value="">Todos</option>
        <option value="true">⚡ Fast Track</option>
      </select>
      <button class="btn ghost small" @click="searchTerm=''; filterStatus=''; filterFastTrack=''">Limpar</button>
    </div>

    <div v-if="loading" style="text-align:center; padding:3rem 0; color:var(--muted)">Carregando...</div>

    <template v-else>
      <EmptyState
        v-if="!filtered.length"
        title="Nenhum item encontrado"
        description="Tente ajustar os filtros ou crie um novo item de monitoramento."
      />
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Título</th>
              <th>Tipo / Fonte</th>
              <th>Severidade</th>
              <th>Status</th>
              <th>Prazo Oficial</th>
              <th>Produtos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedItems" :key="item.id">
              <td style="white-space:nowrap">
                <span
                  style="font-weight:700; color:var(--primary); cursor:pointer"
                  @click="router.push(`/risk-items/${item.id}`)"
                >{{ item.code }}</span>
                <span v-if="item.isFastTrack" class="badge badge-fast-track" style="margin-left:.35rem; font-size:.65rem">⚡FT</span>
              </td>
              <td>
                <div
                  class="truncate"
                  style="max-width:260px; cursor:pointer; font-weight:500"
                  :title="item.title"
                  @click="router.push(`/risk-items/${item.id}`)"
                >{{ item.title }}</div>
                <div class="small text-muted">{{ item.eventType?.name }}</div>
              </td>
              <td class="small">{{ item.eventSource?.name }}</td>
              <td><span class="badge" :class="sevBadge(item)">{{ sevLabel(item) }}</span></td>
              <td><span class="badge badge-neutral" style="font-size:.7rem">{{ item.monitoringStatus }}</span></td>
              <td class="small" style="white-space:nowrap">{{ fmtDate(item.officialDeadline) }}</td>
              <td>
                <div class="row wrap" style="gap:.2rem">
                  <span
                    v-for="p in (item.products || []).slice(0, 3)"
                    :key="p.productId"
                    class="badge badge-info"
                    style="font-size:.65rem"
                  >{{ p.product?.name }}</span>
                  <span v-if="(item.products || []).length > 3" class="small text-muted">
                    +{{ item.products.length - 3 }}
                  </span>
                </div>
              </td>
              <td>
                <div class="row" style="gap:.2rem; white-space:nowrap">
                  <button class="btn small" @click="router.push(`/risk-items/${item.id}`)">Ver</button>
                  <button class="btn small ghost" @click="openEdit(item)">Editar</button>
                  <button class="btn small ghost" style="color:var(--danger)" @click="deleteItem(item)">✕</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button class="btn small" :disabled="currentPage === 1" @click="previousPage">‹ Ant</button>
        <button
          v-for="p in Math.min(totalPages, 7)"
          :key="p"
          class="btn small"
          :class="{ primary: p === currentPage }"
          @click="goToPage(p)"
        >{{ p }}</button>
        <button class="btn small" :disabled="currentPage === totalPages" @click="nextPage">Próx ›</button>
        <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
      </div>
    </template>

    <!-- Modal formulário -->
    <div v-if="showForm" class="modal-backdrop" @click.self="closeForm">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingItem ? `Editar ${editingItem.code}` : 'Novo Item de Risco' }}</h2>
          <button class="modal-close" @click="closeForm">✕</button>
        </div>
        <div class="modal-body">
          <RiskItemForm :item="editingItem" @saved="onSaved" @cancel="closeForm" />
        </div>
      </div>
    </div>
  </div>
</template>
