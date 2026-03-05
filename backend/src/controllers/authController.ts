import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { logAudit } from '../services/auditService';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10),
  name: z.string().min(2),
  role: z.enum(['PLATFORM_ADMIN', 'ORG_ADMIN', 'SECURITY_CONSULTANT', 'DEVELOPER', 'CLIENT_USER', 'AUDITOR']),
  organizationId: z.string().optional(),
});

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error.flatten());
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ message: 'User already exists' });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: { ...parsed.data, passwordHash },
  });

  await logAudit('USER_REGISTERED', { email: user.email, role: user.role }, user.id, user.organizationId || undefined);
  return res.status(201).json({ id: user.id, email: user.email });
};

export const login = async (req: Request, res: Response) => {
  const schema = z.object({ email: z.string().email(), password: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { userId: user.id, role: user.role, organizationId: user.organizationId || undefined },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  await logAudit('USER_LOGIN', { email: user.email }, user.id, user.organizationId || undefined);
  return res.json({ token, user: { id: user.id, role: user.role, organizationId: user.organizationId } });
};
