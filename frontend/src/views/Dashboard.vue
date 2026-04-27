<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { dashboardService } from '@/services/dashboardService'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const loading = ref(true)
const summary = ref(null)
const criticalItems = ref([])
const upcomingDeadlines = ref([])
const pendingDirection = ref([])

onMounted(async () => {
  try {
    const [s, c, u, p] = await Promise.all([
      dashboardService.getSummary(),
      dashboardService.getCriticalItems(),
      dashboardService.getUpcomingDeadlines(),
      dashboardService.getPendingDirection(),
    ])
    summary.value = s.data
    criticalItems.value = c.data || []
    upcomingDeadlines.value = u.data || []
    pendingDirection.value = p.data || []
  } finally {
    loading.value = false
  }
})

const statusCards = computed(() => {
  if (!summary.value) return []
  const b = summary.value.byStatus || {}
  return [
    { label: 'Total de Itens', value: summary.value.totalItems ?? 0, color: '#2563eb' },
    { label: 'Em Análise', value: b['Em análise pelos POs'] ?? 0, color: '#8b5cf6' },
    { label: 'Em Execução', value: b['Em execução'] ?? 0, color: '#f97316' },
    { label: 'Aguardando Direção', value: b['Aguardando Direção'] ?? 0, color: '#ef4444' },
    { label: 'Em Monitoramento', value: b['Em monitoramento'] ?? 0, color: '#eab308' },
    { label: 'Concluídos', value: b['Concluído'] ?? 0, color: '#10b981' },
  ]
})

const severityCards = computed(() => {
  const b = summary.value?.bySeverity || {}
  return [
    { code: 'P1', label: 'Crítico', value: b.P1 ?? 0, cls: 'badge-p1' },
    { code: 'P2', label: 'Alto', value: b.P2 ?? 0, cls: 'badge-p2' },
    { code: 'P3', label: 'Médio', value: b.P3 ?? 0, cls: 'badge-p3' },
    { code: 'P4', label: 'Informativo', value: b.P4 ?? 0, cls: 'badge-p4' },
  ]
})

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}
function sevBadge(item) {
  const c = item.committeeDecision?.finalSeverity?.code || item.preliminarySeverity?.code
  return c ? `badge-${c.toLowerCase()}` : 'badge-neutral'
}
function sevLabel(item) {
  return item.committeeDecision?.finalSeverity?.code || item.preliminarySeverity?.code || '—'
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Visão executiva do Comitê de Risco – BU POS</p>
      </div>
      <button class="btn primary" @click="router.push('/risk-items')">+ Novo Item</button>
    </div>

    <div v-if="loading" style="text-align:center; padding:3rem 0; color:var(--muted)">Carregando...</div>

    <template v-else>
      <!-- Cards de status -->
      <div class="stat-grid" style="margin-bottom:1.25rem">
        <div v-for="card in statusCards" :key="card.label" class="stat-card">
          <span class="stat-label">{{ card.label }}</span>
          <span class="stat-value" :style="{ color: card.color }">{{ card.value }}</span>
        </div>
      </div>

      <!-- Severidade -->
      <div class="card" style="margin-bottom:1.25rem">
        <div class="card-header">
          <h2 class="card-title">Distribuição por Severidade</h2>
        </div>
        <div class="row wrap" style="gap:1.5rem">
          <div v-for="sv in severityCards" :key="sv.code" class="row center" style="gap:.75rem; flex:1; min-width:120px">
            <span class="badge" :class="sv.cls" style="font-size:.9rem; padding:.35rem .8rem">{{ sv.code }}</span>
            <div>
              <div style="font-size:1.75rem; font-weight:800; line-height:1">{{ sv.value }}</div>
              <div class="small text-muted">{{ sv.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.25rem">
        <!-- Itens críticos P1 -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">⚡ Itens Críticos (P1)</h2>
            <router-link to="/risk-items" class="link small">Ver todos</router-link>
          </div>
          <EmptyState v-if="!criticalItems.length" title="Nenhum item crítico" description="Ótimo! Sem itens P1 no momento." />
          <div v-else class="stack" style="gap:.5rem">
            <div
              v-for="item in criticalItems.slice(0,5)"
              :key="item.id"
              class="row center between"
              style="padding:.6rem .75rem; background:var(--p1-bg); border:1px solid var(--p1-border); border-radius:8px; cursor:pointer"
              @click="router.push(`/risk-items/${item.id}`)"
            >
              <div>
                <div style="font-size:.75rem; font-weight:700; color:var(--p1)">{{ item.code }}</div>
                <div class="small truncate" style="max-width:200px">{{ item.title }}</div>
              </div>
              <span v-if="item.isFastTrack" class="badge badge-fast-track">⚡ Fast Track</span>
            </div>
          </div>
        </div>

        <!-- Aguardando Direção -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">📋 Aguardando Direção</h2>
            <router-link to="/management-meetings" class="link small">Reuniões</router-link>
          </div>
          <EmptyState v-if="!pendingDirection.length" title="Nenhum pendente" description="Todos os itens foram revisados pela Direção." />
          <div v-else class="stack" style="gap:.5rem">
            <div
              v-for="item in pendingDirection.slice(0,5)"
              :key="item.id"
              class="row center between"
              style="padding:.6rem .75rem; border:1px solid var(--border); border-radius:8px; cursor:pointer"
              @click="router.push(`/risk-items/${item.id}`)"
            >
              <div>
                <div style="font-size:.75rem; font-weight:700; color:var(--primary)">{{ item.code }}</div>
                <div class="small truncate" style="max-width:400px">{{ item.title }}</div>
              </div>
              <span class="badge" :class="sevBadge(item)">{{ sevLabel(item) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Próximos prazos -->
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">⏰ Próximos Prazos (7 dias)</h2>
        </div>
        <EmptyState v-if="!upcomingDeadlines.length" title="Nenhum prazo nos próximos 7 dias" />
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr><th>Código</th><th>Título</th><th>Prazo Oficial</th><th>Severidade</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr
                v-for="item in upcomingDeadlines"
                :key="item.id"
                style="cursor:pointer"
                @click="router.push(`/risk-items/${item.id}`)"
              >
                <td><span style="font-weight:700; color:var(--primary)">{{ item.code }}</span></td>
                <td>{{ item.title }}</td>
                <td>{{ fmtDate(item.officialDeadline) }}</td>
                <td><span class="badge" :class="sevBadge(item)">{{ sevLabel(item) }}</span></td>
                <td><span class="badge badge-neutral">{{ item.monitoringStatus }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
