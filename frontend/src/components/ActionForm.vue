<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold">Nova Ação / Devolutiva</h2>
      </div>
      
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Ação *</label>
          <select v-model="form.actionType" class="input" required>
            <option value="">Selecione...</option>
            <option value="PO Devolution">Devolutiva de PO</option>
            <option value="Committee Note">Nota do Comitê</option>
            <option value="Direction Note">Nota da Direção</option>
            <option value="General Note">Nota Geral</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input v-model="form.title" type="text" placeholder="Título da ação" class="input" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
          <textarea v-model="form.description" rows="4" placeholder="Descrição detalhada da ação/devolutiva" class="input" required></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Responsável *</label>
          <select v-model="form.responsible" class="input" required>
            <option value="">Selecione...</option>
            <option v-for="participant in participants" :key="participant.id" :value="participant.name">
              {{ participant.name }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
            <select v-model="form.priority" class="input">
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="form.status" class="input">
              <option value="Pendente">Pendente</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
          <input v-model="form.dueDate" type="date" class="input" />
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" :disabled="loading" class="btn btn-primary">
            {{ loading ? 'Salvando...' : 'Criar Ação' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { actionService } from '@/services/actionService'
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
const participants = ref([])

const form = ref({
  actionType: '',
  title: '',
  description: '',
  responsible: '',
  status: 'Pendente',
  priority: 'Média',
  dueDate: '',
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const data = {
      ...form.value,
      riskItemId: props.riskItemId,
      dueDate: form.value.dueDate ? new Date(form.value.dueDate).toISOString() : null,
    }
    
    const response = await actionService.create(data)
    emit('created', response.data)
    emit('close')
  } catch (error) {
    console.error('Error creating action:', error)
    alert('Erro ao criar ação. Verifique os dados e tente novamente.')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await lookupStore.fetchLookups()
  participants.value = lookupStore.getParticipants()
})
</script>
