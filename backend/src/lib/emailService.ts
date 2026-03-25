const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL ?? 'http://email_service:3001';
const EMAIL_SERVICE_SECRET = process.env.EMAIL_SERVICE_SECRET ?? '';

function serviceHeaders(): Record<string, string> {
  if (!EMAIL_SERVICE_SECRET) {
    throw new Error('EMAIL_SERVICE_SECRET is not configured');
  }
  return {
    'Content-Type': 'application/json',
    'X-Service-Secret': EMAIL_SERVICE_SECRET,
  };
}

/**
 * Sends a 2FA OTP code to the given email address via the dedicated email microservice.
 * Throws if the email service returns a non-OK response.
 */
export async function sendOtp(to: string, code: string, expiresInMinutes = 10): Promise<void> {
  const response = await fetch(`${EMAIL_SERVICE_URL}/send-otp`, {
    method: 'POST',
    headers: serviceHeaders(),
    body: JSON.stringify({ to, code, expiresInMinutes }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email service responded with ${response.status}: ${body}`);
  }
}

/**
 * Sends a password reset email with a clickable link via the dedicated email microservice.
 * Throws if the email service returns a non-OK response.
 */
export async function sendPasswordReset(to: string, resetLink: string, expiresInMinutes = 60): Promise<void> {
  const response = await fetch(`${EMAIL_SERVICE_URL}/send-password-reset`, {
    method: 'POST',
    headers: serviceHeaders(),
    body: JSON.stringify({ to, resetLink, expiresInMinutes }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email service responded with ${response.status}: ${body}`);
  }
}
