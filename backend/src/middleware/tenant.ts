import { Request, Response, NextFunction } from 'express';

export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role === 'PLATFORM_ADMIN') {
    return next();
  }

  if (!req.user?.organizationId) {
    return res.status(403).json({ message: 'Organization context required' });
  }

  return next();
};
