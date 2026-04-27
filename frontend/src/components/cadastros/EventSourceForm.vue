<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold">{{ item ? 'Editar' : 'Nova' }} Fonte do Evento</h2>
      </div>
      
      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input v-model="form.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div class="flex items-center">
          <input v-model="form.active" type="checkbox" id="active" class="rounded w-4 h-4 mr-2" />
          <label for="active" class="text-sm text-gray-700">Ativo</label>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
            Cancelar
          </button>
          <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const props = defineProps({
  item: Object,
})

const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const form = ref({
  name: '',
  active: true,
})

const handleSubmit = async () => {
  loading.value = true
  try {
    if (props.item) {
      await api.put(`/lookups/event-sources/${props.item.id}`, form.value)
    } else {
      await api.post('/lookups/event-sources', form.value)
    }
    emit('saved')
  } catch (error) {
    console.error('Error saving event source:', error)
    alert('Erro ao salvar fonte')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.item) {
    form.value = {
      name: props.item.name,
      active: props.item.active,
    }
  }
})
</script>
