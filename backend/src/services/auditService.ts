import { prisma } from '../utils/prisma';

export const logAudit = async (action: string, metadata: unknown, userId?: string, organizationId?: string) => {
  await prisma.auditLog.create({
    data: {
      action,
      metadata: JSON.stringify(metadata),
      userId,
      organizationId,
    },
  });
};
