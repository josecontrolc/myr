import { Request, Response, NextFunction } from 'express';

export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const adminSecret = req.headers['x-admin-secret'];
  
  if (adminSecret === process.env.ADMIN_SECRET) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Invalid admin credentials' });
  }
};
