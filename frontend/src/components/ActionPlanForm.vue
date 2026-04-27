<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold">Novo Plano de Ação</h2>
      </div>
      
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tema *</label>
          <input v-model="form.theme" type="text" class="input" placeholder="Tema do plano de ação" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Área Responsável *</label>
          <input v-model="form.responsibleArea" type="text" class="input" placeholder="Área responsável" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Responsável *</label>
          <input v-model="form.responsibleName" type="text" class="input" placeholder="Nome do responsável" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição da Ação *</label>
          <textarea v-model="form.actionDescription" rows="4" placeholder="Descreva a ação a ser executada" class="input" required></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Dependências</label>
          <textarea v-model="form.dependencies" rows="2" placeholder="Dependências identificadas" class="input"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data de Abertura *</label>
          <input v-model="form.openedAt" type="date" class="input" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prazo *</label>
          <input v-model="form.deadline" type="date" class="input" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status da Ação *</label>
          <select v-model="form.actionStatusId" class="input" required>
            <option value="">Selecione...</option>
            <option v-for="status in actionStatuses" :key="status.id" :value="status.id">
              {{ status.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Aprovado pela Direção em</label>
          <input v-model="form.directionApprovedAt" type="date" class="input" />
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
            {{ loading ? 'Salvando...' : 'Criar Plano de Ação' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { actionPlanService } from '@/services/actionPlanService'
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
const actionStatuses = ref([])

const form = ref({
  theme: '',
  responsibleArea: '',
  responsibleName: '',
  actionDescription: '',
  dependencies: '',
  openedAt: '',
  deadline: '',
  actionStatusId: null,
  directionApprovedAt: '',
  notes: '',
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const data = {
      ...form.value,
      riskItemId: props.riskItemId,
      openedAt: new Date(form.value.openedAt).toISOString(),
      deadline: new Date(form.value.deadline).toISOString(),
      directionApprovedAt: form.value.directionApprovedAt ? new Date(form.value.directionApprovedAt).toISOString() : null,
    }
    
    const response = await actionPlanService.create(data)
    emit('created', response.data)
    emit('close')
  } catch (error) {
    console.error('Error creating action plan:', error)
    alert('Erro ao criar plano de ação. Verifique os dados e tente novamente.')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await lookupStore.fetchLookups()
  actionStatuses.value = lookupStore.getActionStatuses()
})
</script>
