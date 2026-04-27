<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-medium text-gray-900">Participantes</h2>
      <button type="button" @click="openForm" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        + Novo Participante
      </button>
    </div>


    <div v-if="loading" class="text-center py-8 text-gray-500">
      Carregando...
    </div>

    <div v-else class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in items" :key="item.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.role }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="item.active ? 'text-green-600' : 'text-red-600'" class="text-sm">
                {{ item.active ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="editItem(item)" class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
              <button @click="deleteItem(item.id)" class="text-red-600 hover:text-red-900">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="items && items.length === 0" class="text-center py-8 text-gray-500">
        Nenhum participante cadastrado
      </div>
    </div>

    <ParticipantForm
      v-show="showForm"
      :item="editingItem"
      @close="closeForm"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import ParticipantForm from './ParticipantForm.vue'

const loading = ref(false)
const items = ref([])
const showForm = ref(false)
const editingItem = ref(null)

const openForm = () => {
  editingItem.value = null
  showForm.value = true
}

const fetchItems = async () => {
  loading.value = true
  try {
    const response = await api.get('/lookups/participants')
    items.value = response.data
  } catch (error) {
    console.error('Error fetching participants:', error)
  } finally {
    loading.value = false
  }
}

const editItem = (item) => {
  editingItem.value = item
  showForm.value = true
}

const deleteItem = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este participante?')) return
  
  try {
    await api.delete(`/lookups/participants/${id}`)
    await fetchItems()
  } catch (error) {
    console.error('Error deleting participant:', error)
    alert('Erro ao excluir participante')
  }
}

const closeForm = () => {
  showForm.value = false
  editingItem.value = null
}

const handleSaved = () => {
  closeForm()
  fetchItems()
}

onMounted(() => {
  fetchItems()
})
</script>
