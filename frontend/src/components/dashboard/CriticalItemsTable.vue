<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function sevCode(item) {
  return item.finalSeverity?.code || item.riskItem?.committeeDecision?.finalSeverity?.code || '—'
}

function sevClass(item) {
  const c = sevCode(item)
  return c !== '—' ? `badge badge-${c.toLowerCase()}` : 'badge badge-neutral'
}

function statusLabel(item) {
  return item.committeeStatus?.name || item.riskItem?.monitoringStatus || '—'
}

function goToItem(item) {
  const id = item.riskItemId || item.riskItem?.id || item.id
  if (id) router.push(`/risk-items/${id}`)
}

function itemCode(item) {
  return item.riskItem?.code || item.code || '—'
}

function itemTitle(item) {
  return item.riskItem?.title || item.title || '—'
}
</script>

<template>
  <div class="crit-table-wrap">
    <div v-if="loading" class="crit-loading">Carregando itens críticos...</div>
    <div v-else-if="!items.length" class="crit-empty">
      <span style="font-size:2rem">✅</span>
      <p>Nenhum item P1 ativo no momento</p>
    </div>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Título</th>
            <th>Severidade</th>
            <th>Reunião</th>
            <th>Status</th>
            <th>Fast Track</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            class="crit-row"
            @click="goToItem(item)"
          >
            <td>
              <span class="item-code p1">{{ itemCode(item) }}</span>
            </td>
            <td>
              <span class="item-title">{{ itemTitle(item) }}</span>
            </td>
            <td>
              <span :class="sevClass(item)">{{ sevCode(item) }}</span>
            </td>
            <td>{{ fmtDate(item.meetingDate) }}</td>
            <td>
              <span class="badge badge-neutral">{{ statusLabel(item) }}</span>
            </td>
            <td>
              <span v-if="item.riskItem?.isFastTrack" class="badge badge-fast-track">⚡ Fast Track</span>
              <span v-else class="text-muted" style="font-size:.8rem">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.crit-loading,
.crit-empty {
  padding: 2rem;
  text-align: center;
  color: var(--muted);
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.crit-row {
  cursor: pointer;
}
.item-code {
  font-size: 0.75rem;
  font-weight: 700;
}
.item-code.p1 {
  color: var(--p1);
}
.item-title {
  max-width: 320px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
