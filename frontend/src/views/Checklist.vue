<script setup>
import { ref, computed, onMounted } from 'vue'
import { checklistService } from '@/services/checklistService'
import { useToast } from '@/composables/useToast'
import ChecklistForm from '@/components/checklist/ChecklistForm.vue'
import FindingForm from '@/components/checklist/FindingForm.vue'
import PortalManageModal from '@/components/checklist/PortalManageModal.vue'
import CRFromFindingModal from '@/components/checklist/CRFromFindingModal.vue'
import EmptyState from '@/components/EmptyState.vue'

const { show: showToast } = useToast()

// ── Estado global ─────────────────────────────────────────
const checklists    = ref([])
const active        = ref(null)   // checklist selecionado (com detalhes)
const loadingList   = ref(true)
const loadingDetail = ref(false)
const saving        = ref(false)

// ── Modais ────────────────────────────────────────────────
const showNewChecklist  = ref(false)
const showPortalManage  = ref(false)
const showFindingForm   = ref(false)
const editFinding       = ref(null)
const findingPortalEntry= ref(null)
const showCRModal       = ref(false)
const crFinding         = ref(null)   // finding que originou o CR
const finalizingId      = ref(null)   // id do checklist em processo de finalização

// ── Carrega lista ─────────────────────────────────────────
async function loadList() {
  loadingList.value = true
  try {
    const res = await checklistService.getAll()
    checklists.value = res?.data ?? res ?? []
  } finally {
    loadingList.value = false
  }
}

async function selectChecklist(cl) {
  if (active.value?.id === cl.id) return
  loadingDetail.value = true
  active.value = null
  try {
    const res = await checklistService.getById(cl.id)
    active.value = res?.data ?? res
  } finally {
    loadingDetail.value = false
  }
}

onMounted(async () => {
  await loadList()
  if (checklists.value.length) selectChecklist(checklists.value[0])
})

// ── Criar checklist ───────────────────────────────────────
async function createChecklist(form) {
  saving.value = true
  try {
    const res = await checklistService.create(form)
    const created = res?.data ?? res
    showNewChecklist.value = false
    await loadList()
    await selectChecklist(created)
    showToast('Sessão de checklist criada!', 'success')
  } catch (e) {
    showToast(e?.error || 'Erro ao criar checklist', 'error')
  } finally {
    saving.value = false
  }
}

// ── Check de portal ───────────────────────────────────────
async function toggleCheck(entry) {
  const newChecked = !entry.checked
  // Otimista
  entry.checked = newChecked
  if (!newChecked) entry.checkedAt = null
  try {
    const res = await checklistService.checkEntry(entry.id, {
      checked: newChecked,
      hasNews: entry.hasNews,
      notes: entry.notes,
    })
    const updated = res?.data ?? res
    Object.assign(entry, updated)
    // Atualiza contadores do header
    await refreshCounters()
  } catch {
    entry.checked = !newChecked // reverte
    showToast('Erro ao atualizar check', 'error')
  }
}

async function saveEntryNote(entry) {
  try {
    await checklistService.checkEntry(entry.id, {
      checked: entry.checked,
      hasNews: entry.hasNews,
      notes: entry.notes,
    })
    await refreshCounters()
  } catch {
    showToast('Erro ao salvar observação', 'error')
  }
}

async function refreshCounters() {
  if (!active.value) return
  const res = await checklistService.getById(active.value.id)
  const fresh = res?.data ?? res
  active.value.checkedPortals = fresh.checkedPortals
  active.value.totalPortals   = fresh.totalPortals
  active.value.foundFindings  = fresh.foundFindings
  active.value.status         = fresh.status
  // Atualiza a lista lateral
  const idx = checklists.value.findIndex(c => c.id === active.value.id)
  if (idx >= 0) {
    checklists.value[idx].checkedPortals = fresh.checkedPortals
    checklists.value[idx].foundFindings  = fresh.foundFindings
    checklists.value[idx].status         = fresh.status
  }
}

// ── Findings ──────────────────────────────────────────────
function openNewFinding(entry) {
  editFinding.value = null
  findingPortalEntry.value = entry
  showFindingForm.value = true
}

function openEditFinding(finding, entry) {
  editFinding.value = finding
  findingPortalEntry.value = entry
  showFindingForm.value = true
}

async function saveFinding(formData) {
  saving.value = true
  try {
    if (editFinding.value) {
      await checklistService.updateFinding(editFinding.value.id, formData)
    } else {
      await checklistService.createFinding({
        ...formData,
        checklistId: active.value.id,
        portalEntryId: findingPortalEntry.value.id,
      })
    }
    const msg = editFinding.value ? 'Achado atualizado' : 'Achado registrado!'
    showFindingForm.value = false
    editFinding.value = null
    // Recarrega detalhe completo
    const res = await checklistService.getById(active.value.id)
    active.value = res?.data ?? res
    // Atualiza contadores na lista lateral
    const idx = checklists.value.findIndex(c => c.id === active.value.id)
    if (idx >= 0) {
      checklists.value[idx].foundFindings = active.value.foundFindings
      checklists.value[idx].status        = active.value.status
    }
    showToast(msg, 'success')
  } catch (e) {
    console.error('saveFinding error:', e)
    showToast(e?.error || e?.message || 'Erro ao salvar achado', 'error')
  } finally {
    saving.value = false
  }
}

async function deleteFinding(finding) {
  if (!confirm(`Remover achado "${finding.title}"?`)) return
  try {
    await checklistService.deleteFinding(finding.id)
    const res = await checklistService.getById(active.value.id)
    active.value = res?.data ?? res
    await refreshCounters()
    showToast('Achado removido', 'success')
  } catch {
    showToast('Erro ao remover', 'error')
  }
}

// ── Abrir CR inline a partir de um achado ─────────────────
function openCRModal(finding) {
  crFinding.value = finding
  showCRModal.value = true
}

async function onCRSaved(newRiskItem) {
  showCRModal.value = false
  // Vincula o CR ao achado
  try {
    await checklistService.linkRiskItem(crFinding.value.id, newRiskItem.id)
  } catch (e) {
    console.error('linkRiskItem error:', e)
  }
  crFinding.value = null
  // Recarrega
  const res = await checklistService.getById(active.value.id)
  active.value = res?.data ?? res
  const idx = checklists.value.findIndex(c => c.id === active.value.id)
  if (idx >= 0) checklists.value[idx].foundFindings = active.value.foundFindings
  showToast('CR criado e vinculado ao achado!', 'success')
}

// ── Finalizar checklist ───────────────────────────────────
const pendingPortals = computed(() => {
  if (!active.value?.portalEntries) return []
  return active.value.portalEntries.filter(e => !e.checked)
})

const canFinalize = computed(() =>
  active.value &&
  active.value.status !== 'Concluído' &&
  pendingPortals.value.length === 0
)

async function finalizeChecklist() {
  if (!canFinalize.value) return
  if (!confirm('Confirmar finalização do checklist da semana ' + active.value.weekReference + '?\n\nApós finalizado, o status será marcado como Concluído.')) return

  finalizingId.value = active.value.id
  try {
    await checklistService.update(active.value.id, { status: 'Concluído' })
    const res = await checklistService.getById(active.value.id)
    active.value = res?.data ?? res
    const idx = checklists.value.findIndex(c => c.id === active.value.id)
    if (idx >= 0) checklists.value[idx].status = 'Concluído'
    showToast('Checklist finalizado com sucesso!', 'success')
  } catch (e) {
    showToast(e?.error || 'Erro ao finalizar', 'error')
  } finally {
    finalizingId.value = null
  }
}

// ── Computed ──────────────────────────────────────────────
const progressPct = computed(() => {
  if (!active.value?.totalPortals) return 0
  return Math.round((active.value.checkedPortals / active.value.totalPortals) * 100)
})

const allFindings = computed(() => {
  if (!active.value) return []
  return active.value.findings || []
})

// ── Helpers ───────────────────────────────────────────────
function fmtDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function statusClass(s) {
  if (s === 'Concluído') return 'badge-success'
  if (s === 'Em execução') return 'badge-warning'
  return 'badge-neutral'
}

function sevClass(s) {
  if (!s) return 'badge-neutral'
  return `badge-${s.toLowerCase()}`
}

function findingStatusClass(s) {
  if (s === 'CR Aberto') return 'badge-info'
  if (s === 'Descartado') return 'badge-neutral'
  return 'badge-warning'
}

async function afterPortalManage() {
  showPortalManage.value = false
  // Se há um checklist aberto, recarrega
  if (active.value) {
    const res = await checklistService.getById(active.value.id)
    active.value = res?.data ?? res
  }
}
</script>

<template>
  <div class="cl-page">

    <!-- ── Header ──────────────────────────────────────── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">CheckList de Monitoramento</h1>
        <p class="page-subtitle">Varredura semanal de portais · Terça-feira 08:00</p>
      </div>
      <div style="display:flex; gap:.5rem; flex-wrap:wrap">
        <button class="btn" @click="showPortalManage = true">⚙️ Portais</button>
        <button class="btn primary" @click="showNewChecklist = true">+ Nova sessão</button>
      </div>
    </div>

    <div class="cl-layout">

      <!-- ── Sidebar: lista de sessões ──────────────────── -->
      <aside class="cl-sidebar">
        <div class="cl-sidebar-title">Sessões</div>

        <div v-if="loadingList" class="cl-sidebar-empty">Carregando...</div>
        <div v-else-if="!checklists.length" class="cl-sidebar-empty">
          Nenhuma sessão ainda.<br>
          <button class="link small" style="margin-top:.5rem" @click="showNewChecklist = true">Criar primeira</button>
        </div>

        <div
          v-for="cl in checklists"
          :key="cl.id"
          class="cl-sidebar-item"
          :class="{ active: active?.id === cl.id }"
          @click="selectChecklist(cl)"
        >
          <div class="cl-sb-top">
            <span class="cl-sb-week">Semana {{ cl.weekReference }}</span>
            <span :class="`badge ${statusClass(cl.status)}`" style="font-size:.65rem">{{ cl.status }}</span>
          </div>
          <div class="cl-sb-meta">
            {{ fmtDateTime(cl.checkDate) }}
          </div>
          <div class="cl-sb-counts">
            <span>✅ {{ cl._count?.portalEntries ?? cl.checkedPortals ?? 0 }} portais</span>
            <span v-if="(cl._count?.findings ?? cl.foundFindings) > 0" class="cl-sb-findings">
              🔍 {{ cl._count?.findings ?? cl.foundFindings }} achados
            </span>
          </div>
        </div>
      </aside>

      <!-- ── Detalhe ──────────────────────────────────── -->
      <div class="cl-detail">

        <div v-if="!active && !loadingDetail" class="cl-empty">
          <EmptyState
            title="Selecione uma sessão"
            description="Escolha uma sessão na lista ao lado ou crie uma nova."
          />
        </div>

        <div v-else-if="loadingDetail" class="cl-empty">
          <div class="cl-spinner"></div>
          <p style="color:var(--muted); margin-top:.75rem">Carregando...</p>
        </div>

        <template v-else-if="active">

          <!-- Header do checklist ativo -->
          <div class="cl-detail-header">
            <div class="cl-detail-header-left">
              <h2 class="cl-detail-title">Semana {{ active.weekReference }}</h2>
              <div class="cl-detail-meta">
                <span>{{ fmtDateTime(active.checkDate) }}</span>
                <span>· Por <strong>{{ active.executedBy }}</strong></span>
                <span :class="`badge ${statusClass(active.status)}`">{{ active.status }}</span>
              </div>
            </div>
            <div class="cl-header-right">
              <div class="cl-counters">
                <div class="cl-counter">
                  <span class="cl-counter-val">{{ active.checkedPortals }}</span>
                  <span class="cl-counter-lbl">de {{ active.totalPortals }} portais</span>
                </div>
                <div class="cl-progress-wrap">
                  <div class="cl-progress-bar">
                    <div class="cl-progress-fill" :style="{ width: progressPct + '%' }" />
                  </div>
                  <span class="cl-progress-pct">{{ progressPct }}%</span>
                </div>
                <div class="cl-counter" v-if="active.foundFindings">
                  <span class="cl-counter-val finding">{{ active.foundFindings }}</span>
                  <span class="cl-counter-lbl">achados</span>
                </div>
              </div>

              <!-- Botão Finalizar -->
              <div v-if="active.status !== 'Concluído'" class="cl-finalize-wrap">
                <button
                  class="btn success"
                  :disabled="!canFinalize || finalizingId === active.id"
                  @click="finalizeChecklist"
                  :title="pendingPortals.length ? `${pendingPortals.length} portal(is) ainda não verificado(s)` : 'Finalizar checklist'"
                >
                  {{ finalizingId === active.id ? 'Finalizando...' : '✅ Finalizar checklist' }}
                </button>
                <div v-if="pendingPortals.length" class="cl-finalize-hint">
                  {{ pendingPortals.length }} portal{{ pendingPortals.length > 1 ? 'is' : '' }} pendente{{ pendingPortals.length > 1 ? 's' : '' }}
                </div>
              </div>
              <div v-else class="cl-done-badge">
                ✅ Checklist concluído
              </div>
            </div>
          </div>

          <div v-if="active.generalNotes" class="cl-notes-banner">
            📝 {{ active.generalNotes }}
          </div>

          <!-- Grid de portais -->
          <div class="cl-portals-grid">
            <div
              v-for="entry in active.portalEntries"
              :key="entry.id"
              class="cl-portal-card"
              :class="{ checked: entry.checked, hasnews: entry.hasNews }"
            >
              <!-- Cabeçalho do card de portal -->
              <div class="cl-pc-header">
                <label class="cl-pc-check-label" :for="`chk-${entry.id}`">
                  <input
                    :id="`chk-${entry.id}`"
                    type="checkbox"
                    :checked="entry.checked"
                    @change="toggleCheck(entry)"
                    style="width:auto; cursor:pointer"
                  />
                  <span class="cl-pc-name">{{ entry.portal?.name }}</span>
                </label>
                <div class="cl-pc-badges">
                  <span v-if="entry.portal?.category" class="badge badge-neutral" style="font-size:.65rem">{{ entry.portal.category }}</span>
                  <span v-if="entry.hasNews" class="badge badge-warning" style="font-size:.65rem">🔍 Com novidade</span>
                  <span v-if="entry.checked && !entry.hasNews" class="badge badge-success" style="font-size:.65rem">✓ Verificado</span>
                </div>
              </div>

              <!-- URL do portal -->
              <div v-if="entry.portal?.url" class="cl-pc-url">
                <a :href="entry.portal.url" target="_blank" rel="noopener" class="link small">
                  🔗 Abrir portal
                </a>
              </div>

              <!-- Nota rápida -->
              <div v-if="entry.checked" class="cl-pc-note">
                <input
                  v-model="entry.notes"
                  placeholder="Observação (opcional)"
                  @blur="saveEntryNote(entry)"
                  @keyup.enter="saveEntryNote(entry)"
                  style="font-size:.8rem"
                />
              </div>

              <!-- Findings deste portal -->
              <div v-if="entry.findings?.length" class="cl-pc-findings">
                <div
                  v-for="f in entry.findings"
                  :key="f.id"
                  class="cl-finding-row"
                >
                  <div class="cl-finding-top">
                    <span :class="`badge ${findingStatusClass(f.status)}`" style="font-size:.65rem">{{ f.status }}</span>
                    <span v-if="f.severity" :class="`badge ${sevClass(f.severity)}`" style="font-size:.65rem">{{ f.severity }}</span>
                    <span class="cl-finding-title">{{ f.title }}</span>
                  </div>
                  <div v-if="f.sourceReference" class="cl-finding-ref">Ref: {{ f.sourceReference }}</div>
                  <div v-if="f.description" class="cl-finding-desc">{{ f.description }}</div>
                  <div v-if="f.riskItem" class="cl-finding-cr">
                    <router-link :to="`/risk-items/${f.riskItem.id}`" class="link small">
                      📋 {{ f.riskItem.code }} — {{ f.riskItem.title }}
                    </router-link>
                  </div>
                  <div class="cl-finding-actions">
                    <button v-if="f.requiresCR && !f.riskItem" class="btn small primary" @click="openCRModal(f)">
                      + Abrir CR
                    </button>
                    <button class="btn small ghost" @click="openEditFinding(f, entry)" title="Editar">✏️ Editar</button>
                    <button class="btn small ghost" style="color:var(--danger)" @click="deleteFinding(f)" title="Remover">🗑</button>
                  </div>
                </div>
              </div>

              <!-- Botão adicionar achado -->
              <div v-if="entry.checked" class="cl-pc-add-finding">
                <button class="btn small ghost" @click="openNewFinding(entry)">
                  + Registrar achado
                </button>
              </div>
            </div>
          </div>

          <!-- Seção consolidada de todos os achados -->
          <div v-if="allFindings.length" class="cl-findings-summary card" style="margin-top:1.5rem">
            <div class="card-header">
              <h2 class="card-title">🔍 Achados da semana — {{ allFindings.length }} registrado{{ allFindings.length > 1 ? 's' : '' }}</h2>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Portal</th>
                    <th>Título</th>
                    <th>Referência</th>
                    <th>Severidade</th>
                    <th>Requer CR</th>
                    <th>Status</th>
                    <th>CR vinculado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="f in allFindings" :key="f.id">
                    <td style="white-space:nowrap; font-size:.8rem; color:var(--muted)">{{ f.portalEntry?.portal?.name || '—' }}</td>
                    <td style="font-weight:600; font-size:.875rem">{{ f.title }}</td>
                    <td style="font-size:.8rem; color:var(--muted)">{{ f.sourceReference || '—' }}</td>
                    <td>
                      <span v-if="f.severity" :class="`badge ${sevClass(f.severity)}`">{{ f.severity }}</span>
                      <span v-else class="text-muted" style="font-size:.8rem">—</span>
                    </td>
                    <td style="text-align:center">
                      <span v-if="f.requiresCR" class="badge badge-warning" style="font-size:.68rem">Sim</span>
                      <span v-else class="text-muted" style="font-size:.8rem">—</span>
                    </td>
                    <td>
                      <span :class="`badge ${findingStatusClass(f.status)}`">{{ f.status }}</span>
                    </td>
                    <td>
                      <router-link v-if="f.riskItem" :to="`/risk-items/${f.riskItem.id}`" class="link small">
                        {{ f.riskItem.code }}
                      </router-link>
                      <button
                        v-else-if="f.requiresCR"
                        class="btn small primary"
                        @click="openCRModal(f)"
                        style="font-size:.72rem; padding:.2rem .5rem"
                      >+ CR</button>
                      <span v-else class="text-muted" style="font-size:.8rem">—</span>
                    </td>
                    <td style="white-space:nowrap">
                      <button class="btn small ghost icon-btn" @click="openEditFinding(f, active.portalEntries.find(e=>e.id===f.portalEntryId))" title="Editar">✏️</button>
                      <button class="btn small ghost icon-btn" style="color:var(--danger)" @click="deleteFinding(f)" title="Remover">🗑</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </template>
      </div>
    </div>

    <!-- ── Modais ─────────────────────────────────────────── -->
    <ChecklistForm
      v-if="showNewChecklist"
      @save="createChecklist"
      @cancel="showNewChecklist = false"
    />

    <FindingForm
      v-if="showFindingForm && findingPortalEntry"
      :portal-entry="findingPortalEntry"
      :finding="editFinding"
      @save="saveFinding"
      @cancel="showFindingForm = false"
    />

    <PortalManageModal
      v-if="showPortalManage"
      @close="afterPortalManage"
    />

    <CRFromFindingModal
      v-if="showCRModal && crFinding"
      :finding="crFinding"
      :portal-name="active?.portalEntries?.find(e => e.id === crFinding.portalEntryId)?.portal?.name || ''"
      @saved="onCRSaved"
      @cancel="showCRModal = false; crFinding = null"
    />
  </div>
</template>

<style scoped>
/* ── Layout ──────────────────────────────────────── */
.cl-page { padding-bottom: 3rem; }

.cl-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 1.25rem;
  margin-top: .5rem;
  align-items: flex-start;
}

/* ── Sidebar ─────────────────────────────────────── */
.cl-sidebar {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  overflow: hidden;
  position: sticky;
  top: 1rem;
}
.cl-sidebar-title {
  font-size: .72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--muted);
  padding: .75rem 1rem .5rem;
  border-bottom: 1px solid var(--border);
}
.cl-sidebar-empty {
  padding: 1.25rem 1rem;
  font-size: .85rem;
  color: var(--muted);
  text-align: center;
}
.cl-sidebar-item {
  padding: .75rem 1rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background .1s;
}
.cl-sidebar-item:last-child { border-bottom: none; }
.cl-sidebar-item:hover { background: var(--bg); }
.cl-sidebar-item.active { background: rgba(37,99,235,.07); border-left: 3px solid var(--primary); }
.cl-sb-top { display: flex; align-items: center; justify-content: space-between; gap: .35rem; margin-bottom: .2rem; }
.cl-sb-week { font-size: .82rem; font-weight: 700; color: var(--text); }
.cl-sb-meta { font-size: .72rem; color: var(--muted); margin-bottom: .2rem; }
.cl-sb-counts { display: flex; flex-wrap: wrap; gap: .4rem; font-size: .72rem; color: var(--muted); }
.cl-sb-findings { color: var(--warning); font-weight: 600; }

/* ── Detail ──────────────────────────────────────── */
.cl-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 5rem 0;
  color: var(--muted);
}
.cl-spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.cl-detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.1rem;
  padding-bottom: .85rem;
  border-bottom: 1px solid var(--border);
}
.cl-detail-title { font-size: 1.2rem; font-weight: 800; margin: 0 0 .2rem; }
.cl-detail-meta {
  display: flex; align-items: center; gap: .5rem;
  flex-wrap: wrap; font-size: .82rem; color: var(--muted);
}
.cl-counters { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.cl-counter { text-align: center; }
.cl-counter-val { font-size: 1.5rem; font-weight: 800; color: var(--primary); display: block; line-height: 1; }
.cl-counter-val.finding { color: var(--warning); }
.cl-counter-lbl { font-size: .7rem; color: var(--muted); white-space: nowrap; }
.cl-progress-wrap { display: flex; align-items: center; gap: .5rem; }
.cl-progress-bar { width: 120px; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
.cl-progress-fill { height: 100%; background: var(--primary); border-radius: 4px; transition: width .4s ease; }
.cl-progress-pct { font-size: .78rem; font-weight: 700; color: var(--primary); min-width: 32px; }

.cl-notes-banner {
  background: var(--p3-bg);
  border: 1px solid var(--p3-border);
  border-radius: 8px;
  padding: .6rem 1rem;
  font-size: .82rem;
  color: var(--text);
  margin-bottom: 1rem;
}

/* ── Grid de portais ─────────────────────────────── */
.cl-portals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: .75rem;
}
.cl-portal-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: .85rem 1rem;
  background: var(--surface);
  display: grid;
  gap: .5rem;
  transition: border-color .15s, box-shadow .15s;
}
.cl-portal-card.checked {
  border-color: rgba(16, 185, 129, .35);
}
.cl-portal-card.hasnews {
  border-color: var(--warning);
  background: var(--p3-bg);
}
.cl-pc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: .5rem;
}
.cl-pc-check-label {
  display: flex;
  align-items: center;
  gap: .45rem;
  cursor: pointer;
  flex: 1;
}
.cl-pc-name { font-size: .875rem; font-weight: 600; }
.cl-pc-badges { display: flex; flex-wrap: wrap; gap: .25rem; justify-content: flex-end; }
.cl-pc-url { font-size: .78rem; }
.cl-pc-note input {
  font-size: .8rem;
  padding: .3rem .55rem;
  border-radius: 6px;
}
.cl-pc-add-finding { margin-top: .25rem; }

/* ── Findings dentro do card ─────────────────────── */
.cl-pc-findings { display: grid; gap: .5rem; margin-top: .25rem; }
.cl-finding-row {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: .55rem .7rem;
  display: grid;
  gap: .25rem;
}
.cl-finding-top { display: flex; align-items: center; gap: .35rem; flex-wrap: wrap; }
.cl-finding-title { font-size: .82rem; font-weight: 600; }
.cl-finding-ref { font-size: .72rem; color: var(--muted); }
.cl-finding-desc { font-size: .78rem; color: var(--muted); }
.cl-finding-cr { font-size: .78rem; }
.cl-finding-actions { display: flex; gap: .3rem; margin-top: .2rem; }

/* ── Finalizar ───────────────────────────────────── */
.cl-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: .65rem;
}
.cl-finalize-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: .25rem;
}
.cl-finalize-hint {
  font-size: .72rem;
  color: var(--danger);
  font-weight: 600;
}
.cl-done-badge {
  font-size: .82rem;
  font-weight: 700;
  color: var(--success);
  background: #ecfdf5;
  border: 1px solid #6ee7b7;
  padding: .35rem .75rem;
  border-radius: 8px;
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 860px) {
  .cl-layout { grid-template-columns: 1fr; }
  .cl-sidebar { position: static; }
  .cl-header-right { align-items: flex-start; }
}
@media (max-width: 560px) {
  .cl-portals-grid { grid-template-columns: 1fr; }
}
</style>
