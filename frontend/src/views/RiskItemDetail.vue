<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { riskItemService } from '@/services/riskItemService'
import { poAnalysisService } from '@/services/poAnalysisService'
import { committeeDecisionService } from '@/services/committeeDecisionService'
import { actionPlanService } from '@/services/actionPlanService'
import { directionReviewService } from '@/services/directionReviewService'
import { useLookupStore } from '@/stores/lookupStore'
import { useToast } from '@/composables/useToast'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const lookup = useLookupStore()
const toast = useToast()

const item = ref(null)
const loading = ref(true)
const activeTab = ref('geral')

const tabs = [
  { key: 'geral', label: 'Dados Gerais' },
  { key: 'produtos', label: 'Produtos' },
  { key: 'analises', label: 'Análises dos POs' },
  { key: 'decisao', label: 'Decisão do Comitê' },
  { key: 'planos', label: 'Planos de Ação' },
  { key: 'direcao', label: 'Aprovação Direção' },
  { key: 'timeline', label: 'Timeline' },
]

onMounted(async () => {
  await lookup.fetchLookups()
  await loadItem()
})

async function loadItem() {
  loading.value = true
  try {
    const res = await riskItemService.getById(route.params.id)
    item.value = res.data
  } catch {
    toast.error('Item não encontrado.')
    router.push('/risk-items')
  } finally {
    loading.value = false
  }
}

// ── Helpers ──
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('pt-BR') : '—' }
function fmtDateTime(d) { return d ? new Date(d).toLocaleString('pt-BR') : '—' }
function sevBadge(code) { return code ? `badge-${code.toLowerCase()}` : 'badge-neutral' }
const finalSev = computed(() => item.value?.committeeDecision?.finalSeverity?.code || item.value?.preliminarySeverity?.code)

// ── Fast Track toggle ──
const ftLoading = ref(false)
async function toggleFastTrack() {
  if (!item.value) return
  const reason = item.value.isFastTrack ? null : prompt('Motivo do Fast Track:')
  if (!item.value.isFastTrack && !reason) return
  ftLoading.value = true
  try {
    await riskItemService.update(item.value.id, { isFastTrack: !item.value.isFastTrack, fastTrackReason: reason })
    await loadItem()
    toast.success(item.value.isFastTrack ? 'Fast Track desativado.' : 'Fast Track ativado!')
  } catch { toast.error('Erro ao atualizar Fast Track.') }
  finally { ftLoading.value = false }
}

// ── PO Analysis ──
const showPoForm = ref(false)
const editingPo = ref(null)
const poForm = ref(resetPoForm())
function resetPoForm() {
  return {
    riskItemId: route.params.id,
    analysisDate: new Date().toISOString().split('T')[0],
    poResponsible: '',
    productId: '',
    impactsProduct: 'Em avaliação',
    impactType: 'Funcional',
    impactLevel: 'Possível',
    needsImplementation: 'Talvez',
    nonComplianceRisk: false,
    operationalRisk: false,
    customerImpact: false,
    dependencies: '',
    doubtsAmbiguities: '',
    needsLegalReview: 'Não',
    suggestedSeverityId: '',
    recommendation: '',
    notes: '',
  }
}
function openPoNew() { editingPo.value = null; poForm.value = resetPoForm(); showPoForm.value = true }
function openPoEdit(po) {
  editingPo.value = po
  poForm.value = {
    ...po,
    analysisDate: po.analysisDate?.split('T')[0],
    suggestedSeverityId: po.suggestedSeverityId || '',
  }
  showPoForm.value = true
}
async function savePo() {
  try {
    const data = { ...poForm.value, riskItemId: Number(route.params.id), productId: Number(poForm.value.productId), suggestedSeverityId: poForm.value.suggestedSeverityId ? Number(poForm.value.suggestedSeverityId) : null }
    if (editingPo.value) await poAnalysisService.update(editingPo.value.id, data)
    else await poAnalysisService.create(data)
    toast.success('Análise salva!')
    showPoForm.value = false
    await loadItem()
  } catch { toast.error('Erro ao salvar análise.') }
}

// ── Committee Decision ──
const showDecForm = ref(false)
const decForm = ref(resetDecForm())
function resetDecForm() {
  return {
    riskItemId: route.params.id,
    meetingDate: new Date().toISOString().split('T')[0],
    finalSeverityId: '',
    impactedProducts: '',
    involvedPos: '',
    supportImpact: 'Não',
    csImpact: 'Não',
    marketingImpact: 'Não',
    legalTriggered: false,
    decisionText: '',
    hasAction: false,
    hasActionPlan: false,
    goesToDirection: false,
    mainResponsible: '',
    initialDeadline: '',
    committeeStatusId: '',
    notes: '',
    directionApproved: 'Pendente',
  }
}
function openDecForm() {
  const dec = item.value?.committeeDecision
  if (dec) {
    decForm.value = { ...dec, riskItemId: Number(route.params.id), meetingDate: dec.meetingDate?.split('T')[0], initialDeadline: dec.initialDeadline?.split('T')[0] || '', finalSeverityId: dec.finalSeverityId || '', committeeStatusId: dec.committeeStatusId || '' }
  } else {
    decForm.value = resetDecForm()
    // Pre-fill impactedProducts from products
    decForm.value.impactedProducts = (item.value?.products || []).map((p) => p.product?.name).join(', ')
  }
  showDecForm.value = true
}
async function saveDec() {
  try {
    const data = { ...decForm.value, riskItemId: Number(route.params.id), finalSeverityId: Number(decForm.value.finalSeverityId), committeeStatusId: Number(decForm.value.committeeStatusId), initialDeadline: decForm.value.initialDeadline || null }
    if (item.value?.committeeDecision) await committeeDecisionService.update(item.value.committeeDecision.id, data)
    else await committeeDecisionService.create(data)
    toast.success('Decisão do comitê salva!')
    showDecForm.value = false
    await loadItem()
  } catch { toast.error('Erro ao salvar decisão.') }
}

// ── Action Plan ──
const showPaForm = ref(false)
const editingPa = ref(null)
const paForm = ref(resetPaForm())
function resetPaForm() {
  return { riskItemId: route.params.id, theme: '', areaId: '', responsibleName: '', actionDescription: '', dependencies: '', openedAt: new Date().toISOString().split('T')[0], deadline: '', actionStatusId: '', notes: '' }
}
function openPaNew() { editingPa.value = null; paForm.value = resetPaForm(); showPaForm.value = true }
function openPaEdit(pa) { editingPa.value = pa; paForm.value = { ...pa, openedAt: pa.openedAt?.split('T')[0], deadline: pa.deadline?.split('T')[0], areaId: pa.areaId || '' }; showPaForm.value = true }
async function savePa() {
  try {
    const data = { ...paForm.value, riskItemId: Number(route.params.id), areaId: Number(paForm.value.areaId), actionStatusId: Number(paForm.value.actionStatusId) }
    if (editingPa.value) await actionPlanService.update(editingPa.value.id, data)
    else await actionPlanService.create(data)
    toast.success('Plano de ação salvo!')
    showPaForm.value = false
    await loadItem()
  } catch { toast.error('Erro ao salvar plano.') }
}

// ── Direction Review ──
const showDirForm = ref(false)
const dirForm = ref(resetDirForm())
function resetDirForm() {
  return { riskItemId: route.params.id, submittedAt: new Date().toISOString().split('T')[0], reviewedAt: '', approvalStatus: 'Pendente', requiresAdjustment: false, directionNotes: '', directorName: 'Marcelo Stivanello' }
}
function openDirNew() { dirForm.value = resetDirForm(); showDirForm.value = true }
async function saveDir() {
  try {
    const data = { ...dirForm.value, riskItemId: Number(route.params.id), reviewedAt: dirForm.value.reviewedAt || null }
    await directionReviewService.create(data)
    toast.success('Revisão da Direção registrada!')
    showDirForm.value = false
    await loadItem()
  } catch { toast.error('Erro ao salvar revisão.') }
}
</script>

<template>
  <div>
    <div v-if="loading" style="text-align:center; padding:3rem 0; color:var(--muted)">Carregando...</div>

    <template v-else-if="item">
      <!-- Cabeçalho do item -->
      <div class="page-header">
        <div style="display:flex; align-items:center; gap:.75rem; flex-wrap:wrap">
          <button class="btn ghost small" @click="router.push('/risk-items')">← Voltar</button>
          <div>
            <div style="display:flex; align-items:center; gap:.5rem">
              <h1 class="page-title">{{ item.code }}</h1>
              <span v-if="item.isFastTrack" class="badge badge-fast-track">⚡ Fast Track</span>
              <span v-if="finalSev" class="badge" :class="sevBadge(finalSev)">{{ finalSev }}</span>
            </div>
            <p class="page-subtitle">{{ item.title }}</p>
          </div>
        </div>
        <div class="row" style="gap:.5rem">
          <button
            class="btn small"
            :class="item.isFastTrack ? 'danger' : 'ghost'"
            :disabled="ftLoading"
            @click="toggleFastTrack"
          >{{ item.isFastTrack ? '⚡ Desativar FT' : '⚡ Fast Track' }}</button>
        </div>
      </div>

      <!-- Info rápida -->
      <div class="card" style="margin-bottom:1rem">
        <div class="row wrap center" style="gap:1.5rem">
          <div><div class="small text-muted">Status</div><span class="badge badge-neutral">{{ item.monitoringStatus }}</span></div>
          <div><div class="small text-muted">Fonte</div><div class="small bold">{{ item.eventSource?.name }}</div></div>
          <div><div class="small text-muted">Tipo</div><div class="small bold">{{ item.eventType?.name }}</div></div>
          <div><div class="small text-muted">Identificado em</div><div class="small bold">{{ fmtDate(item.dateIdentified) }}</div></div>
          <div><div class="small text-muted">Prazo Oficial</div><div class="small bold">{{ fmtDate(item.officialDeadline) }}</div></div>
          <div><div class="small text-muted">Responsável</div><div class="small bold">{{ item.monitoringResponsible }}</div></div>
        </div>
      </div>

      <!-- Abas -->
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
          {{ tab.label }}
          <span v-if="tab.key === 'analises'" class="badge badge-neutral" style="margin-left:.25rem; font-size:.65rem">{{ (item.poAnalyses||[]).length }}</span>
          <span v-if="tab.key === 'planos'" class="badge badge-neutral" style="margin-left:.25rem; font-size:.65rem">{{ (item.actionPlans||[]).length }}</span>
          <span v-if="tab.key === 'direcao'" class="badge badge-neutral" style="margin-left:.25rem; font-size:.65rem">{{ (item.directionReviews||[]).length }}</span>
        </button>
      </div>

      <!-- Tab: Dados Gerais -->
      <div v-if="activeTab === 'geral'" class="card stack">
        <div class="grid-form">
          <div class="field"><label>Título</label><div>{{ item.title }}</div></div>
          <div class="field"><label>Publicado em</label><div>{{ fmtDate(item.publishedAt) }}</div></div>
          <div class="field"><label>Sev. Preliminar</label><span class="badge" :class="sevBadge(item.preliminarySeverity?.code)">{{ item.preliminarySeverity?.code || '—' }}</span></div>
          <div class="field"><label>Requer Análise PO</label><div>{{ item.requiresPoAnalysis ? 'Sim' : 'Não' }}</div></div>
        </div>
        <div class="field"><label>Resumo</label><div style="white-space:pre-line">{{ item.summary }}</div></div>
        <div v-if="item.initialNotes" class="field"><label>Observações Iniciais</label><div style="white-space:pre-line">{{ item.initialNotes }}</div></div>
        <div v-if="item.isFastTrack && item.fastTrackReason" class="field"><label>Motivo Fast Track</label><div style="color:var(--danger)">{{ item.fastTrackReason }}</div></div>
      </div>

      <!-- Tab: Produtos -->
      <div v-if="activeTab === 'produtos'" class="card">
        <EmptyState v-if="!(item.products||[]).length" title="Nenhum produto vinculado" />
        <div v-else class="table-wrap">
          <table>
            <thead><tr><th>Produto</th><th>Plataforma</th><th>Segmento</th><th>PO</th></tr></thead>
            <tbody>
              <tr v-for="p in item.products" :key="p.productId">
                <td style="font-weight:600">{{ p.product?.name }}</td>
                <td><span v-if="p.product?.platform" class="badge badge-info">{{ p.product.platform }}</span></td>
                <td class="small">{{ p.product?.segment || '—' }}</td>
                <td class="small">{{ p.product?.owner?.name || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Análises dos POs -->
      <div v-if="activeTab === 'analises'">
        <div class="page-header" style="margin-bottom:.75rem">
          <span class="small text-muted">{{ (item.poAnalyses||[]).length }} análise(s)</span>
          <button class="btn primary small" @click="openPoNew">+ Nova Análise</button>
        </div>
        <EmptyState v-if="!(item.poAnalyses||[]).length" title="Nenhuma análise registrada" description="Cada PO deve registrar sua análise para o produto afetado." />
        <div v-else class="stack">
          <div v-for="po in item.poAnalyses" :key="po.id" class="card">
            <div class="card-header">
              <div>
                <strong>{{ po.product?.name }}</strong>
                <span class="small text-muted" style="margin-left:.5rem">{{ po.poResponsible }} · {{ fmtDate(po.analysisDate) }}</span>
              </div>
              <div class="row" style="gap:.35rem">
                <span class="badge" :class="sevBadge(po.suggestedSeverity?.code)">{{ po.suggestedSeverity?.code || '—' }}</span>
                <button class="btn small ghost" @click="openPoEdit(po)">Editar</button>
              </div>
            </div>
            <div class="grid-form" style="font-size:.85rem">
              <div><span class="text-muted">Impacta produto: </span><strong>{{ po.impactsProduct }}</strong></div>
              <div><span class="text-muted">Nível: </span><strong>{{ po.impactLevel }}</strong></div>
              <div><span class="text-muted">Tipo: </span><strong>{{ po.impactType }}</strong></div>
              <div><span class="text-muted">Implementação: </span><strong>{{ po.needsImplementation }}</strong></div>
              <div><span class="text-muted">Jurídico: </span><strong>{{ po.needsLegalReview }}</strong></div>
            </div>
            <div class="row wrap" style="gap:.35rem; margin-top:.5rem">
              <span v-if="po.nonComplianceRisk" class="badge badge-danger">⚠ Não conformidade</span>
              <span v-if="po.operationalRisk" class="badge badge-warning">⚠ Risco operacional</span>
              <span v-if="po.customerImpact" class="badge badge-warning">⚠ Impacto cliente</span>
            </div>
            <div v-if="po.recommendation" style="margin-top:.5rem; font-size:.85rem"><span class="text-muted">Recomendação: </span>{{ po.recommendation }}</div>
          </div>
        </div>
      </div>

      <!-- Tab: Decisão do Comitê -->
      <div v-if="activeTab === 'decisao'">
        <div class="page-header" style="margin-bottom:.75rem">
          <span class="small text-muted">{{ item.committeeDecision ? 'Decisão registrada' : 'Sem decisão' }}</span>
          <button class="btn primary small" @click="openDecForm">{{ item.committeeDecision ? 'Editar Decisão' : '+ Registrar Decisão' }}</button>
        </div>
        <EmptyState v-if="!item.committeeDecision" title="Decisão ainda não registrada" description="Registre a decisão oficial após a reunião de quinta à tarde." />
        <div v-else class="card stack">
          <div class="grid-form">
            <div class="field"><label>Data da Reunião</label><div>{{ fmtDate(item.committeeDecision.meetingDate) }}</div></div>
            <div class="field"><label>Severidade Final</label><span class="badge" :class="sevBadge(item.committeeDecision.finalSeverity?.code)">{{ item.committeeDecision.finalSeverity?.code }}</span></div>
            <div class="field"><label>Status</label><span class="badge badge-neutral">{{ item.committeeDecision.committeeStatus?.name }}</span></div>
            <div class="field"><label>Responsável</label><div>{{ item.committeeDecision.mainResponsible }}</div></div>
          </div>
          <div class="field"><label>Decisão</label><div style="white-space:pre-line">{{ item.committeeDecision.decisionText }}</div></div>
          <div class="row wrap" style="gap:.5rem">
            <span class="badge" :class="item.committeeDecision.hasAction ? 'badge-warning' : 'badge-neutral'">{{ item.committeeDecision.hasAction ? '✓ Há ação' : 'Sem ação' }}</span>
            <span class="badge" :class="item.committeeDecision.hasActionPlan ? 'badge-warning' : 'badge-neutral'">{{ item.committeeDecision.hasActionPlan ? '✓ Plano de ação' : 'Sem plano' }}</span>
            <span class="badge" :class="item.committeeDecision.goesToDirection ? 'badge-info' : 'badge-neutral'">{{ item.committeeDecision.goesToDirection ? '📋 Vai para Direção' : 'Sem Direção' }}</span>
            <span class="badge" :class="item.committeeDecision.legalTriggered ? 'badge-danger' : 'badge-neutral'">{{ item.committeeDecision.legalTriggered ? '⚖ Jurídico acionado' : 'Sem jurídico' }}</span>
          </div>
          <div class="grid-form">
            <div><span class="text-muted small">Suporte: </span><strong>{{ item.committeeDecision.supportImpact }}</strong></div>
            <div><span class="text-muted small">CS: </span><strong>{{ item.committeeDecision.csImpact }}</strong></div>
            <div><span class="text-muted small">Marketing: </span><strong>{{ item.committeeDecision.marketingImpact }}</strong></div>
          </div>
        </div>
      </div>

      <!-- Tab: Planos de Ação -->
      <div v-if="activeTab === 'planos'">
        <div class="page-header" style="margin-bottom:.75rem">
          <span class="small text-muted">{{ (item.actionPlans||[]).length }} plano(s)</span>
          <button class="btn primary small" @click="openPaNew">+ Novo Plano (PA)</button>
        </div>
        <EmptyState v-if="!(item.actionPlans||[]).length" title="Nenhum plano de ação" description="Crie planos de ação quando o comitê decidir que há ação." />
        <div v-else class="stack">
          <div v-for="pa in item.actionPlans" :key="pa.id" class="card">
            <div class="card-header">
              <div>
                <strong style="color:var(--primary)">{{ pa.code }}</strong>
                <span class="small text-muted" style="margin-left:.5rem">{{ pa.theme }}</span>
              </div>
              <div class="row" style="gap:.35rem">
                <span class="badge badge-neutral" style="font-size:.7rem">{{ pa.actionStatus?.name }}</span>
                <button class="btn small ghost" @click="openPaEdit(pa)">Editar</button>
              </div>
            </div>
            <div class="grid-form" style="font-size:.85rem">
              <div><span class="text-muted">Área: </span><strong>{{ pa.area?.name }}</strong></div>
              <div><span class="text-muted">Responsável: </span><strong>{{ pa.responsibleName }}</strong></div>
              <div><span class="text-muted">Abertura: </span><strong>{{ fmtDate(pa.openedAt) }}</strong></div>
              <div><span class="text-muted">Prazo: </span><strong>{{ fmtDate(pa.deadline) }}</strong></div>
            </div>
            <div style="font-size:.85rem; margin-top:.5rem">{{ pa.actionDescription }}</div>
          </div>
        </div>
      </div>

      <!-- Tab: Aprovação Direção -->
      <div v-if="activeTab === 'direcao'">
        <div class="page-header" style="margin-bottom:.75rem">
          <span class="small text-muted">{{ (item.directionReviews||[]).length }} revisão(ões)</span>
          <button class="btn primary small" @click="openDirNew">+ Registrar Revisão</button>
        </div>
        <EmptyState v-if="!(item.directionReviews||[]).length" title="Nenhuma revisão da Direção" description="Registre o retorno da Direção após a reunião de terça." />
        <div v-else class="stack">
          <div v-for="dr in item.directionReviews" :key="dr.id" class="card">
            <div class="card-header">
              <div>
                <strong>{{ dr.directorName }}</strong>
                <span class="small text-muted" style="margin-left:.5rem">Submetido: {{ fmtDate(dr.submittedAt) }}</span>
              </div>
              <span class="badge" :class="dr.approvalStatus === 'Aprovado' ? 'badge-success' : dr.approvalStatus === 'Ajustar e retornar' ? 'badge-warning' : 'badge-neutral'">{{ dr.approvalStatus }}</span>
            </div>
            <div class="grid-form" style="font-size:.85rem">
              <div v-if="dr.reviewedAt"><span class="text-muted">Revisado em: </span><strong>{{ fmtDate(dr.reviewedAt) }}</strong></div>
              <div><span class="text-muted">Requer ajuste: </span><strong>{{ dr.requiresAdjustment ? 'Sim' : 'Não' }}</strong></div>
            </div>
            <div v-if="dr.directionNotes" style="font-size:.85rem; margin-top:.5rem"><span class="text-muted">Observações: </span>{{ dr.directionNotes }}</div>
          </div>
        </div>
      </div>

      <!-- Tab: Timeline -->
      <div v-if="activeTab === 'timeline'" class="card">
        <EmptyState v-if="!(item.timelineEvents||[]).length" title="Nenhum evento na timeline" />
        <div v-else class="timeline">
          <div v-for="ev in item.timelineEvents" :key="ev.id" class="timeline-item">
            <div class="timeline-dot">
              <div class="dot"></div>
              <div class="line"></div>
            </div>
            <div class="timeline-content">
              <div class="tl-date">{{ fmtDateTime(ev.eventDate) }}</div>
              <div class="tl-desc">{{ ev.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal: PO Analysis -->
    <div v-if="showPoForm" class="modal-backdrop" @click.self="showPoForm=false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingPo ? 'Editar Análise' : 'Nova Análise do PO' }}</h2>
          <button class="modal-close" @click="showPoForm=false">✕</button>
        </div>
        <div class="modal-body stack">
          <div class="grid-form">
            <div class="field"><label>Data da Análise</label><input type="date" v-model="poForm.analysisDate" /></div>
            <div class="field">
              <label>PO Responsável</label>
              <select v-model="poForm.poResponsible">
                <option value="">Selecione...</option>
                <option v-for="p in lookup.participants" :key="p.id" :value="p.name">{{ p.name }}</option>
              </select>
            </div>
            <div class="field">
              <label>Produto</label>
              <select v-model="poForm.productId">
                <option value="">Selecione...</option>
                <option v-for="p in lookup.products" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div class="field">
              <label>Impacta produto?</label>
              <select v-model="poForm.impactsProduct"><option>Sim</option><option>Não</option><option>Em avaliação</option></select>
            </div>
            <div class="field">
              <label>Tipo de impacto</label>
              <select v-model="poForm.impactType"><option>Funcional</option><option>Técnico</option><option>Operacional</option><option>Comunicação</option><option>Misto</option></select>
            </div>
            <div class="field">
              <label>Nível de impacto</label>
              <select v-model="poForm.impactLevel"><option>Real</option><option>Provável</option><option>Possível</option></select>
            </div>
            <div class="field">
              <label>Precisa implementação?</label>
              <select v-model="poForm.needsImplementation"><option>Sim</option><option>Não</option><option>Talvez</option></select>
            </div>
            <div class="field">
              <label>Precisa Jurídico?</label>
              <select v-model="poForm.needsLegalReview"><option>Sim</option><option>Não</option><option>Talvez</option></select>
            </div>
            <div class="field">
              <label>Severidade sugerida</label>
              <select v-model="poForm.suggestedSeverityId">
                <option value="">—</option>
                <option v-for="s in lookup.severities" :key="s.id" :value="s.id">{{ s.code }} – {{ s.name }}</option>
              </select>
            </div>
          </div>
          <div class="row wrap" style="gap:1rem">
            <label style="display:flex;align-items:center;gap:.4rem;font-size:.875rem;font-weight:500;text-transform:none;letter-spacing:0">
              <input type="checkbox" v-model="poForm.nonComplianceRisk" style="width:auto" /> Risco não conformidade
            </label>
            <label style="display:flex;align-items:center;gap:.4rem;font-size:.875rem;font-weight:500;text-transform:none;letter-spacing:0">
              <input type="checkbox" v-model="poForm.operationalRisk" style="width:auto" /> Risco operacional
            </label>
            <label style="display:flex;align-items:center;gap:.4rem;font-size:.875rem;font-weight:500;text-transform:none;letter-spacing:0">
              <input type="checkbox" v-model="poForm.customerImpact" style="width:auto" /> Impacto ao cliente
            </label>
          </div>
          <div class="field"><label>Dependências</label><textarea v-model="poForm.dependencies" rows="2" /></div>
          <div class="field"><label>Dúvidas / Ambiguidades</label><textarea v-model="poForm.doubtsAmbiguities" rows="2" /></div>
          <div class="field"><label>Recomendação</label><textarea v-model="poForm.recommendation" rows="2" /></div>
          <div class="field"><label>Observações</label><textarea v-model="poForm.notes" rows="2" /></div>
        </div>
        <div class="modal-footer">
          <button class="btn ghost" @click="showPoForm=false">Cancelar</button>
          <button class="btn primary" @click="savePo">Salvar</button>
        </div>
      </div>
    </div>

    <!-- Modal: Committee Decision -->
    <div v-if="showDecForm" class="modal-backdrop" @click.self="showDecForm=false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2 class="modal-title">{{ item?.committeeDecision ? 'Editar Decisão' : 'Registrar Decisão do Comitê' }}</h2>
          <button class="modal-close" @click="showDecForm=false">✕</button>
        </div>
        <div class="modal-body stack">
          <div class="grid-form">
            <div class="field"><label>Data da Reunião</label><input type="date" v-model="decForm.meetingDate" /></div>
            <div class="field">
              <label>Severidade Final</label>
              <select v-model="decForm.finalSeverityId">
                <option value="">Selecione...</option>
                <option v-for="s in lookup.severities" :key="s.id" :value="s.id">{{ s.code }} – {{ s.name }}</option>
              </select>
            </div>
            <div class="field">
              <label>Status do Comitê</label>
              <select v-model="decForm.committeeStatusId">
                <option value="">Selecione...</option>
                <option v-for="s in lookup.committeeStatuses" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="field"><label>Responsável Principal</label><input type="text" v-model="decForm.mainResponsible" /></div>
            <div class="field"><label>Prazo Inicial</label><input type="date" v-model="decForm.initialDeadline" /></div>
          </div>
          <div class="field"><label>Produtos Impactados</label><input type="text" v-model="decForm.impactedProducts" /></div>
          <div class="field"><label>POs Envolvidos</label><input type="text" v-model="decForm.involvedPos" /></div>
          <div class="grid-form">
            <div class="field"><label>Impacto Suporte</label><select v-model="decForm.supportImpact"><option>Não</option><option>Baixo</option><option>Médio</option><option>Alto</option></select></div>
            <div class="field"><label>Impacto CS</label><select v-model="decForm.csImpact"><option>Não</option><option>Baixo</option><option>Médio</option><option>Alto</option></select></div>
            <div class="field"><label>Impacto Marketing</label><select v-model="decForm.marketingImpact"><option>Não</option><option>Baixo</option><option>Médio</option><option>Alto</option></select></div>
          </div>
          <div class="row wrap" style="gap:1.25rem">
            <label style="display:flex;align-items:center;gap:.4rem;font-size:.875rem;font-weight:500;text-transform:none;letter-spacing:0"><input type="checkbox" v-model="decForm.hasAction" style="width:auto" /> Há ação</label>
            <label style="display:flex;align-items:center;gap:.4rem;font-size:.875rem;font-weight:500;text-transform:none;letter-spacing:0"><input type="checkbox" v-model="decForm.hasActionPlan" style="width:auto" /> Há plano de ação</label>
            <label style="display:flex;align-items:center;gap:.4rem;font-size:.875rem;font-weight:500;text-transform:none;letter-spacing:0"><input type="checkbox" v-model="decForm.goesToDirection" style="width:auto" /> Vai para Direção</label>
            <label style="display:flex;align-items:center;gap:.4rem;font-size:.875rem;font-weight:500;text-transform:none;letter-spacing:0"><input type="checkbox" v-model="decForm.legalTriggered" style="width:auto" /> Jurídico acionado</label>
          </div>
          <div class="field"><label>Decisão Oficial</label><textarea v-model="decForm.decisionText" rows="4" placeholder="Descreva a decisão oficial do comitê..." /></div>
          <div class="field"><label>Observações</label><textarea v-model="decForm.notes" rows="2" /></div>
        </div>
        <div class="modal-footer">
          <button class="btn ghost" @click="showDecForm=false">Cancelar</button>
          <button class="btn primary" @click="saveDec">Salvar</button>
        </div>
      </div>
    </div>

    <!-- Modal: Action Plan -->
    <div v-if="showPaForm" class="modal-backdrop" @click.self="showPaForm=false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingPa ? `Editar ${editingPa.code}` : 'Novo Plano de Ação (PA)' }}</h2>
          <button class="modal-close" @click="showPaForm=false">✕</button>
        </div>
        <div class="modal-body stack">
          <div class="grid-form">
            <div class="field"><label>Tema</label><input type="text" v-model="paForm.theme" /></div>
            <div class="field">
              <label>Área Responsável</label>
              <select v-model="paForm.areaId">
                <option value="">Selecione...</option>
                <option v-for="a in lookup.areas" :key="a.id" :value="a.id">{{ a.name }}</option>
              </select>
            </div>
            <div class="field"><label>Responsável</label><input type="text" v-model="paForm.responsibleName" /></div>
            <div class="field">
              <label>Status</label>
              <select v-model="paForm.actionStatusId">
                <option value="">Selecione...</option>
                <option v-for="s in lookup.actionStatuses" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="field"><label>Data Abertura</label><input type="date" v-model="paForm.openedAt" /></div>
            <div class="field"><label>Prazo</label><input type="date" v-model="paForm.deadline" /></div>
          </div>
          <div class="field"><label>Descrição da Ação</label><textarea v-model="paForm.actionDescription" rows="3" /></div>
          <div class="field"><label>Dependências</label><textarea v-model="paForm.dependencies" rows="2" /></div>
          <div class="field"><label>Observações</label><textarea v-model="paForm.notes" rows="2" /></div>
        </div>
        <div class="modal-footer">
          <button class="btn ghost" @click="showPaForm=false">Cancelar</button>
          <button class="btn primary" @click="savePa">Salvar</button>
        </div>
      </div>
    </div>

    <!-- Modal: Direction Review -->
    <div v-if="showDirForm" class="modal-backdrop" @click.self="showDirForm=false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Registrar Revisão da Direção</h2>
          <button class="modal-close" @click="showDirForm=false">✕</button>
        </div>
        <div class="modal-body stack">
          <div class="grid-form">
            <div class="field"><label>Submetido em</label><input type="date" v-model="dirForm.submittedAt" /></div>
            <div class="field"><label>Revisado em</label><input type="date" v-model="dirForm.reviewedAt" /></div>
            <div class="field">
              <label>Status da Aprovação</label>
              <select v-model="dirForm.approvalStatus"><option>Aprovado</option><option>Pendente</option><option>Ajustar e retornar</option></select>
            </div>
            <div class="field"><label>Diretor</label><input type="text" v-model="dirForm.directorName" /></div>
          </div>
          <label style="display:flex;align-items:center;gap:.4rem;font-size:.875rem;font-weight:500;text-transform:none;letter-spacing:0">
            <input type="checkbox" v-model="dirForm.requiresAdjustment" style="width:auto" /> Requer ajuste
          </label>
          <div class="field"><label>Observações da Direção</label><textarea v-model="dirForm.directionNotes" rows="3" /></div>
        </div>
        <div class="modal-footer">
          <button class="btn ghost" @click="showDirForm=false">Cancelar</button>
          <button class="btn primary" @click="saveDir">Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>
