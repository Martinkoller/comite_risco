<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { checklistService } from '@/services/checklistService'
import { useToast } from '@/composables/useToast'
import ChecklistForm from '@/components/checklist/ChecklistForm.vue'
import PortalManageModal from '@/components/checklist/PortalManageModal.vue'

const router = useRouter()
const { show: showToast } = useToast()

const checklists  = ref([])
const loading     = ref(true)
const saving      = ref(false)
const showNew     = ref(false)
const showPortals = ref(false)

async function loadList() {
  loading.value = true
  try {
    const res = await checklistService.getAll()
    checklists.value = res?.data ?? res ?? []
  } finally {
    loading.value = false
  }
}

onMounted(loadList)

async function createChecklist(form) {
  saving.value = true
  try {
    const res = await checklistService.create(form)
    const created = res?.data ?? res
    showNew.value = false
    showToast('Sessão criada!', 'success')
    router.push(`/checklist/${created.id}`)
  } catch (e) {
    showToast(e?.error || 'Erro ao criar checklist', 'error')
  } finally {
    saving.value = false
  }
}

function openChecklist(cl) {
  router.push(`/checklist/${cl.id}`)
}

const summary = computed(() => {
  const total     = checklists.value.length
  const done      = checklists.value.filter(c => c.status === 'Concluído').length
  const running   = checklists.value.filter(c => c.status === 'Em execução').length
  const findings  = checklists.value.reduce((acc, c) => acc + (c._count?.findings ?? c.foundFindings ?? 0), 0)
  return { total, done, running, findings }
})

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function statusClass(s) {
  if (s === 'Concluído')   return 'badge-success'
  if (s === 'Em execução') return 'badge-warning'
  return 'badge-neutral'
}

function progressPct(cl) {
  const checked = cl.checkedPortals ?? 0
  const total   = cl.totalPortals ?? cl._count?.portalEntries ?? 1
  if (!total) return 0
  return Math.round((checked / total) * 100)
}
</script>

<template>
  <div class="cld-page">

    <!-- ── Header ────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">CheckList de Monitoramento</h1>
        <p class="page-subtitle">Varredura semanal de portais · Terça-feira 08:00</p>
      </div>
      <div style="display:flex; gap:.5rem">
        <button class="btn" @click="showPortals = true">⚙️ Portais</button>
        <button class="btn primary" @click="showNew = true">+ Nova sessão</button>
      </div>
    </div>

    <!-- ── Cards de resumo ───────────────────────────── -->
    <div class="cld-stats" v-if="!loading && checklists.length">
      <div class="cld-stat-card">
        <div class="cld-stat-val">{{ summary.total }}</div>
        <div class="cld-stat-lbl">Sessões totais</div>
      </div>
      <div class="cld-stat-card success">
        <div class="cld-stat-val">{{ summary.done }}</div>
        <div class="cld-stat-lbl">Concluídas</div>
      </div>
      <div class="cld-stat-card warning">
        <div class="cld-stat-val">{{ summary.running }}</div>
        <div class="cld-stat-lbl">Em execução</div>
      </div>
      <div class="cld-stat-card info">
        <div class="cld-stat-val">{{ summary.findings }}</div>
        <div class="cld-stat-lbl">Achados registrados</div>
      </div>
    </div>

    <!-- ── Carregando ────────────────────────────────── -->
    <div v-if="loading" class="cld-loading">
      <div class="cld-spinner"></div>
      <p>Carregando sessões...</p>
    </div>

    <!-- ── Vazio ─────────────────────────────────────── -->
    <div v-else-if="!checklists.length" class="cld-empty">
      <div class="cld-empty-icon">☑️</div>
      <h2 class="cld-empty-title">Nenhuma sessão de CheckList</h2>
      <p class="cld-empty-desc">Crie a primeira sessão para começar o monitoramento semanal.</p>
      <button class="btn primary" @click="showNew = true">+ Nova sessão</button>
    </div>

    <!-- ── Grade de checklists ───────────────────────── -->
    <div v-else class="cld-grid">
      <div
        v-for="cl in checklists"
        :key="cl.id"
        class="cld-card"
        :class="{ done: cl.status === 'Concluído', running: cl.status === 'Em execução' }"
        @click="openChecklist(cl)"
      >
        <div class="cld-card-top">
          <div class="cld-card-week">Semana {{ cl.weekReference }}</div>
          <span :class="`badge ${statusClass(cl.status)}`">{{ cl.status }}</span>
        </div>

        <div class="cld-card-date">
          📅 {{ fmtDate(cl.checkDate) }}
          <span v-if="cl.executedBy" style="color:var(--muted)"> · {{ cl.executedBy }}</span>
        </div>

        <!-- Barra de progresso -->
        <div class="cld-card-progress">
          <div class="cld-prog-bar">
            <div class="cld-prog-fill" :style="{ width: progressPct(cl) + '%' }" />
          </div>
          <span class="cld-prog-pct">{{ progressPct(cl) }}%</span>
        </div>

        <div class="cld-card-counts">
          <span class="cld-count">
            <span class="cld-count-icon">✅</span>
            {{ cl.checkedPortals ?? 0 }} / {{ cl.totalPortals ?? cl._count?.portalEntries ?? 0 }} portais
          </span>
          <span v-if="(cl._count?.findings ?? cl.foundFindings ?? 0) > 0" class="cld-count finding">
            <span class="cld-count-icon">🔍</span>
            {{ cl._count?.findings ?? cl.foundFindings }} achado{{ (cl._count?.findings ?? cl.foundFindings) > 1 ? 's' : '' }}
          </span>
        </div>

        <div v-if="cl.generalNotes" class="cld-card-notes">
          📝 {{ cl.generalNotes }}
        </div>

        <div class="cld-card-action">
          <span v-if="cl.status === 'Concluído'" class="cld-action-view">Ver resumo →</span>
          <span v-else class="cld-action-continue">Continuar →</span>
        </div>
      </div>
    </div>

    <!-- ── Modais ─────────────────────────────────────── -->
    <ChecklistForm
      v-if="showNew"
      :saving="saving"
      @save="createChecklist"
      @cancel="showNew = false"
    />

    <PortalManageModal
      v-if="showPortals"
      @close="showPortals = false"
    />

  </div>
</template>

<style scoped>
.cld-page { padding-bottom: 3rem; }

/* Stats */
.cld-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: .75rem;
  margin-bottom: 1.5rem;
}
.cld-stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: .85rem 1rem;
  text-align: center;
}
.cld-stat-card.success { border-color: rgba(16,185,129,.3); background: #f0fdf4; }
.cld-stat-card.warning { border-color: rgba(245,158,11,.3); background: #fffbeb; }
.cld-stat-card.info    { border-color: rgba(37,99,235,.2);  background: #eff6ff; }
[data-theme="dark"] .cld-stat-card.success { background: rgba(16,185,129,.08); }
[data-theme="dark"] .cld-stat-card.warning { background: rgba(245,158,11,.08); }
[data-theme="dark"] .cld-stat-card.info    { background: rgba(37,99,235,.08);  }
.cld-stat-val { font-size: 2rem; font-weight: 800; color: var(--primary); line-height: 1; }
.cld-stat-lbl { font-size: .72rem; color: var(--muted); margin-top: .2rem; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }

/* Loading / Empty */
.cld-loading {
  display: flex; flex-direction: column; align-items: center;
  padding: 5rem 0; color: var(--muted); gap: .75rem;
}
.cld-spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.cld-empty {
  display: flex; flex-direction: column; align-items: center;
  padding: 5rem 0; gap: .75rem; text-align: center;
}
.cld-empty-icon { font-size: 3rem; }
.cld-empty-title { font-size: 1.25rem; font-weight: 700; margin: 0; }
.cld-empty-desc { font-size: .9rem; color: var(--muted); margin: 0; max-width: 340px; }

/* Grade de cards */
.cld-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
.cld-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  cursor: pointer;
  display: grid;
  gap: .55rem;
  transition: box-shadow .15s, border-color .15s, transform .1s;
}
.cld-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,.09);
  border-color: var(--primary);
  transform: translateY(-1px);
}
.cld-card.done  { border-left: 4px solid #10b981; }
.cld-card.running { border-left: 4px solid #f59e0b; }

.cld-card-top {
  display: flex; align-items: center;
  justify-content: space-between; gap: .5rem;
}
.cld-card-week { font-size: 1rem; font-weight: 800; color: var(--text); }
.cld-card-date { font-size: .8rem; color: var(--muted); }

.cld-card-progress {
  display: flex; align-items: center; gap: .6rem;
}
.cld-prog-bar {
  flex: 1; height: 7px;
  background: var(--border); border-radius: 4px; overflow: hidden;
}
.cld-prog-fill {
  height: 100%; background: var(--primary);
  border-radius: 4px; transition: width .4s;
}
.cld-prog-pct { font-size: .72rem; font-weight: 700; color: var(--primary); min-width: 30px; }

.cld-card-counts {
  display: flex; flex-wrap: wrap; gap: .5rem;
}
.cld-count {
  display: flex; align-items: center; gap: .25rem;
  font-size: .78rem; color: var(--muted); font-weight: 500;
}
.cld-count.finding { color: #f59e0b; font-weight: 700; }
.cld-count-icon { font-size: .75rem; }

.cld-card-notes {
  font-size: .78rem; color: var(--muted);
  background: var(--bg); border-radius: 6px;
  padding: .35rem .6rem;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cld-card-action {
  margin-top: .1rem;
  font-size: .78rem; font-weight: 700;
  color: var(--primary);
}
.cld-action-view { color: var(--muted); }

@media (max-width: 560px) {
  .cld-grid { grid-template-columns: 1fr; }
}
</style>
