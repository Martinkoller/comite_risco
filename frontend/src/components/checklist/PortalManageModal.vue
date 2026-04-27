<script setup>
import { ref, onMounted } from 'vue'
import { checklistService } from '@/services/checklistService'

const emit = defineEmits(['close'])

const portals = ref([])
const loading = ref(false)
const saving = ref(false)
const showForm = ref(false)
const editTarget = ref(null)

const form = ref({ name: '', url: '', category: '', description: '', sortOrder: 0 })
const categories = ['Fiscal', 'Técnico', 'Regulatório', 'Comunicado', 'Outro']

async function load() {
  loading.value = true
  try {
    const res = await checklistService.getPortals(true)
    portals.value = res?.data ?? res ?? []
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openNew() {
  editTarget.value = null
  form.value = { name: '', url: '', category: '', description: '', sortOrder: portals.value.length * 10 }
  showForm.value = true
}

function openEdit(p) {
  editTarget.value = p
  form.value = { name: p.name, url: p.url || '', category: p.category || '', description: p.description || '', sortOrder: p.sortOrder }
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editTarget.value = null
}

async function savePortal() {
  if (!form.value.name.trim()) return
  saving.value = true
  try {
    if (editTarget.value) {
      await checklistService.updatePortal(editTarget.value.id, form.value)
    } else {
      await checklistService.createPortal(form.value)
    }
    await load()
    cancelForm()
  } finally {
    saving.value = false
  }
}

async function toggleActive(p) {
  await checklistService.updatePortal(p.id, { active: !p.active })
  await load()
}
</script>

<template>
  <div class="modal-backdrop" @mousedown.self="$emit('close')">
    <div class="modal" style="width:min(96vw,640px)">
      <div class="modal-header">
        <h2 class="modal-title">Gerenciar Portais Monitorados</h2>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body" style="padding-top:.75rem">

        <!-- form inline -->
        <div v-if="showForm" class="portal-form-box">
          <div class="stack" style="gap:.6rem">
            <div class="grid-2">
              <div class="field">
                <label>Nome do portal *</label>
                <input v-model="form.name" placeholder="Ex: Portal NF-e / NFC-e" autofocus />
              </div>
              <div class="field">
                <label>Categoria</label>
                <select v-model="form.category">
                  <option value="">— Sem categoria —</option>
                  <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>URL (opcional)</label>
              <input v-model="form.url" placeholder="https://..." type="url" />
            </div>
            <div class="grid-2">
              <div class="field">
                <label>Descrição</label>
                <input v-model="form.description" placeholder="Breve descrição..." />
              </div>
              <div class="field">
                <label>Ordem</label>
                <input v-model.number="form.sortOrder" type="number" min="0" />
              </div>
            </div>
            <div style="display:flex; gap:.5rem; justify-content:flex-end">
              <button class="btn small" @click="cancelForm">Cancelar</button>
              <button class="btn primary small" :disabled="saving || !form.name.trim()" @click="savePortal">
                {{ editTarget ? 'Salvar' : 'Adicionar' }}
              </button>
            </div>
          </div>
        </div>

        <div v-else style="margin-bottom:.75rem; display:flex; justify-content:flex-end">
          <button class="btn primary small" @click="openNew">+ Novo portal</button>
        </div>

        <div v-if="loading" style="padding:1.5rem; text-align:center; color:var(--muted)">Carregando...</div>
        <div v-else-if="!portals.length" style="padding:1.5rem; text-align:center; color:var(--muted)">Nenhum portal cadastrado.</div>
        <div v-else class="portal-list">
          <div
            v-for="p in portals"
            :key="p.id"
            class="portal-row"
            :class="{ inactive: !p.active }"
          >
            <div class="portal-info">
              <span class="portal-name">{{ p.name }}</span>
              <span v-if="p.category" class="badge badge-neutral" style="font-size:.68rem">{{ p.category }}</span>
              <span v-if="!p.active" class="badge badge-danger" style="font-size:.68rem">Inativo</span>
            </div>
            <div v-if="p.url" class="portal-url">
              <a :href="p.url" target="_blank" rel="noopener" class="link small">{{ p.url }}</a>
            </div>
            <div class="portal-actions">
              <button class="btn small ghost" @click="openEdit(p)" title="Editar">✏️</button>
              <button
                class="btn small ghost"
                @click="toggleActive(p)"
                :title="p.active ? 'Desativar' : 'Reativar'"
              >{{ p.active ? '🚫' : '✅' }}</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn primary" @click="$emit('close')">Fechar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.portal-form-box {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: .85rem 1rem;
  margin-bottom: .75rem;
}
.portal-list { display: grid; gap: 0; }
.portal-row {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .6rem .5rem;
  border-bottom: 1px solid var(--border);
}
.portal-row:last-child { border-bottom: none; }
.portal-row.inactive { opacity: .55; }
.portal-info { flex: 1; display: flex; align-items: center; gap: .5rem; flex-wrap: wrap; }
.portal-name { font-size: .875rem; font-weight: 600; }
.portal-url { font-size: .75rem; color: var(--muted); flex-shrink: 0; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.portal-actions { display: flex; gap: .25rem; flex-shrink: 0; }
</style>
