<script setup>
import { ref, computed, onMounted } from 'vue'
import { managementMeetingService } from '@/services/managementMeetingService'
import { riskItemService } from '@/services/riskItemService'
import { useToast } from '@/composables/useToast'
import { usePagination } from '@/composables/usePagination'
import EmptyState from '@/components/EmptyState.vue'

const toast = useToast()
const meetings = ref([])
const riskItems = ref([])
const loading = ref(true)
const showForm = ref(false)
const editingMeeting = ref(null)

const form = ref(resetForm())
function resetForm() {
  return {
    meetingDate: new Date().toISOString().split('T')[0],
    agenda: '',
    managementFeedback: '',
    actionRequired: false,
    actionDescription: '',
    nextFollowUp: '',
    status: 'Pendente',
    notes: '',
    riskItemIds: [],
  }
}

onMounted(async () => {
  await Promise.all([loadMeetings(), loadRiskItems()])
})

async function loadMeetings() {
  loading.value = true
  try {
    const res = await managementMeetingService.getAll()
    meetings.value = res.data || []
  } finally {
    loading.value = false
  }
}

async function loadRiskItems() {
  const res = await riskItemService.getAll()
  riskItems.value = (res.data || []).filter((i) =>
    ['Aguardando Direção', 'Plano de ação aprovado', 'Em execução'].includes(i.monitoringStatus),
  )
}

const filterStatus = ref('')
const filtered = computed(() => {
  if (!filterStatus.value) return meetings.value
  return meetings.value.filter((m) => m.status === filterStatus.value)
})
const { currentPage, totalPages, paginatedItems, nextPage, previousPage, goToPage } =
  usePagination(filtered, 10)

function openNew() {
  editingMeeting.value = null
  form.value = resetForm()
  showForm.value = true
}
function openEdit(m) {
  editingMeeting.value = m
  form.value = {
    meetingDate: m.meetingDate?.split('T')[0] || '',
    agenda: m.agenda || '',
    managementFeedback: m.managementFeedback || '',
    actionRequired: m.actionRequired || false,
    actionDescription: m.actionDescription || '',
    nextFollowUp: m.nextFollowUp?.split('T')[0] || '',
    status: m.status || 'Pendente',
    notes: m.notes || '',
    riskItemIds: (m.riskItems || []).map((r) => r.riskItemId),
  }
  showForm.value = true
}
function closeForm() { showForm.value = false; editingMeeting.value = null }

async function save() {
  try {
    if (editingMeeting.value) {
      await managementMeetingService.update(editingMeeting.value.id, form.value)
      toast.success('Reunião atualizada!')
    } else {
      await managementMeetingService.create(form.value)
      toast.success('Reunião criada!')
    }
    closeForm()
    await loadMeetings()
  } catch {
    toast.error('Erro ao salvar a reunião.')
  }
}

async function deleteMeeting(m) {
  if (!confirm(`Remover a reunião de ${fmtDate(m.meetingDate)}?`)) return
  try {
    await managementMeetingService.delete(m.id)
    await loadMeetings()
    toast.success('Reunião removida.')
  } catch {
    toast.error('Erro ao remover.')
  }
}

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—' }
function statusBadge(s) {
  if (s === 'Realizada') return 'badge-success'
  if (s === 'Cancelada') return 'badge-danger'
  return 'badge-warning'
}
function toggleRiskItem(id) {
  const idx = form.value.riskItemIds.indexOf(id)
  if (idx > -1) form.value.riskItemIds.splice(idx, 1)
  else form.value.riskItemIds.push(id)
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">Reuniões de Gestão</h1>
        <p class="page-subtitle">Reuniões de terça-feira com a Direção</p>
      </div>
      <button class="btn primary" @click="openNew">+ Nova Reunião</button>
    </div>

    <div class="filters-bar">
      <select v-model="filterStatus">
        <option value="">Todos os status</option>
        <option>Pendente</option>
        <option>Realizada</option>
        <option>Cancelada</option>
      </select>
    </div>

    <div v-if="loading" style="text-align:center; padding:3rem 0; color:var(--muted)">Carregando...</div>

    <template v-else>
      <EmptyState v-if="!filtered.length" title="Nenhuma reunião encontrada" description="Crie a primeira reunião de gestão." />
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Itens Pautados</th>
              <th>Ação Requerida</th>
              <th>Próximo Follow-up</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in paginatedItems" :key="m.id">
              <td style="font-weight:600; white-space:nowrap">{{ fmtDate(m.meetingDate) }}</td>
              <td>
                <div class="row wrap" style="gap:.25rem">
                  <span v-for="ri in (m.riskItems || [])" :key="ri.riskItemId" class="badge badge-info" style="font-size:.65rem">
                    {{ ri.riskItem?.code || '—' }}
                  </span>
                  <span v-if="!(m.riskItems || []).length" class="text-muted small">—</span>
                </div>
              </td>
              <td>
                <span v-if="m.actionRequired" class="badge badge-warning">Sim</span>
                <span v-else class="badge badge-neutral">Não</span>
              </td>
              <td class="small">{{ fmtDate(m.nextFollowUp) }}</td>
              <td><span class="badge" :class="statusBadge(m.status)">{{ m.status }}</span></td>
              <td>
                <div class="row" style="gap:.25rem">
                  <button class="btn small ghost" @click="openEdit(m)">Editar</button>
                  <button class="btn small ghost" style="color:var(--danger)" @click="deleteMeeting(m)">✕</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="pagination">
        <button class="btn small" :disabled="currentPage === 1" @click="previousPage">‹</button>
        <button v-for="p in totalPages" :key="p" class="btn small" :class="{ primary: p === currentPage }" @click="goToPage(p)">{{ p }}</button>
        <button class="btn small" :disabled="currentPage === totalPages" @click="nextPage">›</button>
      </div>
    </template>

    <!-- Modal -->
    <div v-if="showForm" class="modal-backdrop" @click.self="closeForm">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingMeeting ? 'Editar Reunião' : 'Nova Reunião de Gestão' }}</h2>
          <button class="modal-close" @click="closeForm">✕</button>
        </div>
        <div class="modal-body stack">
          <div class="grid-form">
            <div class="field">
              <label>Data da Reunião</label>
              <input type="date" v-model="form.meetingDate" />
            </div>
            <div class="field">
              <label>Status</label>
              <select v-model="form.status">
                <option>Pendente</option>
                <option>Realizada</option>
                <option>Cancelada</option>
              </select>
            </div>
            <div class="field">
              <label>Próximo Follow-up</label>
              <input type="date" v-model="form.nextFollowUp" />
            </div>
          </div>

          <div class="field">
            <label>Pauta</label>
            <textarea v-model="form.agenda" rows="3" placeholder="Temas a serem levados à Direção..." />
          </div>

          <div class="field">
            <label>Feedback da Direção</label>
            <textarea v-model="form.managementFeedback" rows="3" placeholder="Retorno da Direção..." />
          </div>

          <div class="row center" style="gap:1rem">
            <label style="display:flex; align-items:center; gap:.5rem; text-transform:none; font-size:.875rem; font-weight:500">
              <input type="checkbox" v-model="form.actionRequired" style="width:auto" />
              Ação requerida pela Direção
            </label>
          </div>

          <div v-if="form.actionRequired" class="field">
            <label>Descrição da Ação</label>
            <textarea v-model="form.actionDescription" rows="2" placeholder="O que precisa ser feito..." />
          </div>

          <div class="field">
            <label>Itens Pautados</label>
            <div style="display:grid; gap:.35rem; max-height:180px; overflow-y:auto; border:1px solid var(--border); border-radius:8px; padding:.5rem">
              <label
                v-for="ri in riskItems"
                :key="ri.id"
                style="display:flex; align-items:center; gap:.5rem; font-size:.85rem; font-weight:500; text-transform:none; letter-spacing:0; cursor:pointer"
              >
                <input
                  type="checkbox"
                  :checked="form.riskItemIds.includes(ri.id)"
                  @change="toggleRiskItem(ri.id)"
                  style="width:auto"
                />
                <span style="font-weight:700; color:var(--primary)">{{ ri.code }}</span>
                <span class="truncate">{{ ri.title }}</span>
              </label>
              <div v-if="!riskItems.length" class="text-muted small" style="text-align:center; padding:.5rem">
                Nenhum item aguardando Direção.
              </div>
            </div>
          </div>

          <div class="field">
            <label>Observações</label>
            <textarea v-model="form.notes" rows="2" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn ghost" @click="closeForm">Cancelar</button>
          <button class="btn primary" @click="save">Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>
