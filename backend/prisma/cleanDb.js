import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning database...')

  // Clean all test data in correct order (respecting foreign keys)
  await prisma.timelineEvent.deleteMany()
  await prisma.action.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.managementMeetingRiskItem.deleteMany()
  await prisma.managementMeeting.deleteMany()
  await prisma.actionPlan.deleteMany()
  await prisma.directionReview.deleteMany()
  await prisma.committeeDecision.deleteMany()
  await prisma.pOAnalysis.deleteMany()
  await prisma.riskItemProduct.deleteMany()
  await prisma.riskItem.deleteMany()

  console.log('✅ Database cleaned successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error cleaning database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
