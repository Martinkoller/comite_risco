<script setup>
import { ref, computed, onMounted } from 'vue'
import { riskItemService } from '@/services/riskItemService'
import { useLookupStore } from '@/stores/lookupStore'
import { useToast } from '@/composables/useToast'

const props = defineProps({ item: { type: Object, default: null } })
const emit = defineEmits(['saved', 'cancel'])

const lookup = useLookupStore()
const toast = useToast()
const loading = ref(false)
const selectedProducts = ref([])

const form = ref(resetForm())

function resetForm() {
  return {
    dateIdentified: new Date().toISOString().split('T')[0],
    monitoringResponsible: '',
    eventSourceId: null,
    eventTypeId: null,
    title: '',
    summary: '',
    initialNotes: '',
    preliminarySeverityId: null,
    monitoringStatus: 'Identificado',
    requiresPoAnalysis: true,
    isFastTrack: false,
    fastTrackReason: '',
  }
}

onMounted(async () => {
  await lookup.fetchLookups()
  if (props.item) {
    form.value = {
      dateIdentified: props.item.dateIdentified?.split('T')[0] || '',
      monitoringResponsible: props.item.monitoringResponsible || '',
      eventSourceId: props.item.eventSourceId || null,
      eventTypeId: props.item.eventTypeId || null,
      title: props.item.title || '',
      summary: props.item.summary || '',
      initialNotes: props.item.initialNotes || '',
      preliminarySeverityId: props.item.preliminarySeverityId || null,
      monitoringStatus: props.item.monitoringStatus || 'Identificado',
      requiresPoAnalysis: props.item.requiresPoAnalysis ?? true,
      isFastTrack: props.item.isFastTrack || false,
      fastTrackReason: props.item.fastTrackReason || '',
    }
    selectedProducts.value = (props.item.products || []).map((p) => p.productId)
  }
})

async function submit() {
  if (!form.value.title.trim() || !form.value.summary.trim()) {
    toast.error('Título e Resumo são obrigatórios.')
    return
  }
  loading.value = true
  try {
    const payload = { ...form.value, productIds: selectedProducts.value }
    if (props.item) {
      await riskItemService.update(props.item.id, payload)
    } else {
      await riskItemService.create(payload)
    }
    emit('saved')
  } catch {
    toast.error('Erro ao salvar o item.')
  } finally {
    loading.value = false
  }
}

function toggleProduct(id) {
  const idx = selectedProducts.value.indexOf(id)
  if (idx > -1) selectedProducts.value.splice(idx, 1)
  else selectedProducts.value.push(id)
}

const activeStatuses = computed(() =>
  lookup.committeeStatuses.filter((s) => s.active !== false).map((s) => s.name)
)
</script>

<template>
  <div class="stack">
    <div class="grid-form">
      <div class="field">
        <label>Data de Identificação *</label>
        <input type="date" v-model="form.dateIdentified" />
      </div>
      <div class="field">
        <label>Responsável pelo Monitoramento *</label>
        <select v-model="form.monitoringResponsible">
          <option value="">Selecione...</option>
          <option v-for="p in lookup.participants" :key="p.id" :value="p.name">{{ p.name }}</option>
        </select>
      </div>
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
      <input type="text" v-model="form.title" placeholder="Título do item de risco" />
    </div>
    <div class="field">
      <label>Resumo *</label>
      <textarea v-model="form.summary" rows="3" placeholder="Descreva o evento de risco..."></textarea>
    </div>
    <div class="field">
      <label>Notas Iniciais</label>
      <textarea v-model="form.initialNotes" rows="2" placeholder="Observações adicionais..."></textarea>
    </div>

    <div class="grid-form">
      <div class="field">
        <label>Severidade Preliminar</label>
        <select v-model="form.preliminarySeverityId">
          <option :value="null">Selecione...</option>
          <option v-for="s in lookup.severities" :key="s.id" :value="s.id">{{ s.code }} – {{ s.name }}</option>
        </select>
      </div>
      <div class="field">
        <label>Status de Monitoramento *</label>
        <select v-model="form.monitoringStatus">
          <option v-if="activeStatuses.length === 0" value="Identificado">Identificado</option>
          <option v-for="s in activeStatuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
    </div>

    <div class="field">
      <label>Produtos Impactados</label>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px,1fr)); gap:.5rem; border:1px solid var(--border); border-radius:8px; padding:.75rem; max-height:200px; overflow-y:auto">
        <label
          v-for="p in lookup.products"
          :key="p.id"
          style="display:flex; align-items:center; gap:.5rem; font-size:.85rem; font-weight:500; text-transform:none; letter-spacing:0; cursor:pointer"
        >
          <input type="checkbox" :checked="selectedProducts.includes(p.id)" @change="toggleProduct(p.id)" style="width:auto" />
          <span>{{ p.name }}</span>
          <span style="color:var(--muted); font-size:.75rem; font-weight:400">{{ p.platform }}</span>
        </label>
        <div v-if="!lookup.products.length" class="text-muted small" style="text-align:center; padding:.5rem">Nenhum produto cadastrado.</div>
      </div>
    </div>

    <div style="display:flex; flex-direction:column; gap:.5rem">
      <label style="display:flex; align-items:center; gap:.5rem; text-transform:none; font-size:.875rem; font-weight:500">
        <input type="checkbox" v-model="form.requiresPoAnalysis" style="width:auto" />
        Requer análise dos POs
      </label>
      <label style="display:flex; align-items:center; gap:.5rem; text-transform:none; font-size:.875rem; font-weight:500">
        <input type="checkbox" v-model="form.isFastTrack" style="width:auto" />
        ⚡ Fast Track
      </label>
    </div>

    <div v-if="form.isFastTrack" class="field">
      <label>Motivo do Fast Track</label>
      <textarea v-model="form.fastTrackReason" rows="2" placeholder="Justifique a ativação do Fast Track..."></textarea>
    </div>

    <div class="modal-footer" style="padding:0; border:none; margin-top:.5rem">
      <button class="btn ghost" @click="emit('cancel')" :disabled="loading">Cancelar</button>
      <button class="btn primary" @click="submit" :disabled="loading">
        {{ loading ? 'Salvando...' : (item ? 'Atualizar' : 'Criar Item') }}
      </button>
    </div>
  </div>
</template>
