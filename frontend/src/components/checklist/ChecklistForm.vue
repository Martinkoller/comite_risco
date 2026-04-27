<script setup>
import { ref } from 'vue'

const props = defineProps({ saving: { type: Boolean, default: false } })
const emit = defineEmits(['save', 'cancel'])

// Calcula semana ISO da data atual
function currentWeekRef() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7)
  return `${String(week).padStart(2, '0')}/${now.getFullYear()}`
}

function todayStr() {
  return new Date().toISOString().slice(0, 16)
}

const form = ref({
  weekReference: currentWeekRef(),
  checkDate: todayStr(),
  executedBy: 'Gian',
  generalNotes: '',
})

function save() {
  if (!form.value.weekReference.trim()) return
  emit('save', { ...form.value })
}
</script>

<template>
  <div class="modal-backdrop" @mousedown.self="$emit('cancel')">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">Nova Sessão de Checklist</h2>
        <button class="modal-close" @click="$emit('cancel')">✕</button>
      </div>

      <div class="modal-body">
        <div class="stack" style="gap:.75rem">

          <div class="grid-2">
            <div class="field">
              <label>Semana de referência *</label>
              <input v-model="form.weekReference" placeholder="Ex: 17/2026" />
              <span class="field-error" style="color:var(--muted); font-size:.72rem">Formato: SS/AAAA</span>
            </div>
            <div class="field">
              <label>Data / Hora do check</label>
              <input type="datetime-local" v-model="form.checkDate" />
            </div>
          </div>

          <div class="field">
            <label>Executado por</label>
            <input v-model="form.executedBy" placeholder="Nome do responsável" />
          </div>

          <div class="field">
            <label>Observações iniciais</label>
            <textarea v-model="form.generalNotes" rows="2" placeholder="Contexto, semana especial, etc." style="resize:vertical" />
          </div>

          <div
            style="background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:.75rem 1rem; font-size:.82rem; color:var(--muted)"
          >
            Ao criar, todos os portais ativos serão adicionados automaticamente à sessão.
          </div>

        </div>
      </div>

      <div class="modal-footer">
        <button class="btn" @click="$emit('cancel')">Cancelar</button>
        <button class="btn primary" :disabled="!form.weekReference.trim() || props.saving" @click="save">
          {{ props.saving ? 'Criando...' : 'Criar sessão' }}
        </button>
      </div>
    </div>
  </div>
</template>
