import { Response } from 'express';

/** Send a JSON error response with the given status and message. */
export function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ error: message });
}
