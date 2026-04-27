<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
      <div class="p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold">Nova Análise do PO</h2>
      </div>
      
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data da Análise *</label>
          <input v-model="form.analysisDate" type="date" class="input" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Responsável PO *</label>
          <select v-model="form.poResponsible" class="input" required>
            <option value="">Selecione...</option>
            <option v-for="po in productOwners" :key="po.id" :value="po.name">
              {{ po.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
          <select v-model="form.productId" class="input" required>
            <option value="">Selecione...</option>
            <option v-for="product in products" :key="product.id" :value="product.id">
              {{ product.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Impacta Produto? *</label>
          <select v-model="form.impactsProduct" class="input" required>
            <option value="">Selecione...</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
            <option value="Em avaliação">Em avaliação</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Impacto *</label>
          <select v-model="form.impactType" class="input" required>
            <option value="">Selecione...</option>
            <option value="Funcional">Funcional</option>
            <option value="Técnico">Técnico</option>
            <option value="Operacional">Operacional</option>
            <option value="Comunicação">Comunicação</option>
            <option value="Misto">Misto</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nível de Impacto *</label>
          <select v-model="form.impactLevel" class="input" required>
            <option value="">Selecione...</option>
            <option value="Real">Real</option>
            <option value="Provável">Provável</option>
            <option value="Possível">Possível</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Necessita Implementação? *</label>
          <select v-model="form.needsImplementation" class="input" required>
            <option value="">Selecione...</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
            <option value="Talvez">Talvez</option>
          </select>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="flex items-center gap-2">
            <input v-model="form.nonComplianceRisk" type="checkbox" id="nonComplianceRisk" class="rounded" />
            <label for="nonComplianceRisk" class="text-sm font-medium text-gray-700">Risco de Não Conformidade</label>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="form.operationalRisk" type="checkbox" id="operationalRisk" class="rounded" />
            <label for="operationalRisk" class="text-sm font-medium text-gray-700">Risco Operacional</label>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="form.customerImpact" type="checkbox" id="customerImpact" class="rounded" />
            <label for="customerImpact" class="text-sm font-medium text-gray-700">Impacto ao Cliente</label>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Dependências</label>
          <textarea v-model="form.dependencies" rows="2" placeholder="Dependências identificadas" class="input"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Dúvidas/Ambiguidades</label>
          <textarea v-model="form.doubtsAmbiguities" rows="2" placeholder="Dúvidas ou ambiguidades" class="input"></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Necessita Revisão Legal? *</label>
          <select v-model="form.needsLegalReview" class="input" required>
            <option value="">Selecione...</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
            <option value="Talvez">Talvez</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Severidade Sugerida</label>
          <select v-model="form.suggestedSeverityId" class="input">
            <option value="">Selecione...</option>
            <option v-for="severity in severities" :key="severity.id" :value="severity.id">
              {{ severity.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Recomendação</label>
          <textarea v-model="form.recommendation" rows="3" placeholder="Recomendações do PO" class="input"></textarea>
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
            {{ loading ? 'Salvando...' : 'Criar Análise' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { poAnalysisService } from '@/services/poAnalysisService'
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
const productOwners = ref([])
const products = ref([])
const severities = ref([])

const form = ref({
  analysisDate: '',
  poResponsible: '',
  productId: null,
  impactsProduct: '',
  impactType: '',
  impactLevel: '',
  needsImplementation: '',
  nonComplianceRisk: false,
  operationalRisk: false,
  customerImpact: false,
  dependencies: '',
  doubtsAmbiguities: '',
  needsLegalReview: '',
  suggestedSeverityId: null,
  recommendation: '',
  notes: '',
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const data = {
      ...form.value,
      riskItemId: props.riskItemId,
      analysisDate: new Date(form.value.analysisDate).toISOString(),
    }
    
    const response = await poAnalysisService.create(data)
    emit('created', response.data)
    emit('close')
  } catch (error) {
    console.error('Error creating PO analysis:', error)
    alert('Erro ao criar análise do PO. Verifique os dados e tente novamente.')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await lookupStore.fetchLookups()
  productOwners.value = lookupStore.getProductOwners()
  products.value = lookupStore.getProducts()
  severities.value = lookupStore.getSeverities()
})
</script>
