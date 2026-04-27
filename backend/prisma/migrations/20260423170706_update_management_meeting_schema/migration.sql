/*
  Warnings:

  - You are about to drop the column `meetingType` on the `ManagementMeeting` table. All the data in the column will be lost.
  - You are about to drop the column `presentedBy` on the `ManagementMeeting` table. All the data in the column will be lost.
  - You are about to drop the column `riskItemId` on the `ManagementMeeting` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ManagementMeetingRiskItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "managementMeetingId" INTEGER NOT NULL,
    "riskItemId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ManagementMeetingRiskItem_managementMeetingId_fkey" FOREIGN KEY ("managementMeetingId") REFERENCES "ManagementMeeting" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ManagementMeetingRiskItem_riskItemId_fkey" FOREIGN KEY ("riskItemId") REFERENCES "RiskItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ManagementMeeting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "meetingDate" DATETIME NOT NULL,
    "agenda" TEXT,
    "managementFeedback" TEXT,
    "actionRequired" BOOLEAN NOT NULL DEFAULT false,
    "actionDescription" TEXT,
    "nextFollowUp" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ManagementMeeting" ("actionDescription", "actionRequired", "createdAt", "id", "managementFeedback", "meetingDate", "nextFollowUp", "notes", "status", "updatedAt") SELECT "actionDescription", "actionRequired", "createdAt", "id", "managementFeedback", "meetingDate", "nextFollowUp", "notes", "status", "updatedAt" FROM "ManagementMeeting";
DROP TABLE "ManagementMeeting";
ALTER TABLE "new_ManagementMeeting" RENAME TO "ManagementMeeting";
CREATE INDEX "ManagementMeeting_meetingDate_idx" ON "ManagementMeeting"("meetingDate");
CREATE INDEX "ManagementMeeting_status_idx" ON "ManagementMeeting"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ManagementMeetingRiskItem_managementMeetingId_idx" ON "ManagementMeetingRiskItem"("managementMeetingId");

-- CreateIndex
CREATE INDEX "ManagementMeetingRiskItem_riskItemId_idx" ON "ManagementMeetingRiskItem"("riskItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ManagementMeetingRiskItem_managementMeetingId_riskItemId_key" ON "ManagementMeetingRiskItem"("managementMeetingId", "riskItemId");
