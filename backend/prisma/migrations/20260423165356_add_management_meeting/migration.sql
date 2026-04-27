-- CreateTable
CREATE TABLE "ManagementMeeting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "riskItemId" INTEGER NOT NULL,
    "meetingDate" DATETIME NOT NULL,
    "meetingType" TEXT NOT NULL,
    "presentedBy" TEXT NOT NULL,
    "managementFeedback" TEXT,
    "actionRequired" BOOLEAN NOT NULL DEFAULT false,
    "actionDescription" TEXT,
    "nextFollowUp" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ManagementMeeting_riskItemId_fkey" FOREIGN KEY ("riskItemId") REFERENCES "RiskItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ManagementMeeting_riskItemId_idx" ON "ManagementMeeting"("riskItemId");

-- CreateIndex
CREATE INDEX "ManagementMeeting_meetingDate_idx" ON "ManagementMeeting"("meetingDate");

-- CreateIndex
CREATE INDEX "ManagementMeeting_status_idx" ON "ManagementMeeting"("status");
