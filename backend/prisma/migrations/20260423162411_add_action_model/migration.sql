-- CreateTable
CREATE TABLE "Action" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "riskItemId" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsible" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "priority" TEXT NOT NULL DEFAULT 'Média',
    "dueDate" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Action_riskItemId_fkey" FOREIGN KEY ("riskItemId") REFERENCES "RiskItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Action_riskItemId_idx" ON "Action"("riskItemId");

-- CreateIndex
CREATE INDEX "Action_actionType_idx" ON "Action"("actionType");

-- CreateIndex
CREATE INDEX "Action_status_idx" ON "Action"("status");

-- CreateIndex
CREATE INDEX "Action_dueDate_idx" ON "Action"("dueDate");
