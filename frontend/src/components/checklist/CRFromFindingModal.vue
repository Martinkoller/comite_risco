<script setup>
import { ref, onMounted } from 'vue'
import { riskItemService } from '@/services/riskItemService'
import { useLookupStore } from '@/stores/lookupStore'

const props = defineProps({
  finding: { type: Object, required: true },
  portalName: { type: String, default: '' },
})

const emit = defineEmits(['saved', 'cancel'])

const lookup = useLookupStore()
const loading = ref(false)
const loadingLookups = ref(true)
const selectedProducts = ref([])

const form = ref({
  title: '',
  summary: '',
  weekReference: '',
  dateIdentified: new Date().toISOString().split('T')[0],
  monitoringResponsible: 'Gian',
  eventSourceId: null,
  eventTypeId: null,
  preliminarySeverityId: null,
  monitoringStatus: 'Identificado',
  requiresPoAnalysis: true,
  isFastTrack: false,
  fastTrackReason: '',
  initialNotes: '',
})

function currentWeekRef() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7)
  return `${String(week).padStart(2, '0')}/${now.getFullYear()}`
}

onMounted(async () => {
  await lookup.fetchLookups()
  loadingLookups.value = false

  // Pré-preenche a partir do achado
  form.value.title = props.finding.title || ''
  form.value.summary = props.finding.description || ''
  form.value.weekReference = currentWeekRef()
  form.value.initialNotes = props.finding.sourceReference
    ? `Ref: ${props.finding.sourceReference}${props.portalName ? ` · Portal: ${props.portalName}` : ''}`
    : (props.portalName ? `Portal: ${props.portalName}` : '')

  // Pré-seleciona severidade se o achado já tem uma estimada
  if (props.finding.severity) {
    const sev = lookup.severities.find(s => s.code === props.finding.severity)
    if (sev) form.value.preliminarySeverityId = sev.id
  }

  // Fast Track automático se P1
  if (props.finding.severity === 'P1') {
    form.value.isFastTrack = true
    form.value.fastTrackReason = `Identificado como P1 no CheckList da semana ${currentWeekRef()}`
  }

  // Tenta pré-selecionar "Grupo Oficial" ou primeira fonte que contenha o nome do portal
  if (props.portalName && lookup.eventSources.length) {
    const match = lookup.eventSources.find(s =>
      props.portalName.toLowerCase().includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(props.portalName.toLowerCase().split('/')[0])
    )
    if (match) form.value.eventSourceId = match.id
  }
})

function toggleProduct(id) {
  const idx = selectedProducts.value.indexOf(id)
  if (idx > -1) selectedProducts.value.splice(idx, 1)
  else selectedProducts.value.push(id)
}

const errorMsg = ref('')

async function submit() {
  errorMsg.value = ''
  if (!form.value.title.trim()) { errorMsg.value = 'Título é obrigatório.'; return }
  if (!form.value.summary.trim()) { errorMsg.value = 'Resumo é obrigatório.'; return }
  if (!form.value.eventSourceId) { errorMsg.value = 'Selecione a Fonte do Evento.'; return }
  if (!form.value.eventTypeId) { errorMsg.value = 'Selecione o Tipo de Evento.'; return }
  if (!form.value.weekReference.trim()) { errorMsg.value = 'Semana de referência é obrigatória.'; return }

  loading.value = true
  try {
    const payload = {
      ...form.value,
      eventSourceId: Number(form.value.eventSourceId),
      eventTypeId: Number(form.value.eventTypeId),
      preliminarySeverityId: form.value.preliminarySeverityId ? Number(form.value.preliminarySeverityId) : null,
      productIds: selectedProducts.value,
      dateIdentified: form.value.dateIdentified,
    }
    const res = await riskItemService.create(payload)
    const created = res?.data ?? res
    emit('saved', created)
  } catch (e) {
    errorMsg.value = e?.error || e?.message || 'Erro ao criar o CR.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="modal-backdrop" @mousedown.self="$emit('cancel')">
    <div class="modal modal-lg" style="width:min(96vw,780px); max-height:90vh">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Abrir CR a partir do achado</h2>
          <p style="font-size:.78rem; color:var(--muted); margin:.1rem 0 0">
            {{ finding.title }}
            <span v-if="portalName"> · {{ portalName }}</span>
          </p>
        </div>
        <button class="modal-close" @click="$emit('cancel')">✕</button>
      </div>

      <div class="modal-body" style="overflow-y:auto; max-height:calc(90vh - 120px)">
        <div v-if="loadingLookups" style="text-align:center; padding:2rem; color:var(--muted)">
          Carregando dados...
        </div>

        <div v-else class="stack" style="gap:.85rem">

          <!-- Alerta dados pré-preenchidos -->
          <div style="background:var(--p3-bg); border:1px solid var(--p3-border); border-radius:8px; padding:.6rem 1rem; font-size:.82rem; color:var(--text)">
            ✅ Dados pré-preenchidos a partir do achado. Revise e complete antes de criar.
          </div>

          <div class="grid-2">
            <div class="field">
              <label>Semana de Referência *</label>
              <input v-model="form.weekReference" placeholder="Ex: 17/2026" />
            </div>
            <div class="field">
              <label>Data de Identificação *</label>
              <input type="date" v-model="form.dateIdentified" />
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label>Responsável pelo Monitoramento *</label>
              <select v-model="form.monitoringResponsible">
                <option value="">Selecione...</option>
                <option v-for="p in lookup.participants" :key="p.id" :value="p.name">{{ p.name }}</option>
              </select>
            </div>
            <div class="field">
              <label>Severidade Preliminar</label>
              <select v-model="form.preliminarySeverityId">
                <option :value="null">— Não definida —</option>
                <option v-for="s in lookup.severities" :key="s.id" :value="s.id">
                  {{ s.code }} – {{ s.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label>Fonte do Evento *</label>
              <select v-model="form.eventSourceId">
                <option :value="null">Selecione...</option>
                <option v-for="s in lookup.eventSources" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="field">
              <label>Tipo de Evento *</label>
              <select v-model="form.eventTypeId">
                <option :value="null">Selecione...</option>
                <option v-for="t in lookup.eventTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>Título *</label>
            <input v-model="form.title" placeholder="Título do item de risco" />
          </div>

          <div class="field">
            <label>Resumo *</label>
            <textarea v-model="form.summary" rows="3" placeholder="Descreva o evento de risco..." style="resize:vertical" />
          </div>

          <div class="field">
            <label>Notas Iniciais</label>
            <textarea v-model="form.initialNotes" rows="2" placeholder="Observações adicionais..." style="resize:vertical" />
          </div>

          <div class="field">
            <label>Produtos Impactados</label>
            <div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:.5rem; border:1px solid var(--border); border-radius:8px; padding:.75rem">
              <label
                v-for="p in lookup.products"
                :key="p.id"
                style="display:flex; align-items:center; gap:.5rem; font-size:.85rem; font-weight:500; text-transform:none; letter-spacing:0; cursor:pointer"
              >
                <input type="checkbox" :checked="selectedProducts.includes(p.id)" @change="toggleProduct(p.id)" style="width:auto" />
                <span>{{ p.name }}</span>
                <span style="color:var(--muted); font-size:.75rem; font-weight:400">{{ p.platform }}</span>
              </label>
            </div>
          </div>

          <div style="display:flex; gap:1.25rem; flex-wrap:wrap">
            <label style="display:flex; align-items:center; gap:.5rem; font-size:.875rem; font-weight:500; text-transform:none; letter-spacing:0; cursor:pointer">
              <input type="checkbox" v-model="form.requiresPoAnalysis" style="width:auto" />
              Requer análise dos POs
            </label>
            <label style="display:flex; align-items:center; gap:.5rem; font-size:.875rem; font-weight:500; text-transform:none; letter-spacing:0; cursor:pointer">
              <input type="checkbox" v-model="form.isFastTrack" style="width:auto" />
              ⚡ Fast Track
            </label>
          </div>

          <div v-if="form.isFastTrack" class="field">
            <label>Motivo do Fast Track</label>
            <textarea v-model="form.fastTrackReason" rows="2" style="resize:vertical" />
          </div>

          <div v-if="errorMsg" class="field-error" style="font-size:.82rem; padding:.5rem .75rem; background:var(--p1-bg); border:1px solid var(--p1-border); border-radius:6px">
            ⚠️ {{ errorMsg }}
          </div>

        </div>
      </div>

      <div class="modal-footer">
        <button class="btn" @click="$emit('cancel')" :disabled="loading">Cancelar</button>
        <button class="btn primary" @click="submit" :disabled="loading || loadingLookups">
          {{ loading ? 'Criando CR...' : '✅ Criar CR' }}
        </button>
      </div>
    </div>
  </div>
</template>
