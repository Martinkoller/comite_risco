import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generates a CR code (Comitê de Risco) in format CR-AAAA-NNN
 * @param {number} year - The year for the code (default: current year)
 * @returns {Promise<string>} The generated CR code
 */
export async function generateCRCode(year = new Date().getFullYear()) {
  const prefix = `CR-${year}`;
  
  // Find the highest existing CR code for this year
  const lastItem = await prisma.riskItem.findFirst({
    where: {
      code: {
        startsWith: prefix,
      },
    },
    orderBy: {
      code: 'desc',
    },
  });

  let nextNumber = 1;
  if (lastItem) {
    // Extract the number from the last code (e.g., CR-2026-001 -> 001)
    const lastCode = lastItem.code;
    const lastNumber = parseInt(lastCode.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }

  // Format with leading zeros (3 digits)
  const formattedNumber = nextNumber.toString().padStart(3, '0');
  return `${prefix}-${formattedNumber}`;
}

/**
 * Generates a PA code (Plano de Ação) in format PA-AAAA-NNN
 * @param {number} year - The year for the code (default: current year)
 * @returns {Promise<string>} The generated PA code
 */
export async function generatePACode(year = new Date().getFullYear()) {
  const prefix = `PA-${year}`;
  
  // Find the highest existing PA code for this year
  const lastPlan = await prisma.actionPlan.findFirst({
    where: {
      code: {
        startsWith: prefix,
      },
    },
    orderBy: {
      code: 'desc',
    },
  });

  let nextNumber = 1;
  if (lastPlan) {
    // Extract the number from the last code (e.g., PA-2026-001 -> 001)
    const lastCode = lastPlan.code;
    const lastNumber = parseInt(lastCode.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }

  // Format with leading zeros (3 digits)
  const formattedNumber = nextNumber.toString().padStart(3, '0');
  return `${prefix}-${formattedNumber}`;
}
