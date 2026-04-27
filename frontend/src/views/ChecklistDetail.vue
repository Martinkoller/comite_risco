<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { checklistService } from '@/services/checklistService'
import { useToast } from '@/composables/useToast'
import FindingForm from '@/components/checklist/FindingForm.vue'
import CRFromFindingModal from '@/components/checklist/CRFromFindingModal.vue'

const route  = useRoute()
const router = useRouter()
const { show: showToast } = useToast()

const checklist     = ref(null)
const loading       = ref(true)
const saving        = ref(false)
const finalizingId  = ref(null)

// Modais
const showFindingForm    = ref(false)
const editFinding        = ref(null)
const findingPortalEntry = ref(null)
const showCRModal        = ref(false)
const crFinding          = ref(null)

// Edição inline de notas gerais
const editingNotes = ref(false)
const notesInput   = ref('')

async function loadChecklist() {
  loading.value = true
  try {
    const res = await checklistService.getById(route.params.id)
    checklist.value = res?.data ?? res
  } catch {
    showToast('Checklist não encontrado', 'error')
    router.push('/checklist')
  } finally {
    loading.value = false
  }
}

onMounted(loadChecklist)

// ── Check de portal ─────────────────────────────────────
async function toggleCheck(entry) {
  const newChecked = !entry.checked
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
    syncCounters()
  } catch {
    entry.checked = !newChecked
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
  } catch {
    showToast('Erro ao salvar observação', 'error')
  }
}

async function syncCounters() {
  const res = await checklistService.getById(checklist.value.id)
  const fresh = res?.data ?? res
  checklist.value.checkedPortals = fresh.checkedPortals
  checklist.value.totalPortals   = fresh.totalPortals
  checklist.value.foundFindings  = fresh.foundFindings
  checklist.value.status         = fresh.status
}

// ── Findings ────────────────────────────────────────────
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
        checklistId: checklist.value.id,
        portalEntryId: findingPortalEntry.value.id,
      })
    }
    const msg = editFinding.value ? 'Achado atualizado' : 'Achado registrado!'
    showFindingForm.value = false
    editFinding.value = null
    const res = await checklistService.getById(checklist.value.id)
    checklist.value = res?.data ?? res
    showToast(msg, 'success')
  } catch (e) {
    showToast(e?.error || e?.message || 'Erro ao salvar achado', 'error')
  } finally {
    saving.value = false
  }
}

async function deleteFinding(finding) {
  if (!confirm(`Remover achado "${finding.title}"?`)) return
  try {
    await checklistService.deleteFinding(finding.id)
    const res = await checklistService.getById(checklist.value.id)
    checklist.value = res?.data ?? res
    showToast('Achado removido', 'success')
  } catch {
    showToast('Erro ao remover', 'error')
  }
}

// ── CR inline ────────────────────────────────────────────
function openCRModal(finding) {
  crFinding.value = finding
  showCRModal.value = true
}

async function onCRSaved(newRiskItem) {
  showCRModal.value = false
  try {
    await checklistService.linkRiskItem(crFinding.value.id, newRiskItem.id)
  } catch (e) {
    console.error('linkRiskItem error:', e)
  }
  crFinding.value = null
  const res = await checklistService.getById(checklist.value.id)
  checklist.value = res?.data ?? res
  showToast('CR criado e vinculado ao achado!', 'success')
}

// ── Finalizar ────────────────────────────────────────────
const pendingPortals = computed(() =>
  checklist.value?.portalEntries?.filter(e => !e.checked) ?? []
)
const canFinalize = computed(() =>
  checklist.value &&
  checklist.value.status !== 'Concluído' &&
  pendingPortals.value.length === 0
)

async function finalizeChecklist() {
  if (!canFinalize.value) return
  if (!confirm(`Confirmar finalização do checklist da semana ${checklist.value.weekReference}?`)) return
  finalizingId.value = checklist.value.id
  try {
    await checklistService.update(checklist.value.id, { status: 'Concluído' })
    const res = await checklistService.getById(checklist.value.id)
    checklist.value = res?.data ?? res
    showToast('Checklist finalizado!', 'success')
  } catch (e) {
    showToast(e?.error || 'Erro ao finalizar', 'error')
  } finally {
    finalizingId.value = null
  }
}

// ── Notas gerais inline ──────────────────────────────────
function startEditNotes() {
  notesInput.value = checklist.value.generalNotes || ''
  editingNotes.value = true
}
async function saveNotes() {
  try {
    await checklistService.update(checklist.value.id, { generalNotes: notesInput.value })
    checklist.value.generalNotes = notesInput.value
    editingNotes.value = false
    showToast('Notas salvas', 'success')
  } catch {
    showToast('Erro ao salvar notas', 'error')
  }
}

// ── Computed / Helpers ───────────────────────────────────
const progressPct = computed(() => {
  if (!checklist.value?.totalPortals) return 0
  return Math.round((checklist.value.checkedPortals / checklist.value.totalPortals) * 100)
})

const allFindings = computed(() => checklist.value?.findings ?? [])

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function fmtDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function statusClass(s) {
  if (s === 'Concluído')   return 'badge-success'
  if (s === 'Em execução') return 'badge-warning'
  return 'badge-neutral'
}
function sevClass(s) {
  if (!s) return 'badge-neutral'
  return `badge-${s.toLowerCase()}`
}
function findingStatusClass(s) {
  if (s === 'CR Aberto')  return 'badge-info'
  if (s === 'Descartado') return 'badge-neutral'
  return 'badge-warning'
}
function portalNameOf(finding) {
  return checklist.value?.portalEntries?.find(e => e.id === finding.portalEntryId)?.portal?.name || ''
}
</script>

<template>
  <div class="cldtl-page">

    <!-- ── Carregando ───────────────────────────────────── -->
    <div v-if="loading" class="cldtl-loading">
      <div class="cldtl-spinner"></div>
      <p>Carregando checklist...</p>
    </div>

    <template v-else-if="checklist">

      <!-- ── Breadcrumb + Header ───────────────────────── -->
      <div class="page-header" style="align-items:flex-start">
        <div>
          <div class="cldtl-breadcrumb">
            <router-link to="/checklist" class="link">CheckList</router-link>
            <span style="color:var(--muted)"> / </span>
            <span>Semana {{ checklist.weekReference }}</span>
          </div>
          <h1 class="page-title" style="margin-top:.25rem">
            Semana {{ checklist.weekReference }}
            <span :class="`badge ${statusClass(checklist.status)}`" style="font-size:.75rem; vertical-align: middle; margin-left:.5rem">{{ checklist.status }}</span>
          </h1>
          <p class="page-subtitle">
            {{ fmtDate(checklist.checkDate) }}
            · Por <strong>{{ checklist.executedBy }}</strong>
          </p>
        </div>

        <div class="cldtl-header-actions">
          <!-- Progresso -->
          <div class="cldtl-progress-block">
            <div class="cldtl-prog-label">
              <span>{{ checklist.checkedPortals }} / {{ checklist.totalPortals }} portais</span>
              <span class="cldtl-prog-pct">{{ progressPct }}%</span>
            </div>
            <div class="cldtl-prog-bar">
              <div class="cldtl-prog-fill" :style="{ width: progressPct + '%' }" />
            </div>
          </div>

          <!-- Finalizar / Concluído -->
          <div v-if="checklist.status !== 'Concluído'" class="cldtl-finalize">
            <button
              class="btn success"
              :disabled="!canFinalize || finalizingId === checklist.id"
              @click="finalizeChecklist"
              :title="pendingPortals.length ? `${pendingPortals.length} portal(is) pendente(s)` : 'Finalizar checklist'"
            >
              {{ finalizingId === checklist.id ? 'Finalizando...' : '✅ Finalizar checklist' }}
            </button>
            <div v-if="pendingPortals.length" class="cldtl-finalize-hint">
              {{ pendingPortals.length }} portal{{ pendingPortals.length > 1 ? 'is' : '' }} pendente{{ pendingPortals.length > 1 ? 's' : '' }}
            </div>
          </div>
          <div v-else class="cldtl-done-badge">✅ Checklist concluído</div>
        </div>
      </div>

      <!-- ── Notas gerais ─────────────────────────────── -->
      <div class="cldtl-notes-row">
        <template v-if="!editingNotes">
          <div v-if="checklist.generalNotes" class="cldtl-notes-banner" @click="startEditNotes">
            📝 {{ checklist.generalNotes }}
            <span class="cldtl-notes-edit">Editar</span>
          </div>
          <button v-else class="btn ghost small" @click="startEditNotes" style="font-size:.78rem">
            + Adicionar notas gerais
          </button>
        </template>
        <template v-else>
          <div class="cldtl-notes-edit-row">
            <input v-model="notesInput" placeholder="Notas gerais da sessão..." style="flex:1" @keyup.enter="saveNotes" />
            <button class="btn primary small" @click="saveNotes">Salvar</button>
            <button class="btn small" @click="editingNotes = false">Cancelar</button>
          </div>
        </template>
      </div>

      <!-- ── Grid de portais ──────────────────────────── -->
      <h2 class="cldtl-section-title">Portais monitorados</h2>

      <div class="cldtl-portals-grid">
        <div
          v-for="entry in checklist.portalEntries"
          :key="entry.id"
          class="cldtl-portal-card"
          :class="{ checked: entry.checked, hasnews: entry.hasNews }"
        >
          <!-- Cabeçalho -->
          <div class="cldtl-pc-header">
            <label class="cldtl-pc-label" :for="`chk-${entry.id}`">
              <input
                :id="`chk-${entry.id}`"
                type="checkbox"
                :checked="entry.checked"
                :disabled="checklist.status === 'Concluído'"
                @change="toggleCheck(entry)"
                style="width:auto; cursor:pointer; flex-shrink:0"
              />
              <span class="cldtl-pc-name">{{ entry.portal?.name }}</span>
            </label>
            <div class="cldtl-pc-badges">
              <span v-if="entry.portal?.category" class="badge badge-neutral" style="font-size:.63rem">{{ entry.portal.category }}</span>
              <span v-if="entry.hasNews"  class="badge badge-warning" style="font-size:.63rem">🔍 Novidade</span>
              <span v-else-if="entry.checked" class="badge badge-success" style="font-size:.63rem">✓ OK</span>
            </div>
          </div>

          <!-- URL -->
          <div v-if="entry.portal?.url" class="cldtl-pc-url">
            <a :href="entry.portal.url" target="_blank" rel="noopener" class="link small">🔗 Abrir portal</a>
          </div>

          <!-- Nota rápida -->
          <div v-if="entry.checked && checklist.status !== 'Concluído'" class="cldtl-pc-note">
            <input
              v-model="entry.notes"
              placeholder="Observação (opcional)"
              @blur="saveEntryNote(entry)"
              @keyup.enter="saveEntryNote(entry)"
              style="font-size:.8rem"
            />
          </div>
          <div v-else-if="entry.notes" class="cldtl-pc-note-view">
            📌 {{ entry.notes }}
          </div>

          <!-- Findings deste portal -->
          <div v-if="entry.findings?.length" class="cldtl-pc-findings">
            <div v-for="f in entry.findings" :key="f.id" class="cldtl-finding-row">
              <div class="cldtl-finding-top">
                <span :class="`badge ${findingStatusClass(f.status)}`" style="font-size:.63rem">{{ f.status }}</span>
                <span v-if="f.severity" :class="`badge ${sevClass(f.severity)}`" style="font-size:.63rem">{{ f.severity }}</span>
                <span class="cldtl-finding-title">{{ f.title }}</span>
              </div>
              <div v-if="f.sourceReference" class="cldtl-finding-ref">Ref: {{ f.sourceReference }}</div>
              <div v-if="f.description" class="cldtl-finding-desc">{{ f.description }}</div>
              <div v-if="f.riskItem" class="cldtl-finding-cr">
                <router-link :to="`/risk-items/${f.riskItem.id}`" class="link small">
                  📋 {{ f.riskItem.code }} — {{ f.riskItem.title }}
                </router-link>
              </div>
              <div v-if="checklist.status !== 'Concluído'" class="cldtl-finding-actions">
                <button v-if="f.requiresCR && !f.riskItem" class="btn small primary" @click="openCRModal(f)">
                  + Abrir CR
                </button>
                <button class="btn small ghost" @click="openEditFinding(f, entry)">✏️ Editar</button>
                <button class="btn small ghost" style="color:var(--danger)" @click="deleteFinding(f)">🗑</button>
              </div>
            </div>
          </div>

          <!-- Adicionar achado -->
          <div v-if="entry.checked && checklist.status !== 'Concluído'" class="cldtl-pc-add">
            <button class="btn small ghost" @click="openNewFinding(entry)">+ Registrar achado</button>
          </div>
        </div>
      </div>

      <!-- ── Resumo de achados ─────────────────────────── -->
      <template v-if="allFindings.length">
        <h2 class="cldtl-section-title" style="margin-top:2rem">
          🔍 Achados da semana
          <span class="badge badge-warning" style="font-size:.72rem; vertical-align:middle; margin-left:.4rem">{{ allFindings.length }}</span>
        </h2>

        <div class="card" style="margin-top:.5rem">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Portal</th>
                  <th>Título</th>
                  <th>Referência</th>
                  <th>Sev.</th>
                  <th>Requer CR</th>
                  <th>Status</th>
                  <th>CR</th>
                  <th v-if="checklist.status !== 'Concluído'"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="f in allFindings" :key="f.id">
                  <td style="white-space:nowrap; font-size:.78rem; color:var(--muted)">
                    {{ f.portalEntry?.portal?.name || '—' }}
                  </td>
                  <td style="font-weight:600; font-size:.875rem">{{ f.title }}</td>
                  <td style="font-size:.78rem; color:var(--muted)">{{ f.sourceReference || '—' }}</td>
                  <td>
                    <span v-if="f.severity" :class="`badge ${sevClass(f.severity)}`">{{ f.severity }}</span>
                    <span v-else class="text-muted" style="font-size:.8rem">—</span>
                  </td>
                  <td style="text-align:center">
                    <span v-if="f.requiresCR" class="badge badge-warning" style="font-size:.68rem">Sim</span>
                    <span v-else style="font-size:.8rem; color:var(--muted)">—</span>
                  </td>
                  <td><span :class="`badge ${findingStatusClass(f.status)}`">{{ f.status }}</span></td>
                  <td>
                    <router-link v-if="f.riskItem" :to="`/risk-items/${f.riskItem.id}`" class="link small">
                      {{ f.riskItem.code }}
                    </router-link>
                    <button
                      v-else-if="f.requiresCR && checklist.status !== 'Concluído'"
                      class="btn small primary"
                      @click="openCRModal(f)"
                      style="font-size:.72rem; padding:.2rem .5rem"
                    >+ CR</button>
                    <span v-else style="font-size:.8rem; color:var(--muted)">—</span>
                  </td>
                  <td v-if="checklist.status !== 'Concluído'" style="white-space:nowrap">
                    <button class="btn small ghost icon-btn" @click="openEditFinding(f, checklist.portalEntries.find(e=>e.id===f.portalEntryId))" title="Editar">✏️</button>
                    <button class="btn small ghost icon-btn" style="color:var(--danger)" @click="deleteFinding(f)" title="Remover">🗑</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

    </template>

    <!-- ── Modais ──────────────────────────────────────── -->
    <FindingForm
      v-if="showFindingForm && findingPortalEntry"
      :portal-entry="findingPortalEntry"
      :finding="editFinding"
      @save="saveFinding"
      @cancel="showFindingForm = false"
    />

    <CRFromFindingModal
      v-if="showCRModal && crFinding && checklist"
      :finding="crFinding"
      :portal-name="portalNameOf(crFinding)"
      @saved="onCRSaved"
      @cancel="showCRModal = false; crFinding = null"
    />

  </div>
</template>

<style scoped>
.cldtl-page { padding-bottom: 3rem; }

/* Loading */
.cldtl-loading {
  display: flex; flex-direction: column; align-items: center;
  padding: 5rem 0; color: var(--muted); gap: .75rem;
}
.cldtl-spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Breadcrumb */
.cldtl-breadcrumb {
  font-size: .8rem; color: var(--muted); margin-bottom: .25rem;
}

/* Header actions */
.cldtl-header-actions {
  display: flex; flex-direction: column; align-items: flex-end;
  gap: .65rem; flex-shrink: 0;
}
.cldtl-progress-block { min-width: 200px; }
.cldtl-prog-label {
  display: flex; justify-content: space-between;
  font-size: .78rem; color: var(--muted); margin-bottom: .3rem; font-weight: 500;
}
.cldtl-prog-pct { font-weight: 800; color: var(--primary); }
.cldtl-prog-bar {
  height: 8px; background: var(--border);
  border-radius: 4px; overflow: hidden;
}
.cldtl-prog-fill {
  height: 100%; background: var(--primary);
  border-radius: 4px; transition: width .4s;
}
.cldtl-finalize { display: flex; flex-direction: column; align-items: flex-end; gap: .2rem; }
.cldtl-finalize-hint { font-size: .7rem; color: var(--danger); font-weight: 600; }
.cldtl-done-badge {
  font-size: .82rem; font-weight: 700; color: var(--success);
  background: #ecfdf5; border: 1px solid #6ee7b7;
  padding: .35rem .75rem; border-radius: 8px;
}

/* Notes */
.cldtl-notes-row { margin: .5rem 0 1rem; }
.cldtl-notes-banner {
  background: var(--p3-bg); border: 1px solid var(--p3-border);
  border-radius: 8px; padding: .6rem 1rem;
  font-size: .82rem; color: var(--text);
  cursor: pointer; display: flex; align-items: center; gap: .75rem;
}
.cldtl-notes-edit {
  margin-left: auto; font-size: .72rem; color: var(--primary);
  font-weight: 600; flex-shrink: 0;
}
.cldtl-notes-edit-row {
  display: flex; gap: .5rem; align-items: center;
}

/* Section title */
.cldtl-section-title {
  font-size: .82rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .05em;
  color: var(--muted); margin: 1.25rem 0 .65rem;
}

/* Grid de portais */
.cldtl-portals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: .75rem;
}
.cldtl-portal-card {
  border: 1px solid var(--border); border-radius: 10px;
  padding: .85rem 1rem; background: var(--surface);
  display: grid; gap: .5rem;
  transition: border-color .15s;
}
.cldtl-portal-card.checked  { border-color: rgba(16,185,129,.35); }
.cldtl-portal-card.hasnews  { border-color: var(--warning); background: var(--p3-bg); }

.cldtl-pc-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: .5rem;
}
.cldtl-pc-label {
  display: flex; align-items: center;
  gap: .45rem; cursor: pointer; flex: 1;
}
.cldtl-pc-name { font-size: .875rem; font-weight: 600; }
.cldtl-pc-badges { display: flex; flex-wrap: wrap; gap: .25rem; justify-content: flex-end; }
.cldtl-pc-url { font-size: .78rem; }
.cldtl-pc-note input {
  font-size: .8rem; padding: .3rem .55rem; border-radius: 6px;
}
.cldtl-pc-note-view {
  font-size: .78rem; color: var(--muted);
  padding: .2rem .4rem;
}
.cldtl-pc-add { margin-top: .15rem; }

/* Findings */
.cldtl-pc-findings { display: grid; gap: .5rem; }
.cldtl-finding-row {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 8px; padding: .55rem .7rem;
  display: grid; gap: .25rem;
}
.cldtl-finding-top { display: flex; align-items: center; gap: .35rem; flex-wrap: wrap; }
.cldtl-finding-title { font-size: .82rem; font-weight: 600; }
.cldtl-finding-ref  { font-size: .72rem; color: var(--muted); }
.cldtl-finding-desc { font-size: .78rem; color: var(--muted); }
.cldtl-finding-cr   { font-size: .78rem; }
.cldtl-finding-actions { display: flex; gap: .3rem; margin-top: .2rem; flex-wrap: wrap; }

/* Responsive */
@media (max-width: 760px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .cldtl-header-actions { align-items: flex-start; }
  .cldtl-progress-block { min-width: unset; width: 100%; }
}
@media (max-width: 560px) {
  .cldtl-portals-grid { grid-template-columns: 1fr; }
}
</style>
