import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PORTAL_INCLUDE = {
  portal: true,
  findings: {
    include: {
      riskItem: { select: { id: true, code: true, title: true, monitoringStatus: true } },
    },
    orderBy: { createdAt: 'asc' },
  },
};

const CHECKLIST_INCLUDE = {
  portalEntries: {
    include: PORTAL_INCLUDE,
    orderBy: { portal: { sortOrder: 'asc' } },
  },
  findings: {
    include: {
      portalEntry: { include: { portal: true } },
      riskItem: { select: { id: true, code: true, title: true, monitoringStatus: true } },
    },
    orderBy: { createdAt: 'desc' },
  },
};

class ChecklistService {
  // ── Portais ──────────────────────────────────────────────

  async getAllPortals({ includeInactive = false } = {}) {
    return prisma.checklistPortal.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async createPortal(data) {
    const { name, url, category, description, sortOrder } = data;
    return prisma.checklistPortal.create({
      data: { name, url, category, description, sortOrder: sortOrder ?? 0 },
    });
  }

  async updatePortal(id, data) {
    const { name, url, category, description, active, sortOrder } = data;
    return prisma.checklistPortal.update({
      where: { id: Number(id) },
      data: { name, url, category, description, active, sortOrder },
    });
  }

  async deletePortal(id) {
    // soft-delete via active = false
    return prisma.checklistPortal.update({
      where: { id: Number(id) },
      data: { active: false },
    });
  }

  // ── Checklists ────────────────────────────────────────────

  async getAll() {
    return prisma.monitoringChecklist.findMany({
      include: {
        _count: { select: { portalEntries: true, findings: true } },
      },
      orderBy: { checkDate: 'desc' },
    });
  }

  async getById(id) {
    const checklist = await prisma.monitoringChecklist.findUnique({
      where: { id: Number(id) },
      include: CHECKLIST_INCLUDE,
    });
    if (!checklist) throw new Error('Checklist não encontrado');
    return checklist;
  }

  async getByWeek(weekReference) {
    return prisma.monitoringChecklist.findUnique({
      where: { weekReference },
      include: CHECKLIST_INCLUDE,
    });
  }

  async create(data) {
    const { weekReference, checkDate, executedBy, generalNotes } = data;

    // Busca portais ativos para pré-popular as entradas
    const portals = await prisma.checklistPortal.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    const checklist = await prisma.monitoringChecklist.create({
      data: {
        weekReference,
        checkDate: new Date(checkDate),
        executedBy: executedBy || 'Gian',
        generalNotes,
        totalPortals: portals.length,
        status: 'Pendente',
        portalEntries: {
          create: portals.map((p) => ({ portalId: p.id })),
        },
      },
      include: CHECKLIST_INCLUDE,
    });

    return checklist;
  }

  async update(id, data) {
    const { executedBy, generalNotes, status, checkDate } = data;
    const checklist = await prisma.monitoringChecklist.update({
      where: { id: Number(id) },
      data: {
        ...(executedBy !== undefined && { executedBy }),
        ...(generalNotes !== undefined && { generalNotes }),
        ...(status !== undefined && { status }),
        ...(checkDate !== undefined && { checkDate: new Date(checkDate) }),
      },
    });
    return checklist;
  }

  // ── Entrada de portal (check individual) ─────────────────

  async checkPortalEntry(entryId, data) {
    const { checked, hasNews, notes } = data;

    const entry = await prisma.portalCheckEntry.update({
      where: { id: Number(entryId) },
      data: {
        checked: checked ?? true,
        hasNews: hasNews ?? false,
        notes,
        checkedAt: checked ? new Date() : null,
      },
      include: PORTAL_INCLUDE,
    });

    // Recalcula contadores do checklist pai
    await this._recalcCounters(entry.checklistId);

    return entry;
  }

  // ── Achados (Findings) ────────────────────────────────────

  async createFinding(data) {
    const { checklistId, portalEntryId, title, description, sourceReference, severity, requiresCR } = data;

    const finding = await prisma.checklistFinding.create({
      data: {
        checklistId: Number(checklistId),
        portalEntryId: Number(portalEntryId),
        title,
        description,
        sourceReference,
        severity,
        requiresCR: requiresCR ?? false,
        status: 'Identificado',
      },
      include: {
        portalEntry: { include: { portal: true } },
        riskItem: { select: { id: true, code: true, title: true } },
      },
    });

    // Marca a entrada do portal como "com novidade"
    await prisma.portalCheckEntry.update({
      where: { id: Number(portalEntryId) },
      data: { hasNews: true, checked: true, checkedAt: new Date() },
    });

    await this._recalcCounters(Number(checklistId));

    return finding;
  }

  async updateFinding(id, data) {
    const { title, description, sourceReference, severity, requiresCR, status, riskItemId } = data;

    const finding = await prisma.checklistFinding.update({
      where: { id: Number(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(sourceReference !== undefined && { sourceReference }),
        ...(severity !== undefined && { severity }),
        ...(requiresCR !== undefined && { requiresCR }),
        ...(status !== undefined && { status }),
        ...(riskItemId !== undefined && { riskItemId: riskItemId ? Number(riskItemId) : null }),
      },
      include: {
        portalEntry: { include: { portal: true } },
        riskItem: { select: { id: true, code: true, title: true } },
      },
    });

    // Recalcula hasNews da entry: tem novidade se ainda há findings não-descartados
    const activeFindings = await prisma.checklistFinding.count({
      where: { portalEntryId: finding.portalEntryId, status: { not: 'Descartado' } },
    });
    await prisma.portalCheckEntry.update({
      where: { id: finding.portalEntryId },
      data: { hasNews: activeFindings > 0 },
    });

    await this._recalcCounters(finding.checklistId);
    return finding;
  }

  async deleteFinding(id) {
    const finding = await prisma.checklistFinding.findUnique({ where: { id: Number(id) } });
    if (!finding) throw new Error('Achado não encontrado');

    await prisma.checklistFinding.delete({ where: { id: Number(id) } });

    // Se a entry do portal não tem mais findings, reverte hasNews para false
    const remaining = await prisma.checklistFinding.count({
      where: { portalEntryId: finding.portalEntryId },
    });
    if (remaining === 0) {
      await prisma.portalCheckEntry.update({
        where: { id: finding.portalEntryId },
        data: { hasNews: false },
      });
    }

    await this._recalcCounters(finding.checklistId);
  }

  // ── Vincular CR existente a um achado ─────────────────────

  async linkRiskItem(findingId, riskItemId) {
    const finding = await prisma.checklistFinding.update({
      where: { id: Number(findingId) },
      data: {
        riskItemId: Number(riskItemId),
        status: 'CR Aberto',
        requiresCR: true,
      },
      include: {
        portalEntry: { include: { portal: true } },
        riskItem: { select: { id: true, code: true, title: true } },
      },
    });
    await this._recalcCounters(finding.checklistId);
    return finding;
  }

  // ── Helpers ───────────────────────────────────────────────

  async _recalcCounters(checklistId) {
    const [checkedCount, findingsCount] = await Promise.all([
      prisma.portalCheckEntry.count({ where: { checklistId, checked: true } }),
      prisma.checklistFinding.count({ where: { checklistId } }),
    ]);

    const total = await prisma.portalCheckEntry.count({ where: { checklistId } });

    // Auto-status
    let status;
    if (checkedCount === 0) status = 'Pendente';
    else if (checkedCount < total) status = 'Em execução';
    else status = 'Concluído';

    await prisma.monitoringChecklist.update({
      where: { id: checklistId },
      data: { checkedPortals: checkedCount, foundFindings: findingsCount, totalPortals: total, status },
    });
  }
}

export default new ChecklistService();
