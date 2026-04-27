<script setup>
defineProps({
  meeting: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

function approvalBadge(status) {
  if (!status) return 'badge-neutral'
  const map = { Aprovado: 'badge-success', Reprovado: 'badge-danger', Pendente: 'badge-warning', 'Em análise': 'badge-info' }
  return map[status] || 'badge-neutral'
}
</script>

<template>
  <div>
    <div v-if="loading" class="ms-loading">Carregando reunião de gestão...</div>
    <div v-else-if="!meeting" class="ms-empty">
      <span style="font-size:1.5rem">📋</span>
      <p>Nenhuma reunião de gestão registrada.</p>
    </div>
    <div v-else class="ms-body">
      <div class="ms-header">
        <div>
          <div class="ms-date">{{ fmtDate(meeting.meetingDate) }}</div>
          <div class="ms-title">{{ meeting.title || 'Reunião de Gestão' }}</div>
        </div>
        <span :class="`badge ${approvalBadge(meeting.approvalStatus)}`">
          {{ meeting.approvalStatus || 'Pendente' }}
        </span>
      </div>

      <div v-if="meeting.summary" class="ms-summary">{{ meeting.summary }}</div>

      <div v-if="meeting.participants?.length" class="ms-section">
        <div class="ms-section-label">Participantes</div>
        <div class="ms-participants">
          <span
            v-for="p in meeting.participants"
            :key="p.id || p.name"
            class="ms-participant"
          >{{ p.name || p }}</span>
        </div>
      </div>

      <div v-if="meeting.decisions?.length" class="ms-section">
        <div class="ms-section-label">Decisões</div>
        <div class="ms-decisions">
          <div v-for="(dec, i) in meeting.decisions" :key="i" class="ms-decision-item">
            <span class="ms-bullet">·</span>
            <span>{{ dec }}</span>
          </div>
        </div>
      </div>

      <div v-if="meeting.notes" class="ms-section">
        <div class="ms-section-label">Observações</div>
        <div class="ms-notes">{{ meeting.notes }}</div>
      </div>

      <div class="ms-footer">
        <span v-if="meeting.directorName" class="ms-director">
          Diretor: <strong>{{ meeting.directorName }}</strong>
        </span>
        <span v-if="meeting.reviewedAt" class="ms-reviewed">
          Revisado em {{ fmtDate(meeting.reviewedAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ms-loading,
.ms-empty {
  padding: 1.5rem;
  text-align: center;
  color: var(--muted);
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}
.ms-body {
  display: grid;
  gap: 0.75rem;
}
.ms-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}
.ms-date {
  font-size: 0.75rem;
  color: var(--muted);
  text-transform: capitalize;
}
.ms-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin-top: 0.1rem;
}
.ms-summary {
  font-size: 0.875rem;
  color: var(--text);
  line-height: 1.5;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.65rem 0.85rem;
}
.ms-section {
  display: grid;
  gap: 0.35rem;
}
.ms-section-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
}
.ms-participants {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}
.ms-participant {
  font-size: 0.78rem;
  background: var(--border);
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  color: var(--text);
}
.ms-decisions {
  display: grid;
  gap: 0.3rem;
}
.ms-decision-item {
  display: flex;
  gap: 0.4rem;
  font-size: 0.85rem;
  line-height: 1.4;
}
.ms-bullet {
  color: var(--primary);
  font-weight: 700;
  flex-shrink: 0;
}
.ms-notes {
  font-size: 0.82rem;
  color: var(--muted);
  font-style: italic;
}
.ms-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: var(--muted);
  border-top: 1px solid var(--border);
  padding-top: 0.65rem;
  margin-top: 0.1rem;
}
</style>
