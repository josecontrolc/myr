import prisma from '../lib/prisma';

export const createAuditLog = async (
  action: string,
  userId: string | null,
  details: any
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId,
        details,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to prevent blocking the main operation
  }
};
