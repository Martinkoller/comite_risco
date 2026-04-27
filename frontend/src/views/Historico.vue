<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { riskItemService } from '@/services/riskItemService'
import { useLookupStore } from '@/stores/lookupStore'
import { usePagination } from '@/composables/usePagination'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const lookup = useLookupStore()

const items = ref([])
const loading = ref(true)
const searchTerm = ref('')
const filterSeverity = ref('')
const filterProduct = ref('')

const CLOSED_STATUSES = ['Concluído', 'Sem ação', 'Cancelado']

onMounted(async () => {
  await lookup.fetchLookups()
  loading.value = true
  try {
    const res = await riskItemService.getAll()
    items.value = (res.data || []).filter((i) => CLOSED_STATUSES.includes(i.monitoringStatus))
  } finally {
    loading.value = false
  }
})

const filtered = computed(() => {
  let list = items.value
  if (filterSeverity.value) {
    list = list.filter((i) => {
      const c = i.committeeDecision?.finalSeverity?.code || i.preliminarySeverity?.code
      return c === filterSeverity.value
    })
  }
  if (filterProduct.value) {
    list = list.filter((i) =>
      (i.products || []).some((p) => String(p.productId) === filterProduct.value),
    )
  }
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase()
    list = list.filter(
      (i) => i.code?.toLowerCase().includes(term) || i.title?.toLowerCase().includes(term),
    )
  }
  return list
})

const { currentPage, totalPages, paginatedItems, nextPage, previousPage, goToPage } =
  usePagination(filtered, 15)

function sevBadge(item) {
  const c = item.committeeDecision?.finalSeverity?.code || item.preliminarySeverity?.code
  return c ? `badge-${c.toLowerCase()}` : 'badge-neutral'
}
function sevLabel(item) {
  return item.committeeDecision?.finalSeverity?.code || item.preliminarySeverity?.code || '—'
}
function statusBadge(status) {
  if (status === 'Concluído') return 'badge-success'
  if (status === 'Cancelado') return 'badge-danger'
  return 'badge-neutral'
}
function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('pt-BR') : '—'
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Histórico / Encerrados</h1>
        <p class="page-subtitle">Itens concluídos, sem ação ou cancelados · {{ filtered.length }} registro(s)</p>
      </div>
    </div>

    <div class="filters-bar">
      <input v-model="searchTerm" type="search" placeholder="Pesquisar..." style="flex:1; min-width:200px" />
      <select v-model="filterSeverity">
        <option value="">Todas as severidades</option>
        <option v-for="s in lookup.severities" :key="s.id" :value="s.code">{{ s.code }} – {{ s.name }}</option>
      </select>
      <select v-model="filterProduct">
        <option value="">Todos os produtos</option>
        <option v-for="p in lookup.products" :key="p.id" :value="String(p.id)">{{ p.name }}</option>
      </select>
      <button class="btn ghost small" @click="searchTerm=''; filterSeverity=''; filterProduct=''">Limpar</button>
    </div>

    <div v-if="loading" style="text-align:center; padding:3rem 0; color:var(--muted)">Carregando...</div>

    <template v-else>
      <EmptyState
        v-if="!filtered.length"
        title="Nenhum item encerrado encontrado"
        description="Itens concluídos, sem ação ou cancelados aparecem aqui."
      />
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Título</th>
              <th>Tipo</th>
              <th>Severidade</th>
              <th>Status</th>
              <th>Prazo Oficial</th>
              <th>Criado em</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginatedItems" :key="item.id">
              <td style="font-weight:700; color:var(--primary); white-space:nowrap">{{ item.code }}</td>
              <td>
                <div class="truncate" style="max-width:260px; font-weight:500" :title="item.title">{{ item.title }}</div>
                <div class="small text-muted">{{ item.eventSource?.name }}</div>
              </td>
              <td class="small">{{ item.eventType?.name }}</td>
              <td><span class="badge" :class="sevBadge(item)">{{ sevLabel(item) }}</span></td>
              <td><span class="badge" :class="statusBadge(item.monitoringStatus)">{{ item.monitoringStatus }}</span></td>
              <td class="small">{{ fmtDate(item.officialDeadline) }}</td>
              <td class="small">{{ fmtDate(item.createdAt) }}</td>
              <td>
                <button class="btn small" @click="router.push(`/risk-items/${item.id}`)">Ver</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button class="btn small" :disabled="currentPage === 1" @click="previousPage">‹ Ant</button>
        <button v-for="p in totalPages" :key="p" class="btn small" :class="{ primary: p === currentPage }" @click="goToPage(p)">{{ p }}</button>
        <button class="btn small" :disabled="currentPage === totalPages" @click="nextPage">Próx ›</button>
        <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
      </div>
    </template>
  </div>
</template>
