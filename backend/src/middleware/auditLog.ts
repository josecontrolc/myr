import prisma from '../lib/prisma';

/**
 * Creates an audit log entry. organizationId is optional and should be
 * provided for all org-scoped operations so they can be filtered later.
 */
export const createAuditLog = async (
  action: string,
  userId: string | null,
  details: unknown,
  organizationId?: string | null
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId,
        organizationId: organizationId ?? null,
        details: details as any,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw — audit failures must never block the main operation
  }
};
