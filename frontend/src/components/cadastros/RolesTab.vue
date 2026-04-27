<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-medium text-gray-900">Funções</h2>
      <button type="button" @click="openForm" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        + Nova Função
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
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in items" :key="item.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="editItem(item)" class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
              <button @click="deleteItem(item.id)" class="text-red-600 hover:text-red-900">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="items && items.length === 0" class="text-center py-8 text-gray-500">
        Nenhuma função cadastrada
      </div>
    </div>

    <RoleForm
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
import RoleForm from './RoleForm.vue'

const loading = ref(false)
const items = ref([])
const showForm = ref(false)
const editingItem = ref(null)

const fetchItems = async () => {
  loading.value = true
  try {
    const response = await api.get('/lookups/roles')
    items.value = response.data
  } catch (error) {
    console.error('Error fetching roles:', error)
  } finally {
    loading.value = false
  }
}

const openForm = () => {
  editingItem.value = null
  showForm.value = true
}

const editItem = (item) => {
  editingItem.value = item
  showForm.value = true
}

const deleteItem = async (id) => {
  if (!confirm('Tem certeza que deseja excluir esta função?')) return
  
  try {
    await api.delete(`/lookups/roles/${id}`)
    await fetchItems()
  } catch (error) {
    console.error('Error deleting role:', error)
    alert('Erro ao excluir função')
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
