<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  portalEntry: { type: Object, required: true },
  finding: { type: Object, default: null }, // se existir = modo edição
})

const emit = defineEmits(['save', 'cancel'])

const form = ref({
  title: '',
  description: '',
  sourceReference: '',
  severity: '',
  requiresCR: false,
  status: 'Identificado',
})

watch(() => props.finding, (f) => {
  if (f) {
    form.value = {
      title: f.title || '',
      description: f.description || '',
      sourceReference: f.sourceReference || '',
      severity: f.severity || '',
      requiresCR: f.requiresCR || false,
      status: f.status || 'Identificado',
    }
  } else {
    form.value = { title: '', description: '', sourceReference: '', severity: '', requiresCR: false, status: 'Identificado' }
  }
}, { immediate: true })

const severities = ['P1', 'P2', 'P3', 'P4']
const statuses = ['Identificado', 'CR Aberto', 'Descartado']

function save() {
  if (!form.value.title.trim()) return
  emit('save', { ...form.value })
}
</script>

<template>
  <div class="modal-backdrop" @mousedown.self="$emit('cancel')">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">
          {{ finding ? 'Editar Achado' : 'Novo Achado' }}
        </h2>
        <span style="font-size:.8rem; color:var(--muted)">
          {{ portalEntry.portal?.name }}
        </span>
        <button class="modal-close" @click="$emit('cancel')">✕</button>
      </div>

      <div class="modal-body">
        <div class="stack" style="gap:.75rem">

          <div class="field">
            <label>Título da NT / Comunicado *</label>
            <input v-model="form.title" placeholder="Ex: NT 2026-005 — Alteração NF-e 4.0..." autofocus />
          </div>

          <div class="grid-2">
            <div class="field">
              <label>Referência / Número</label>
              <input v-model="form.sourceReference" placeholder="Ex: NT 2026-005, link, código..." />
            </div>
            <div class="field">
              <label>Severidade estimada</label>
              <select v-model="form.severity">
                <option value="">— Não definida —</option>
                <option v-for="s in severities" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>Descrição / Resumo</label>
            <textarea v-model="form.description" rows="3" placeholder="Descreva o que foi encontrado..." style="resize:vertical" />
          </div>

          <div class="grid-2">
            <div class="field">
              <label>Status</label>
              <select v-model="form.status">
                <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="field" style="justify-content:flex-end; padding-top:1.5rem">
              <label style="display:flex; align-items:center; gap:.5rem; cursor:pointer; text-transform:none; font-size:.875rem; font-weight:600; color:var(--text)">
                <input type="checkbox" v-model="form.requiresCR" style="width:auto" />
                Requer abertura de CR
              </label>
            </div>
          </div>

        </div>
      </div>

      <div class="modal-footer">
        <button class="btn" @click="$emit('cancel')">Cancelar</button>
        <button class="btn primary" :disabled="!form.title.trim()" @click="save">
          {{ finding ? 'Salvar alterações' : 'Registrar achado' }}
        </button>
      </div>
    </div>
  </div>
</template>
