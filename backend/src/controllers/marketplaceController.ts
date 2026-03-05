import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

const schema = z.object({
  serviceType: z.enum([
    'WEB_APP_PENTEST',
    'API_SECURITY_ASSESSMENT',
    'NETWORK_PENTEST',
    'CLOUD_SECURITY_ASSESSMENT',
    'RED_TEAM_ENGAGEMENT',
  ]),
  notes: z.string().min(3),
});

export const createServiceRequest = async (req: Request, res: Response) => {
  if (!req.user?.organizationId) return res.status(403).json({ message: 'Organization required' });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const created = await prisma.serviceRequest.create({
    data: {
      ...parsed.data,
      organizationId: req.user.organizationId,
    },
  });

  return res.status(201).json(created);
};

export const listServiceRequests = async (req: Request, res: Response) => {
  const requests = await prisma.serviceRequest.findMany({ where: { organizationId: req.user?.organizationId } });
  return res.json(requests);
};
