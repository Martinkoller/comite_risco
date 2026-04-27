<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { dashboardService } from '@/services/dashboardService'
import { checklistService } from '@/services/checklistService'
import { useToast } from '@/composables/useToast'
import ChecklistForm from '@/components/checklist/ChecklistForm.vue'
import DashboardStatCard from '@/components/dashboard/DashboardStatCard.vue'
import SeverityCard from '@/components/dashboard/SeverityCard.vue'
import CriticalItemsTable from '@/components/dashboard/CriticalItemsTable.vue'
import DecisionList from '@/components/dashboard/DecisionList.vue'
import DeadlineList from '@/components/dashboard/DeadlineList.vue'
import DelayedActionsList from '@/components/dashboard/DelayedActionsList.vue'
import ManagementSummaryCard from '@/components/dashboard/ManagementSummaryCard.vue'

const router = useRouter()
const { show: showToast } = useToast()

const showChecklistForm = ref(false)
const savingChecklist   = ref(false)

async function createChecklist(form) {
  savingChecklist.value = true
  try {
    const res = await checklistService.create(form)
    const created = res?.data ?? res
    showChecklistForm.value = false
    showToast('Sessão de checklist criada!', 'success')
    router.push(`/checklist/${created.id}`)
  } catch (e) {
    showToast(e?.error || 'Erro ao criar checklist', 'error')
  } finally {
    savingChecklist.value = false
  }
}

const loading = ref(true)
const summary = ref(null)
const criticalItems = ref([])
const upcomingDeadlines = ref([])
const recentDecisions = ref([])
const delayedActions = ref([])
const managementSummary = ref(null)

const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)

// Lista de anos disponíveis: do ano atual até 2020
const availableYears = computed(() => {
  const years = []
  for (let y = currentYear; y >= 2020; y--) years.push(y)
  return years
})

async function fetchAll() {
  loading.value = true
  const year = selectedYear.value
  try {
    const [s, c, u, d, da] = await Promise.allSettled([
      dashboardService.getSummary(year),
      dashboardService.getCriticalItems(year),
      dashboardService.getUpcomingDeadlines(year),
      dashboardService.getRecentDecisions(year),
      dashboardService.getDelayedActions(year),
    ])
    summary.value = s.status === 'fulfilled' ? (s.value?.data ?? s.value) : null
    criticalItems.value = c.status === 'fulfilled' ? (c.value?.data ?? c.value ?? []) : []
    upcomingDeadlines.value = u.status === 'fulfilled' ? (u.value?.data ?? u.value ?? []) : []
    recentDecisions.value = d.status === 'fulfilled' ? (d.value?.data ?? d.value ?? []) : []
    delayedActions.value = da.status === 'fulfilled' ? (da.value?.data ?? da.value ?? []) : []

    try {
      const ms = await dashboardService.getManagementSummary(year)
      managementSummary.value = ms?.data ?? ms ?? null
    } catch {
      managementSummary.value = null
    }
  } finally {
    loading.value = false
  }
}

watch(selectedYear, fetchAll)
onMounted(fetchAll)

// ── Cards principais ──────────────────────────────────────
const statusCards = computed(() => {
  const b = summary.value?.byStatus || {}
  const total = summary.value?.total ?? summary.value?.totalItems ?? 0
  return [
    { label: 'Itens Identificados', value: total, color: 'var(--primary)', icon: '📋', accent: true },
    { label: 'Em Análise', value: b.emAnalise ?? b['Em análise pelos POs'] ?? 0, color: 'var(--info)', icon: '🔍' },
    { label: 'Aguardando Direção', value: b.aguardandoDirecao ?? b['Aguardando Direção'] ?? summary.value?.waitingForDirection ?? 0, color: 'var(--danger)', icon: '⏳' },
    { label: 'Em Execução', value: b.emExecucao ?? b['Em execução'] ?? 0, color: 'var(--warning)', icon: '⚙️' },
    { label: 'Em Monitoramento', value: b.emMonitoramento ?? b['Em monitoramento'] ?? 0, color: '#8b5cf6', icon: '📡' },
    { label: 'Concluídos', value: b.concluido ?? b['Concluído'] ?? 0, color: 'var(--success)', icon: '✅' },
  ]
})

const severityCards = computed(() => {
  const b = summary.value?.bySeverity || {}
  return [
    { code: 'P1', label: 'Crítico', value: b.P1 ?? 0, description: 'Impacto imediato ao negócio' },
    { code: 'P2', label: 'Alto', value: b.P2 ?? 0, description: 'Impacto relevante' },
    { code: 'P3', label: 'Médio', value: b.P3 ?? 0, description: 'Requer atenção' },
    { code: 'P4', label: 'Informativo', value: b.P4 ?? 0, description: 'Baixo impacto' },
  ]
})

const actionStats = computed(() => summary.value?.actionPlans || {})
const fastTrackCount = computed(() => summary.value?.fastTrack ?? 0)
</script>

<template>
  <div class="db-page">

    <!-- ── Topbar ─────────────────────────────────────── -->
    <header class="db-topbar">
      <div class="db-topbar-left">
        <div>
          <h1 class="db-topbar-title">Dashboard do Comitê</h1>
          <p class="db-topbar-sub">Comitê de Risco da Zucchetti – BU POS · Ano {{ selectedYear }}</p>
        </div>
      </div>
      <div class="db-topbar-actions">
        <div class="db-year-selector">
          <span class="db-week-label">Ano</span>
          <select v-model="selectedYear" class="db-week-select">
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
        <button class="btn" @click="fetchAll" :disabled="loading">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
          </svg>
          Atualizar dados
        </button>
        <button class="btn" @click="showChecklistForm = true">
          ☑️ Novo CheckList
        </button>
        <button class="btn primary" @click="router.push('/risk-items')">
          + Novo Item CR
        </button>
      </div>
    </header>

    <!-- ── Conteúdo ───────────────────────────────────── -->
    <div class="db-content">
      <div v-if="loading" class="db-global-loading">
        <div class="db-spinner"></div>
        <p>Carregando dashboard...</p>
      </div>

      <template v-else>

        <!-- ── Seção 1: Cards principais ─── -->
        <section class="db-section">
          <div class="db-stat-grid">
            <DashboardStatCard
              v-for="card in statusCards"
              :key="card.label"
              :label="card.label"
              :value="card.value"
              :color="card.color"
              :icon="card.icon"
              :accent="card.accent"
            />
          </div>
        </section>

        <!-- ── Seção 2: Severidade ────────── -->
        <section class="db-section">
          <div class="db-section-header">
            <h2 class="db-section-title">Distribuição por Severidade</h2>
            <div class="db-section-meta">
              <span v-if="fastTrackCount > 0" class="badge badge-fast-track">
                ⚡ {{ fastTrackCount }} Fast Track
              </span>
              <span v-if="actionStats.overdue > 0" class="badge badge-danger">
                {{ actionStats.overdue }} ações em atraso
              </span>
              <span v-if="actionStats.dueSoon > 0" class="badge badge-warning">
                {{ actionStats.dueSoon }} vencendo em breve
              </span>
            </div>
          </div>
          <div class="db-sev-grid">
            <SeverityCard
              v-for="sv in severityCards"
              :key="sv.code"
              :code="sv.code"
              :label="sv.label"
              :value="sv.value"
              :description="sv.description"
            />
          </div>
        </section>

        <!-- ── Seção 3: Tabela de itens críticos ── -->
        <section class="db-section">
          <div class="db-card">
            <div class="db-card-header">
              <div class="db-card-title-row">
                <span class="db-card-badge p1">P1</span>
                <h2 class="db-card-title">Itens Críticos</h2>
                <span class="db-card-count">{{ criticalItems.length }}</span>
              </div>
              <router-link to="/risk-items" class="link small">Ver todos →</router-link>
            </div>
            <CriticalItemsTable :items="criticalItems" />
          </div>
        </section>

        <!-- ── Seção 4+5: Decisões + Prazos ─── -->
        <section class="db-section db-two-col">

          <div class="db-card">
            <div class="db-card-header">
              <div class="db-card-title-row">
                <h2 class="db-card-title">📋 Últimas Decisões</h2>
                <span class="db-card-count">{{ recentDecisions.length }}</span>
              </div>
              <router-link to="/risk-items" class="link small">Ver todas →</router-link>
            </div>
            <DecisionList :decisions="recentDecisions.slice(0, 6)" />
          </div>

          <div class="db-card">
            <div class="db-card-header">
              <div class="db-card-title-row">
                <h2 class="db-card-title">⏰ Próximos Prazos</h2>
                <span class="db-card-count">{{ upcomingDeadlines.length }}</span>
              </div>
              <span class="db-topbar-sub" style="font-size:.75rem">7 dias</span>
            </div>
            <DeadlineList :items="upcomingDeadlines" />
          </div>

        </section>

        <!-- ── Seção 6+7: Ações em atraso + Reunião de Gestão ── -->
        <section class="db-section db-two-col">

          <div class="db-card">
            <div class="db-card-header">
              <div class="db-card-title-row">
                <h2 class="db-card-title">🚨 Ações em Atraso</h2>
                <span v-if="delayedActions.length" class="db-card-count danger">{{ delayedActions.length }}</span>
              </div>
            </div>
            <DelayedActionsList :items="delayedActions" />
          </div>

          <div class="db-card">
            <div class="db-card-header">
              <div class="db-card-title-row">
                <h2 class="db-card-title">🤝 Reunião de Gestão</h2>
              </div>
              <router-link to="/management-meetings" class="link small">Ver histórico →</router-link>
            </div>
            <ManagementSummaryCard :meeting="managementSummary" />
          </div>

        </section>

      </template>
    </div>

    <ChecklistForm
      v-if="showChecklistForm"
      :saving="savingChecklist"
      @save="createChecklist"
      @cancel="showChecklistForm = false"
    />
  </div>
</template>

<style scoped>
/* ── Page layout ──────────────────────────── */
.db-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* ── Topbar ───────────────────────────────── */
.db-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1.1rem 0 1rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1.5rem;
}
.db-topbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.db-topbar-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.15;
}
.db-topbar-sub {
  font-size: 0.82rem;
  color: var(--muted);
  margin: 0.1rem 0 0;
}
.db-topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.db-year-selector {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.3rem 0.65rem;
  background: var(--surface);
}
.db-week-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.db-week-select {
  border: none;
  background: transparent;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  padding: 0;
  width: auto;
  cursor: pointer;
}
.db-week-select:focus {
  outline: none;
  box-shadow: none;
}

/* ── Content ──────────────────────────────── */
.db-content {
  flex: 1;
  padding-bottom: 2.5rem;
}

/* ── Global loading ───────────────────────── */
.db-global-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 0;
  gap: 1rem;
  color: var(--muted);
}
.db-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Sections ─────────────────────────────── */
.db-section {
  margin-bottom: 1.25rem;
}
.db-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.db-section-title {
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  margin: 0;
}
.db-section-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.db-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* ── Stat grid ────────────────────────────── */
.db-stat-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
}

/* ── Severity grid ────────────────────────── */
.db-sev-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

/* ── Cards ────────────────────────────────── */
.db-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  background: var(--surface);
}
.db-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}
.db-card-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.db-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
}
.db-card-count {
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--border);
  color: var(--muted);
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
}
.db-card-count.danger {
  background: var(--p1-bg);
  color: var(--p1);
  border: 1px solid var(--p1-border);
}
.db-card-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}
.db-card-badge.p1 {
  background: var(--p1-bg);
  color: var(--p1);
  border: 1px solid var(--p1-border);
}

/* ── Responsive ───────────────────────────── */
@media (max-width: 1200px) {
  .db-stat-grid { grid-template-columns: repeat(3, 1fr); }
  .db-sev-grid  { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 860px) {
  .db-two-col { grid-template-columns: 1fr; }
  .db-stat-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 560px) {
  .db-stat-grid { grid-template-columns: 1fr 1fr; }
  .db-sev-grid  { grid-template-columns: 1fr 1fr; }
  .db-topbar { flex-direction: column; align-items: flex-start; }
  .db-topbar-actions { width: 100%; justify-content: flex-end; }
}
</style>
