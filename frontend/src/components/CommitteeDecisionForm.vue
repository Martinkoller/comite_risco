<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold">Nova Decisão do Comitê</h2>
      </div>
      
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data da Reunião *</label>
          <input v-model="form.meetingDate" type="date" class="input" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Severidade Final *</label>
          <select v-model="form.finalSeverityId" class="input" required>
            <option value="">Selecione...</option>
            <option v-for="severity in severities" :key="severity.id" :value="severity.id">
              {{ severity.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Produtos Impactados *</label>
          <input v-model="form.impactedProducts" type="text" class="input" placeholder="Liste os produtos impactados" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">POs Envolvidos *</label>
          <input v-model="form.involvedPos" type="text" class="input" placeholder="Liste os POs envolvidos" required />
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Impacto Suporte *</label>
            <select v-model="form.supportImpact" class="input" required>
              <option value="">Selecione...</option>
              <option value="Não">Não</option>
              <option value="Baixo">Baixo</option>
              <option value="Médio">Médio</option>
              <option value="Alto">Alto</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Impacto CS *</label>
            <select v-model="form.csImpact" class="input" required>
              <option value="">Selecione...</option>
              <option value="Não">Não</option>
              <option value="Baixo">Baixo</option>
              <option value="Médio">Médio</option>
              <option value="Alto">Alto</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Impacto Marketing *</label>
            <select v-model="form.marketingImpact" class="input" required>
              <option value="">Selecione...</option>
              <option value="Não">Não</option>
              <option value="Baixo">Baixo</option>
              <option value="Médio">Médio</option>
              <option value="Alto">Alto</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <input v-model="form.legalTriggered" type="checkbox" id="legalTriggered" class="rounded" />
          <label for="legalTriggered" class="text-sm font-medium text-gray-700">Legal Acionado?</label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Decisão *</label>
          <textarea v-model="form.decisionText" rows="4" placeholder="Descreva a decisão do comitê" class="input" required></textarea>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="flex items-center gap-2">
            <input v-model="form.hasAction" type="checkbox" id="hasAction" class="rounded" />
            <label for="hasAction" class="text-sm font-medium text-gray-700">Tem Ação?</label>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="form.hasActionPlan" type="checkbox" id="hasActionPlan" class="rounded" />
            <label for="hasActionPlan" class="text-sm font-medium text-gray-700">Tem Plano de Ação?</label>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="form.goesToDirection" type="checkbox" id="goesToDirection" class="rounded" />
            <label for="goesToDirection" class="text-sm font-medium text-gray-700">Vai para Direção?</label>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Responsável Principal *</label>
          <input v-model="form.mainResponsible" type="text" class="input" placeholder="Nome do responsável principal" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prazo Inicial</label>
          <input v-model="form.initialDeadline" type="date" class="input" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status do Comitê *</label>
          <select v-model="form.committeeStatusId" class="input" required>
            <option value="">Selecione...</option>
            <option v-for="status in committeeStatuses" :key="status.id" :value="status.id">
              {{ status.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea v-model="form.notes" rows="2" placeholder="Notas adicionais" class="input"></textarea>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" :disabled="loading" class="btn btn-primary">
            {{ loading ? 'Salvando...' : 'Criar Decisão' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { committeeDecisionService } from '@/services/committeeDecisionService'
import { useLookupStore } from '@/stores/lookupStore'

const props = defineProps({
  riskItemId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['close', 'created'])

const lookupStore = useLookupStore()

const loading = ref(false)
const severities = ref([])
const committeeStatuses = ref([])

const form = ref({
  meetingDate: '',
  finalSeverityId: null,
  impactedProducts: '',
  involvedPos: '',
  supportImpact: '',
  csImpact: '',
  marketingImpact: '',
  legalTriggered: false,
  decisionText: '',
  hasAction: false,
  hasActionPlan: false,
  goesToDirection: false,
  mainResponsible: '',
  initialDeadline: '',
  committeeStatusId: null,
  notes: '',
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const data = {
      ...form.value,
      riskItemId: props.riskItemId,
      meetingDate: new Date(form.value.meetingDate).toISOString(),
      initialDeadline: form.value.initialDeadline ? new Date(form.value.initialDeadline).toISOString() : null,
    }
    
    const response = await committeeDecisionService.create(data)
    emit('created', response.data)
    emit('close')
  } catch (error) {
    console.error('Error creating committee decision:', error)
    alert('Erro ao criar decisão do comitê. Verifique os dados e tente novamente.')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await lookupStore.fetchLookups()
  severities.value = lookupStore.getSeverities()
  committeeStatuses.value = lookupStore.getCommitteeStatuses()
})
</script>
