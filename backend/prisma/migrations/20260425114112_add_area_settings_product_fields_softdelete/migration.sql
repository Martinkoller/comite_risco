/*
  Warnings:

  - You are about to drop the column `responsibleArea` on the `ActionPlan` table. All the data in the column will be lost.
  - Added the required column `areaId` to the `ActionPlan` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RiskItem_weekReference_idx";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "platform" TEXT;
ALTER TABLE "Product" ADD COLUMN "segment" TEXT;

-- AlterTable
ALTER TABLE "RiskItem" ADD COLUMN "deletedAt" DATETIME;

-- CreateTable
CREATE TABLE "Area" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActionPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "riskItemId" INTEGER NOT NULL,
    "theme" TEXT NOT NULL,
    "areaId" INTEGER NOT NULL,
    "responsibleName" TEXT NOT NULL,
    "actionDescription" TEXT NOT NULL,
    "dependencies" TEXT,
    "openedAt" DATETIME NOT NULL,
    "deadline" DATETIME NOT NULL,
    "actionStatusId" INTEGER NOT NULL,
    "directionApprovedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActionPlan_riskItemId_fkey" FOREIGN KEY ("riskItemId") REFERENCES "RiskItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActionPlan_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ActionPlan_actionStatusId_fkey" FOREIGN KEY ("actionStatusId") REFERENCES "ActionStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ActionPlan" ("actionDescription", "actionStatusId", "code", "createdAt", "deadline", "dependencies", "directionApprovedAt", "id", "notes", "openedAt", "responsibleName", "riskItemId", "theme", "updatedAt") SELECT "actionDescription", "actionStatusId", "code", "createdAt", "deadline", "dependencies", "directionApprovedAt", "id", "notes", "openedAt", "responsibleName", "riskItemId", "theme", "updatedAt" FROM "ActionPlan";
DROP TABLE "ActionPlan";
ALTER TABLE "new_ActionPlan" RENAME TO "ActionPlan";
CREATE UNIQUE INDEX "ActionPlan_code_key" ON "ActionPlan"("code");
CREATE INDEX "ActionPlan_code_idx" ON "ActionPlan"("code");
CREATE INDEX "ActionPlan_riskItemId_idx" ON "ActionPlan"("riskItemId");
CREATE INDEX "ActionPlan_areaId_idx" ON "ActionPlan"("areaId");
CREATE INDEX "ActionPlan_actionStatusId_idx" ON "ActionPlan"("actionStatusId");
CREATE INDEX "ActionPlan_deadline_idx" ON "ActionPlan"("deadline");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Area_name_key" ON "Area"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE INDEX "RiskItem_deletedAt_idx" ON "RiskItem"("deletedAt");
