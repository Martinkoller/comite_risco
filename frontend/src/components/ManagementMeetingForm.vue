<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold">Nova Reunião de Gestão (RG)</h2>
      </div>
      
      <form @submit.prevent="handleSubmit" class="p-6 space-y-8">
        <!-- Section: Detalhes da Reunião -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Detalhes da Reunião</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data da Reunião *</label>
              <input v-model="form.meetingDate" type="date" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select v-model="form.status" class="input">
                <option value="Pendente">Pendente</option>
                <option value="Realizada">Realizada</option>
                <option value="Devolutiva">Devolutiva</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Pauta a ser levada</label>
            <textarea v-model="form.agenda" rows="3" placeholder="Notas e lembretes para a reunião" class="input"></textarea>
          </div>
        </div>

        <!-- Section: CRs a Vincular -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">CRs a Vincular (Aguardando Direção) *</h3>
          <div v-if="loadingRiskItems" class="text-sm text-gray-500 py-4">Carregando CRs...</div>
          <div v-else-if="availableRiskItems.length === 0" class="text-sm text-gray-500 py-4 bg-gray-50 rounded-lg">
            Nenhum CR com status "Aguardando Direção" disponível
          </div>
          <div v-else class="space-y-2 max-h-64 overflow-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
            <label v-for="riskItem in availableRiskItems" :key="riskItem.id" class="flex items-center gap-3 cursor-pointer hover:bg-white p-3 rounded transition-colors">
              <input 
                type="checkbox" 
                :value="riskItem.id" 
                v-model="form.riskItemIds"
                class="rounded w-4 h-4"
              />
              <div class="flex-1">
                <span class="font-medium text-gray-900">{{ riskItem.code }}</span>
                <span class="text-gray-600 ml-2">{{ riskItem.title }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Section: Feedback e Ações -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Feedback e Ações</h3>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Feedback da Gestão</label>
            <textarea v-model="form.managementFeedback" rows="3" placeholder="Feedback e orientações da gestão sobre os itens" class="input"></textarea>
          </div>
          <div class="mt-4 flex items-center gap-2">
            <input v-model="form.actionRequired" type="checkbox" id="actionRequired" class="rounded w-4 h-4" />
            <label for="actionRequired" class="text-sm font-medium text-gray-700">Requer Ação?</label>
          </div>
          <div v-if="form.actionRequired" class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição da Ação</label>
            <textarea v-model="form.actionDescription" rows="3" placeholder="Descreva a ação necessária" class="input"></textarea>
          </div>
        </div>

        <!-- Section: Acompanhamento -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">Acompanhamento</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Próximo Acompanhamento</label>
              <input v-model="form.nextFollowUp" type="date" class="input" />
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Notas Adicionais</label>
            <textarea v-model="form.notes" rows="2" placeholder="Notas adicionais sobre a reunião" class="input"></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="sticky bottom-0 bg-white pt-4 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" :disabled="loading || form.riskItemIds.length === 0" class="btn btn-primary">
            {{ loading ? 'Salvando...' : 'Criar Reunião' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { managementMeetingService } from '@/services/managementMeetingService'

const emit = defineEmits(['close', 'created'])

const loading = ref(false)
const loadingRiskItems = ref(true)
const availableRiskItems = ref([])

const form = ref({
  meetingDate: '',
  agenda: '',
  managementFeedback: '',
  actionRequired: false,
  actionDescription: '',
  nextFollowUp: '',
  status: 'Pendente',
  notes: '',
  riskItemIds: [],
})

const handleSubmit = async () => {
  if (form.value.riskItemIds.length === 0) {
    alert('Selecione pelo menos um CR para vincular à reunião.')
    return
  }

  loading.value = true
  try {
    const data = {
      ...form.value,
      meetingDate: new Date(form.value.meetingDate).toISOString(),
      nextFollowUp: form.value.nextFollowUp ? new Date(form.value.nextFollowUp).toISOString() : null,
    }
    
    const response = await managementMeetingService.create(data)
    emit('created', response.data)
    emit('close')
  } catch (error) {
    console.error('Error creating management meeting:', error)
    alert('Erro ao criar reunião de gestão. Verifique os dados e tente novamente.')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loadingRiskItems.value = true
  try {
    const response = await managementMeetingService.getAvailableRiskItems()
    availableRiskItems.value = response.data
  } catch (error) {
    console.error('Error fetching available risk items:', error)
  } finally {
    loadingRiskItems.value = false
  }
})
</script>
