import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? '';
if (ADMIN_SECRET.length < 32) {
  throw new Error('ADMIN_SECRET must be set and at least 32 characters long');
}

export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const adminSecret = req.headers['x-admin-secret'];

  if (
    typeof adminSecret !== 'string' ||
    adminSecret.length !== ADMIN_SECRET.length ||
    !crypto.timingSafeEqual(Buffer.from(adminSecret), Buffer.from(ADMIN_SECRET))
  ) {
    res.status(403).json({ error: 'Forbidden: Invalid admin credentials' });
    return;
  }

  next();
};
