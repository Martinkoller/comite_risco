-- CreateTable
CREATE TABLE "ChecklistPortal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "category" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MonitoringChecklist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "weekReference" TEXT NOT NULL,
    "checkDate" DATETIME NOT NULL,
    "executedBy" TEXT NOT NULL DEFAULT 'Gian',
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "generalNotes" TEXT,
    "totalPortals" INTEGER NOT NULL DEFAULT 0,
    "checkedPortals" INTEGER NOT NULL DEFAULT 0,
    "foundFindings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PortalCheckEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "checklistId" INTEGER NOT NULL,
    "portalId" INTEGER NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "hasNews" BOOLEAN NOT NULL DEFAULT false,
    "checkedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PortalCheckEntry_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "MonitoringChecklist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PortalCheckEntry_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "ChecklistPortal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChecklistFinding" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "checklistId" INTEGER NOT NULL,
    "portalEntryId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceReference" TEXT,
    "severity" TEXT,
    "requiresCR" BOOLEAN NOT NULL DEFAULT false,
    "riskItemId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'Identificado',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChecklistFinding_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "MonitoringChecklist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChecklistFinding_portalEntryId_fkey" FOREIGN KEY ("portalEntryId") REFERENCES "PortalCheckEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChecklistFinding_riskItemId_fkey" FOREIGN KEY ("riskItemId") REFERENCES "RiskItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistPortal_name_key" ON "ChecklistPortal"("name");

-- CreateIndex
CREATE INDEX "ChecklistPortal_active_idx" ON "ChecklistPortal"("active");

-- CreateIndex
CREATE INDEX "ChecklistPortal_sortOrder_idx" ON "ChecklistPortal"("sortOrder");

-- CreateIndex
CREATE INDEX "MonitoringChecklist_weekReference_idx" ON "MonitoringChecklist"("weekReference");

-- CreateIndex
CREATE INDEX "MonitoringChecklist_status_idx" ON "MonitoringChecklist"("status");

-- CreateIndex
CREATE INDEX "MonitoringChecklist_checkDate_idx" ON "MonitoringChecklist"("checkDate");

-- CreateIndex
CREATE UNIQUE INDEX "MonitoringChecklist_weekReference_key" ON "MonitoringChecklist"("weekReference");

-- CreateIndex
CREATE INDEX "PortalCheckEntry_checklistId_idx" ON "PortalCheckEntry"("checklistId");

-- CreateIndex
CREATE INDEX "PortalCheckEntry_portalId_idx" ON "PortalCheckEntry"("portalId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalCheckEntry_checklistId_portalId_key" ON "PortalCheckEntry"("checklistId", "portalId");

-- CreateIndex
CREATE INDEX "ChecklistFinding_checklistId_idx" ON "ChecklistFinding"("checklistId");

-- CreateIndex
CREATE INDEX "ChecklistFinding_portalEntryId_idx" ON "ChecklistFinding"("portalEntryId");

-- CreateIndex
CREATE INDEX "ChecklistFinding_riskItemId_idx" ON "ChecklistFinding"("riskItemId");

-- CreateIndex
CREATE INDEX "ChecklistFinding_status_idx" ON "ChecklistFinding"("status");
