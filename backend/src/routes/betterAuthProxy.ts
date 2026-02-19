import express, { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { auth } from '../lib/auth';

const router = express.Router();

/**
 * Proxies all unmatched /api/auth/* requests to Better Auth handler.
 * Normalizes 4xx/5xx responses to JSON so clients can show message/error.
 */
export async function betterAuthProxyHandler(req: ExpressRequest, res: ExpressResponse): Promise<void> {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    // Use originalUrl so Better Auth receives /api/auth/get-session, not just /get-session
    const url = `${protocol}://${host}${req.originalUrl}`;

    const bodyString =
      req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined;

    // Web API Request (fetch), not Express Request
    const webRequest = new Request(url, {
      method: req.method,
      headers: new Headers(req.headers as Record<string, string>),
      body: bodyString,
    });

    const response = await auth.handler(webRequest);
    const body = await response.text();

    res.status(response.status);
    // Forward all headers; Set-Cookie must be forwarded as an array so we don't lose
    // the cookie-clear header on sign-out (forEach would overwrite with a single value).
    const setCookieValues =
      typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : [];
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'set-cookie') res.setHeader(key, value);
    });
    if (setCookieValues.length > 0) {
      res.setHeader('Set-Cookie', setCookieValues);
    }

    if (response.status >= 400) {
      let json: { message?: string; error?: string } | null = null;
      if (body.trim()) {
        try {
          json = JSON.parse(body) as { message?: string; error?: string };
        } catch {
          /* body is not JSON */
        }
      }
      const message = (json?.message ?? json?.error ?? body) || response.statusText;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Auth-Error-Normalized', '1');
      res.json({ error: message, message });
      return;
    }

    res.send(body);
  } catch (error) {
    console.error('Auth handler error:', error);
    res.setHeader('X-Auth-Error-Normalized', '1');
    res.status(500).json({ error: 'Authentication error', message: (error as Error).message });
  }
}

router.all('*', (req, res, next) => {
  betterAuthProxyHandler(req, res).catch(next);
});

export default router;
