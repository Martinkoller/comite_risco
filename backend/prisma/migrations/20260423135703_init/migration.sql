-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "ProductOwner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductOwner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EventSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EventType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Severity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CommitteeStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ActionStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RiskItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "weekReference" TEXT NOT NULL,
    "dateIdentified" DATETIME NOT NULL,
    "monitoringResponsible" TEXT NOT NULL,
    "eventSourceId" INTEGER NOT NULL,
    "eventTypeId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "officialDeadline" DATETIME,
    "preliminarySeverityId" INTEGER,
    "requiresPoAnalysis" BOOLEAN NOT NULL DEFAULT true,
    "monitoringStatus" TEXT NOT NULL DEFAULT 'Identificado',
    "initialNotes" TEXT,
    "isFastTrack" BOOLEAN NOT NULL DEFAULT false,
    "fastTrackReason" TEXT,
    "directorNotifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RiskItem_eventSourceId_fkey" FOREIGN KEY ("eventSourceId") REFERENCES "EventSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RiskItem_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RiskItem_preliminarySeverityId_fkey" FOREIGN KEY ("preliminarySeverityId") REFERENCES "Severity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RiskItemProduct" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "riskItemId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RiskItemProduct_riskItemId_fkey" FOREIGN KEY ("riskItemId") REFERENCES "RiskItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RiskItemProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "POAnalysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "riskItemId" INTEGER NOT NULL,
    "analysisDate" DATETIME NOT NULL,
    "poResponsible" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "impactsProduct" TEXT NOT NULL,
    "impactType" TEXT NOT NULL,
    "impactLevel" TEXT NOT NULL,
    "needsImplementation" TEXT NOT NULL,
    "nonComplianceRisk" BOOLEAN NOT NULL DEFAULT false,
    "operationalRisk" BOOLEAN NOT NULL DEFAULT false,
    "customerImpact" BOOLEAN NOT NULL DEFAULT false,
    "dependencies" TEXT,
    "doubtsAmbiguities" TEXT,
    "needsLegalReview" TEXT NOT NULL,
    "suggestedSeverityId" INTEGER,
    "recommendation" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "POAnalysis_riskItemId_fkey" FOREIGN KEY ("riskItemId") REFERENCES "RiskItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "POAnalysis_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "POAnalysis_suggestedSeverityId_fkey" FOREIGN KEY ("suggestedSeverityId") REFERENCES "Severity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CommitteeDecision" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "riskItemId" INTEGER NOT NULL,
    "meetingDate" DATETIME NOT NULL,
    "finalSeverityId" INTEGER NOT NULL,
    "impactedProducts" TEXT NOT NULL,
    "involvedPos" TEXT NOT NULL,
    "supportImpact" TEXT NOT NULL,
    "csImpact" TEXT NOT NULL,
    "marketingImpact" TEXT NOT NULL,
    "legalTriggered" BOOLEAN NOT NULL DEFAULT false,
    "decisionText" TEXT NOT NULL,
    "hasAction" BOOLEAN NOT NULL DEFAULT false,
    "hasActionPlan" BOOLEAN NOT NULL DEFAULT false,
    "goesToDirection" BOOLEAN NOT NULL DEFAULT false,
    "mainResponsible" TEXT NOT NULL,
    "initialDeadline" DATETIME,
    "committeeStatusId" INTEGER NOT NULL,
    "submittedToDirectionAt" DATETIME,
    "directionApproved" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CommitteeDecision_riskItemId_fkey" FOREIGN KEY ("riskItemId") REFERENCES "RiskItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CommitteeDecision_finalSeverityId_fkey" FOREIGN KEY ("finalSeverityId") REFERENCES "Severity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CommitteeDecision_committeeStatusId_fkey" FOREIGN KEY ("committeeStatusId") REFERENCES "CommitteeStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActionPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "riskItemId" INTEGER NOT NULL,
    "theme" TEXT NOT NULL,
    "responsibleArea" TEXT NOT NULL,
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
    CONSTRAINT "ActionPlan_actionStatusId_fkey" FOREIGN KEY ("actionStatusId") REFERENCES "ActionStatus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DirectionReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "riskItemId" INTEGER NOT NULL,
    "submittedAt" DATETIME NOT NULL,
    "reviewedAt" DATETIME,
    "approvalStatus" TEXT NOT NULL,
    "requiresAdjustment" BOOLEAN NOT NULL DEFAULT false,
    "directionNotes" TEXT,
    "directorName" TEXT NOT NULL DEFAULT 'Marcelo Stivanello',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DirectionReview_riskItemId_fkey" FOREIGN KEY ("riskItemId") REFERENCES "RiskItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "riskItemId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TimelineEvent_riskItemId_fkey" FOREIGN KEY ("riskItemId") REFERENCES "RiskItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TimelineEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_name_key" ON "Participant"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOwner_name_key" ON "ProductOwner"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EventSource_name_key" ON "EventSource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EventType_name_key" ON "EventType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Severity_code_key" ON "Severity"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeStatus_name_key" ON "CommitteeStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ActionStatus_name_key" ON "ActionStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RiskItem_code_key" ON "RiskItem"("code");

-- CreateIndex
CREATE INDEX "RiskItem_code_idx" ON "RiskItem"("code");

-- CreateIndex
CREATE INDEX "RiskItem_weekReference_idx" ON "RiskItem"("weekReference");

-- CreateIndex
CREATE INDEX "RiskItem_monitoringStatus_idx" ON "RiskItem"("monitoringStatus");

-- CreateIndex
CREATE INDEX "RiskItem_isFastTrack_idx" ON "RiskItem"("isFastTrack");

-- CreateIndex
CREATE INDEX "RiskItemProduct_riskItemId_idx" ON "RiskItemProduct"("riskItemId");

-- CreateIndex
CREATE INDEX "RiskItemProduct_productId_idx" ON "RiskItemProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "RiskItemProduct_riskItemId_productId_key" ON "RiskItemProduct"("riskItemId", "productId");

-- CreateIndex
CREATE INDEX "POAnalysis_riskItemId_idx" ON "POAnalysis"("riskItemId");

-- CreateIndex
CREATE INDEX "POAnalysis_productId_idx" ON "POAnalysis"("productId");

-- CreateIndex
CREATE INDEX "POAnalysis_analysisDate_idx" ON "POAnalysis"("analysisDate");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeDecision_riskItemId_key" ON "CommitteeDecision"("riskItemId");

-- CreateIndex
CREATE INDEX "CommitteeDecision_riskItemId_idx" ON "CommitteeDecision"("riskItemId");

-- CreateIndex
CREATE INDEX "CommitteeDecision_meetingDate_idx" ON "CommitteeDecision"("meetingDate");

-- CreateIndex
CREATE INDEX "CommitteeDecision_goesToDirection_idx" ON "CommitteeDecision"("goesToDirection");

-- CreateIndex
CREATE UNIQUE INDEX "ActionPlan_code_key" ON "ActionPlan"("code");

-- CreateIndex
CREATE INDEX "ActionPlan_code_idx" ON "ActionPlan"("code");

-- CreateIndex
CREATE INDEX "ActionPlan_riskItemId_idx" ON "ActionPlan"("riskItemId");

-- CreateIndex
CREATE INDEX "ActionPlan_actionStatusId_idx" ON "ActionPlan"("actionStatusId");

-- CreateIndex
CREATE INDEX "ActionPlan_deadline_idx" ON "ActionPlan"("deadline");

-- CreateIndex
CREATE INDEX "DirectionReview_riskItemId_idx" ON "DirectionReview"("riskItemId");

-- CreateIndex
CREATE INDEX "DirectionReview_approvalStatus_idx" ON "DirectionReview"("approvalStatus");

-- CreateIndex
CREATE INDEX "TimelineEvent_riskItemId_idx" ON "TimelineEvent"("riskItemId");

-- CreateIndex
CREATE INDEX "TimelineEvent_eventDate_idx" ON "TimelineEvent"("eventDate");
